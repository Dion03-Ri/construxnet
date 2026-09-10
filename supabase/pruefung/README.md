# Migrationen prüfen, bevor sie in Supabase gehen

```
bash supabase/pruefung/aufsetzen.sh
```

Baut eine Wegwerf-Datenbank (PostgreSQL 16, `/tmp/obtanet-pruefung`) und
spielt **alle** Migrationen aus `supabase/migrations/` der Reihe nach ein.
Bricht beim ersten Fehler ab und nennt die Datei.

Danach:

```
psql -h /tmp/obtanet-pruefung -p 5605 -U pgtest -d postgres
```

Als Firma anmelden — `current_company_id()` liest `auth.jwt() ->> 'sub'`,
und der Stub holt das aus einer Sitzungsvariablen:

```sql
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL "test.jwt" = '{"sub":"user_a"}';
SELECT * FROM chat_threads();
COMMIT;
```

`stubs.sql` ersetzt, was Supabase mitbringt und ein nacktes Postgres nicht:
die Rollen `anon`/`authenticated`/`service_role`, `auth.jwt()`, das Schema
`storage` mit den drei Pfadfunktionen, und die Publikation
`supabase_realtime`.

## Ist in Supabase wirklich alles drin?

`kontrolle.sql` im Supabase-SQL-Editor ausfuehren. Liest nur, aendert
nichts, und gibt sechsunddreissig Zeilen zurueck — alle muessen `ok` sagen.
Steht irgendwo `FEHLT`, ist die zugehoerige Migration nicht oder nur
teilweise eingespielt.

Die Abfrage ist gegengeprueft: mit absichtlich entfernter Funktion,
geloeschter Spalte und auf CASCADE zurueckgedrehtem Fremdschluessel
meldet sie genau diese drei als `FEHLT`. Eine Kontrolle, die immer `ok`
sagt, waere schlimmer als keine.

## Welche Bündel warten auf den Schlusspunkt?

`offene_buendel.sql` im Supabase-SQL-Editor ausfuehren. Zeigt jedes
Buendel, das noch als laufend gilt, samt Frist und Zahl der gebundenen
Firmen. `bundles.completed_at` (Migration 31) setzt heute niemand
automatisch — solange es fehlt, koennen die Beteiligten ihr Konto nicht
schliessen und nicht austreten:

```sql
UPDATE bundles SET completed_at = NOW() WHERE id = '<uuid>';
```

Spaeter uebernimmt das der Lieferschein-Abgleich (#22).

## Warum es das gibt

Migration 30 ging beim Auftraggeber nicht durch: sie hängte einen
Fremdschlüssel an `direct_offers.buyer_company_id` — eine Spalte, die es
nicht gibt. Der Besteller steht auf `direct_requests`, nicht auf dem
Angebot.

Geprüft war die Migration vorher trotzdem, nur eben gegen ein von Hand
nachgebautes Schema, in dem ich diese Spalte erfunden hatte. Der Test lief
gegen eine Fiktion und konnte den Fehler nicht finden.

**Also: keine nachgebauten Schemata mehr.** Die Prüfdatenbank kommt aus
den echten Migrationen, sonst prüft man seine eigenen Annahmen.
