"use client";

import { useEffect } from "react";

/**
 * Entfernt verwaiste Service Worker und Cache-Storage-Einträge aus früheren
 * Deploys. Ein einmal (z. B. durch ein früheres Template oder eine
 * Abhängigkeit) registrierter Service Worker überlebt selbst harte Reloads und
 * liefert alte Assets aus — das ist die klassische Ursache dafür, dass neue
 * Deploys erst nach „Inkognito" sichtbar werden. Dieser Cleanup läuft einmal
 * pro Browser und ist ein No-Op, wenn nichts registriert ist.
 */
export default function CacheBuster() {
  useEffect(() => {
    // Alte Cache-Storage-Einträge löschen (ohne Reload — sie füllen sich ohne
    // Service Worker ohnehin nicht wieder).
    try {
      if (typeof caches !== "undefined" && caches.keys) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
      }
    } catch {
      /* ignore */
    }

    // Verwaiste Service Worker deregistrieren. Fand sich einer, einmalig neu
    // laden, damit sofort die frische Version erscheint (gegen Endlos-Loop per
    // sessionStorage-Flag abgesichert).
    try {
      if ("serviceWorker" in navigator && navigator.serviceWorker.getRegistrations) {
        navigator.serviceWorker
          .getRegistrations()
          .then((regs) => {
            if (regs.length === 0) return;
            Promise.all(regs.map((r) => r.unregister())).then(() => {
              let alreadyCleared = false;
              try {
                alreadyCleared = sessionStorage.getItem("cnx-sw-cleared") === "1";
                sessionStorage.setItem("cnx-sw-cleared", "1");
              } catch {
                /* Storage gesperrt — dann ohne Reload */
              }
              if (!alreadyCleared) window.location.reload();
            });
          })
          .catch(() => {});
      }
    } catch {
      /* ignore */
    }
  }, []);

  return null;
}
