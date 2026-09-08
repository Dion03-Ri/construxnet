-- ============================================================
-- RATENBEGRENZUNG UEBER EINEN GEMEINSAMEN SPEICHER
--
-- Die bisherige Begrenzung lag im Arbeitsspeicher. Auf Vercel laeuft
-- jede Instanz fuer sich, und Instanzen kommen und gehen — wer das
-- Passwort durchprobiert, bekommt bei jeder neuen Instanz zehn frische
-- Versuche. Damit war die Grenze eine Bremse, kein Schutz.
--
-- Kein neuer Dienst: eine Tabelle in Supabase reicht. Ein Redis waere
-- schneller, kostet aber ein weiteres Konto, weitere Zugangsdaten und
-- eine weitere Sache, die ausfallen kann.
--
-- Die Tabelle hat KEINE RLS-Regel — damit kommt weder anon noch
-- authenticated heran. Geschrieben wird ausschliesslich ueber die
-- Funktion unten (SECURITY DEFINER), aufgerufen vom Server mit dem
-- Dienstschluessel.
-- ============================================================

CREATE TABLE IF NOT EXISTS rate_limits (
    key       TEXT PRIMARY KEY,
    count     INTEGER NOT NULL DEFAULT 0,
    reset_at  TIMESTAMPTZ NOT NULL
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
-- Absichtlich keine Policy: ohne Policy erlaubt RLS niemandem etwas.

CREATE INDEX IF NOT EXISTS rate_limits_reset_idx ON rate_limits (reset_at);

-- ------------------------------------------------------------
-- Einen Versuch zaehlen.
--
-- Alles in EINER Anweisung — sonst koennten zwei gleichzeitige Anfragen
-- beide den alten Stand lesen und beide durchkommen. `ON CONFLICT DO
-- UPDATE` sperrt die Zeile, das Fenster wird beim Ueberlaufen in
-- derselben Anweisung neu gesetzt.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION rate_hit(p_key TEXT, p_max INTEGER, p_window_ms INTEGER)
RETURNS TABLE (ok BOOLEAN, retry_after_sec INTEGER)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_count INTEGER;
    v_reset TIMESTAMPTZ;
    v_fenster INTERVAL := make_interval(secs => p_window_ms / 1000.0);
BEGIN
    INSERT INTO rate_limits (key, count, reset_at)
         VALUES (p_key, 1, NOW() + v_fenster)
    ON CONFLICT (key) DO UPDATE
            SET count = CASE WHEN rate_limits.reset_at <= NOW() THEN 1
                             ELSE rate_limits.count + 1 END,
                reset_at = CASE WHEN rate_limits.reset_at <= NOW() THEN NOW() + v_fenster
                                ELSE rate_limits.reset_at END
      RETURNING rate_limits.count, rate_limits.reset_at INTO v_count, v_reset;

    -- Aufraeumen nebenbei, ungefaehr bei jedem hundertsten Aufruf. Ein
    -- Zeitgeber waere sauberer, braucht aber eine Erweiterung; abgelaufene
    -- Zeilen schaden nicht, sie sollen nur nicht ewig liegenbleiben.
    IF random() < 0.01 THEN
        DELETE FROM rate_limits WHERE reset_at < NOW() - INTERVAL '1 day';
    END IF;

    RETURN QUERY SELECT
        v_count <= p_max,
        GREATEST(0, CEIL(EXTRACT(EPOCH FROM (v_reset - NOW())))::INTEGER);
END;
$$;

-- Nur der Dienstschluessel ruft das auf; anon/authenticated brauchen es nicht.
REVOKE ALL ON FUNCTION rate_hit(TEXT, INTEGER, INTEGER) FROM PUBLIC;
