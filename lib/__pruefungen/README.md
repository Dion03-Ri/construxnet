# Prüfungen ohne Testläufer

Das Projekt hat keinen Testläufer, und für eine Handvoll reiner Funktionen
braucht es auch keinen. Was hier liegt, läuft direkt:

```
npx tsx lib/__pruefungen/chat.mts
```

`chat.mts` prüft `lib/chat.ts` — die Rechenteile des Chats: wie aus den
Zeilen von `chat_threads()` die Gesprächsliste wird, wie ein nachgeladenes
Fenster in den vorhandenen Verlauf kommt, und was in welcher Ansicht steht.

Die Seite selbst lässt sich hier nicht im Browser prüfen: Chromium kommt in
dieser Umgebung an keinen lokalen Server. Deshalb stehen die Rechenteile in
einer eigenen Datei — was man nicht einzeln aufrufen kann, prüft man auch
nicht einzeln.

Die Datenbankseite (`supabase/migrations/29_chat_threads.sql`) wurde gegen
ein echtes PostgreSQL 16 geprüft: Blättern, Archiv, das Zurückkommen eines
weggelegten Gesprächs bei neuer Nachricht, und die Abschottung — eine dritte
Firma bekommt weder die Liste noch den Verlauf der beiden anderen.
