-- ============================================================
-- Obtanet — Welche Bündel warten auf den Schlusspunkt?
--
-- `bundles.completed_at` (Migration 31) sagt, dass geliefert und
-- abgerechnet ist. Niemand setzt es automatisch: solange es fehlt, gilt
-- ein Bündel als laufend, und alle Beteiligten bleiben gebunden — sie
-- können ihr Konto nicht schliessen und nicht austreten.
--
-- Diese Abfrage zeigt, was noch offen ist. Im Supabase-SQL-Editor
-- ausführen, sie liest nur.
--
-- Abschliessen:
--     UPDATE bundles SET completed_at = NOW() WHERE id = '<uuid>';
--
-- Später übernimmt das der Lieferschein-Abgleich (#22).
-- ============================================================
SELECT
    b.id,
    b.title                                            AS buendel,
    b.status,
    CASE WHEN b.deadline > NOW()
         THEN 'läuft noch'
         ELSE 'Frist vor ' || EXTRACT(DAY FROM date_trunc('day', NOW() - b.deadline))::int || ' Tagen'
    END                                                AS frist,
    b.current_volume || ' ' || b.unit                  AS volumen,
    (SELECT count(*) FROM bundle_participations p
      WHERE p.bundle_id = b.id
        AND COALESCE(p.status,'PENDING') <> 'CANCELLED') AS gebundene_firmen,
    CASE WHEN b.awarded_supplier_id IS NOT NULL THEN 1 ELSE 0 END
                                                       AS plus_werk_mit_zuschlag
  FROM bundles b
 WHERE b.status IN ('OPEN', 'SEALED_BIDDING', 'AWARDED')
   AND b.completed_at IS NULL
 ORDER BY b.deadline;
