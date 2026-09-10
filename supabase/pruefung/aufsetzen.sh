#!/usr/bin/env bash
# Eine Wegwerf-Datenbank aus den ECHTEN Migrationen.
#
# Der Grund für dieses Skript: Migration 30 ging beim Auftraggeber nicht
# durch, weil ich das Schema von `direct_offers` für den Test von Hand
# nachgebaut und dabei eine Spalte erfunden hatte, die es nicht gibt. Der
# Test lief gegen eine Fiktion und war deshalb wertlos.
#
# Ab jetzt wird die Prüfdatenbank aus supabase/migrations/ gebaut. Was hier
# durchläuft, läuft auch in Supabase.
#
#   bash supabase/pruefung/aufsetzen.sh [PORT]
#   psql -h /tmp/obtanet-pruefung -p 5605 -U pgtest -d postgres
set -euo pipefail

PORT="${1:-5605}"
DIR=/tmp/obtanet-pruefung
BIN=/usr/lib/postgresql/16/bin
HIER="$(cd "$(dirname "$0")" && pwd)"

id pgtest >/dev/null 2>&1 || useradd -m pgtest
rm -rf "$DIR"; mkdir -p "$DIR"; chown pgtest "$DIR"
su pgtest -c "PATH=$BIN:\$PATH initdb -D $DIR/data -U pgtest -A trust" >/dev/null
su pgtest -c "PATH=$BIN:\$PATH pg_ctl -D $DIR/data -o '-p $PORT -k $DIR' -l $DIR/log start" >/dev/null
sleep 1

# psql beendet sich mit ON_ERROR_STOP von selbst mit einem Fehlercode —
# darauf wird geprüft. NICHT auf die Ausgabe von grep: grep meldet "nichts
# gefunden" ebenfalls als Fehlercode, und dann ist der geglückte Lauf der
# vermeintliche Fehler.
lauf() {
  su pgtest -c "PATH=$BIN:\$PATH psql -h $DIR -p $PORT -U pgtest -d postgres -q -v ON_ERROR_STOP=1 -f $1" 2>&1
}

lauf "$HIER/stubs.sql" >/dev/null
for f in $(ls "$HIER"/../migrations/*.sql | sort -V); do
  if ausgabe=$(lauf "$f"); then
    echo "ok  $(basename "$f")"
  else
    echo "FEHLER in $(basename "$f")"
    echo "$ausgabe" | grep -viE "^$|NOTICE" | tail -5
    exit 1
  fi
done
echo
echo "Bereit:  psql -h $DIR -p $PORT -U pgtest -d postgres"
echo "Anmelden im Test:  SET LOCAL \"test.jwt\" = '{\"sub\":\"user_a\"}';"
