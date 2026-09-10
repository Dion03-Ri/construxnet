"use client";

import { useEffect } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Live-Verkabelung an einer Stelle.
 *
 * Die Seite lud überall genau einmal beim Aufbau: eine Anfrage, die danach
 * eintraf, ein Standort, der danach gesetzt wurde, eine Nachricht, die
 * danach kam — alles war erst nach einem Neuladen zu sehen. Das war der
 * Fehler, über den der Auftraggeber gestolpert ist, und er steckte in
 * jedem Bildschirm einzeln. Statt ihn dreimal zu flicken, steht die
 * Verkabelung jetzt hier.
 *
 * Zwei Regeln, die dabei gelten:
 *
 *   **Nur INSERT und UPDATE.** Für gelöschte Zeilen prüft Supabase keine
 *   Zeilenregel — ein DELETE-Ereignis geht an jeden Zuhörer. Solange die
 *   Tabelle keine volle Replica-Identität hat, trägt es nur den
 *   Primärschlüssel und verrät nichts; deshalb wird darauf gar nicht erst
 *   gehorcht. Löschungen fängt `useFrischBeiRueckkehr` ab.
 *
 *   **Die Zeilenregeln gelten weiter.** Supabase prüft jedes Ereignis
 *   gegen die Regel des Zuhörers. Es kommt also nur an, was diese Firma
 *   ohnehin lesen dürfte.
 *
 * Wichtig: `laden` sollte eine stabile Funktion sein (`useCallback`).
 * Wechselt sie bei jedem Rendern, wird der Kanal jedes Mal neu aufgebaut.
 */
export function useLive(
  supabase: SupabaseClient,
  kanalName: string,
  tabellen: string[],
  laden: () => void,
  aktiv = true,
) {
  // Die Liste ist bei jedem Rendern ein neues Feld; verglichen wird ihr
  // Inhalt, sonst risse der Kanal bei jedem Durchlauf ab.
  const schluessel = tabellen.join(",");

  useEffect(() => {
    if (!aktiv || schluessel === "") return;
    const kanal = supabase.channel(kanalName);
    for (const tabelle of schluessel.split(",")) {
      kanal
        .on("postgres_changes", { event: "INSERT", schema: "public", table: tabelle }, () => laden())
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: tabelle }, () => laden());
    }
    kanal.subscribe();
    return () => {
      void supabase.removeChannel(kanal);
    };
  }, [supabase, kanalName, schluessel, laden, aktiv]);
}

/**
 * Wer den Tab zurückholt, soll den Stand von jetzt sehen.
 *
 * Das ist der Auffangnetz-Teil: eine abgerissene Verbindung, ein Gerät aus
 * dem Ruhezustand, und die Löschungen, auf die oben bewusst nicht gehorcht
 * wird.
 */
export function useFrischBeiRueckkehr(laden: () => void) {
  useEffect(() => {
    function frisch() {
      if (document.visibilityState === "visible") laden();
    }
    document.addEventListener("visibilitychange", frisch);
    window.addEventListener("focus", frisch);
    return () => {
      document.removeEventListener("visibilitychange", frisch);
      window.removeEventListener("focus", frisch);
    };
  }, [laden]);
}
