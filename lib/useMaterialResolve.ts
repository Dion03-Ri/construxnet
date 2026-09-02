"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { materialById, type ProcMaterial } from "@/data/procurement";
import {
  matchMaterial,
  normalize,
  CERTAIN,
  WORTH_SHOWING,
  type MatchResult,
} from "@/lib/materialMatch";

export type Resolution = {
  /** Vorschläge, bester zuerst. Leer heisst: wirklich etwas Neues. */
  candidates: MatchResult[];
  /** Kam der beste Vorschlag aus einer bereits bestätigten Zuordnung? */
  fromAlias: boolean;
  /** Sicher genug, um ohne Rückfrage zu setzen. */
  certain: boolean;
  loading: boolean;
};

const EMPTY: Resolution = { candidates: [], fromAlias: false, certain: false, loading: false };

/**
 * Freie Eingabe auf Katalogmaterialien bringen.
 *
 * Reihenfolge, von billig nach teuer:
 *   1. Alias-Nachschlag — jemand hat diesen Begriff schon einmal zugeordnet
 *   2. Deterministischer Abgleich über Normbezeichnung und Wortüberschneidung
 *   3. KI — noch nicht angebunden; hier ist die Stelle dafür
 *
 * Entschieden wird nie automatisch: auch ein sicherer Treffer wird
 * vorgeschlagen und nicht gesetzt. Eine still umgebogene Position wäre
 * schlimmer als eine doppelte, weil sie niemand bemerkt.
 */
export function useMaterialResolve(input: string, delay = 250): Resolution {
  const supabase = useSupabaseBrowser();
  const [state, setState] = useState<Resolution>(EMPTY);
  const seq = useRef(0);

  const resolve = useCallback(
    async (raw: string) => {
      const norm = normalize(raw);
      if (norm.length < 3) {
        setState(EMPTY);
        return;
      }
      const mine = ++seq.current;
      setState((s) => ({ ...s, loading: true }));

      // 1. Alias — eine bestätigte Zuordnung schlägt jede Heuristik.
      let aliasMaterial: ProcMaterial | undefined;
      const { data } = await supabase
        .from("material_aliases")
        .select("material_id")
        .eq("alias_norm", norm)
        .maybeSingle();
      if (data?.material_id) {
        aliasMaterial = materialById(data.material_id as string);
        if (aliasMaterial) void supabase.rpc("material_alias_hit", { p_alias_norm: norm });
      }

      // 2. Deterministisch.
      const matches = matchMaterial(raw, 3).filter((m) => m.score >= WORTH_SHOWING);

      if (mine !== seq.current) return; // Eingabe hat sich inzwischen geändert

      if (aliasMaterial) {
        const rest = matches.filter((m) => m.material.key !== aliasMaterial!.key);
        setState({
          candidates: [
            { material: aliasMaterial, score: 1, reason: "schon einmal so zugeordnet" },
            ...rest,
          ],
          fromAlias: true,
          certain: true,
          loading: false,
        });
        return;
      }

      setState({
        candidates: matches,
        fromAlias: false,
        certain: matches.length > 0 && matches[0].score >= CERTAIN,
        loading: false,
      });
    },
    [supabase],
  );

  useEffect(() => {
    const t = setTimeout(() => void resolve(input), delay);
    return () => clearTimeout(t);
  }, [input, delay, resolve]);

  return state;
}

/**
 * Eine bestätigte Zuordnung merken.
 *
 * Fehler werden geschluckt: dass sich das System einen Begriff nicht
 * merken konnte, darf den Nutzer nicht davon abhalten, seinen Bedarf
 * einzureichen.
 */
export async function rememberAlias(
  supabase: ReturnType<typeof useSupabaseBrowser>,
  raw: string,
  materialId: string,
  companyId: string,
  source: "USER" | "MATCH" = "USER",
) {
  const norm = normalize(raw);
  if (norm.length < 3) return;
  await supabase
    .from("material_aliases")
    .upsert(
      {
        alias_norm: norm,
        alias_raw: raw.trim(),
        material_id: materialId,
        source,
        created_by_company_id: companyId,
      },
      { onConflict: "alias_norm" },
    )
    .then(undefined, () => undefined);
}
