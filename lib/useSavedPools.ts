"use client";

import { useCallback, useEffect, useState } from "react";
/**
 * Schlüssel im Browser-Speicher. Der Wert hat sich mit dem Umstieg auf
 * echte Bündel geändert: früher standen dort Beispiel-IDs wie "p1", jetzt
 * Bündel-UUIDs. Der neue Schlüssel sorgt dafür, dass alte Merklisten
 * nicht als tote Einträge weiterleben.
 */
const SAVED_POOLS_KEY = "obtanet.saved-bundles.v2";

/**
 * Gespeicherte Pools pro Browser (localStorage). Bewusst leichtgewichtig:
 * eine echte Merkliste ohne Backend, robust gegen fehlenden/gesperrten Storage.
 */
export function useSavedPools() {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_POOLS_KEY);
      if (raw) setIds(JSON.parse(raw) as string[]);
    } catch {
      /* Storage nicht verfügbar */
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: string[]) => {
    setIds(next);
    try {
      localStorage.setItem(SAVED_POOLS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(
    (id: string) => {
      persist(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
    },
    [ids, persist],
  );

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, ready, toggle, has };
}
