"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { geocodeCompany } from "@/lib/geocode";

export type MapLocation = {
  lat: number | null;
  lng: number | null;
  label: string | null;
};

/** Adressfelder der eigenen Firma — Grundlage der Standortsuche. */
async function myCompany(userId: string) {
  const { data } = await supabaseAdmin()
    .from("companies")
    .select("id, address, city, canton")
    .eq("clerk_user_id", userId)
    .maybeSingle();
  return data as { id: string; address: string | null; city: string | null; canton: string | null } | null;
}

/**
 * Setzt die Einwilligung, mit Standort auf der Karte zu erscheinen — und
 * ermittelt beim Einschalten gleich die Koordinaten. Genau das ist der
 * "läuft automatisch"-Teil: zustimmen genügt, den Rest macht die Seite.
 *
 * Läuft server-seitig mit Service-Role, weil companies keine UPDATE-Policy
 * hat. Bewusst so: eine allgemeine Update-Regel würde es einer Firma
 * erlauben, auch `verified` oder `role` an sich selbst zu schreiben. Hier
 * werden genau diese Felder geschrieben, und die Zeile wird über die
 * Clerk-ID aus auth() bestimmt — nicht über eine ID aus dem Formular.
 */
export async function setMapConsent(
  show: boolean,
): Promise<{ error?: string; location?: MapLocation }> {
  const { userId } = await auth();
  if (!userId) return { error: "Nicht eingeloggt." };

  if (!show) {
    // Zustimmung zurückgezogen: Koordinaten verschwinden mit ihr.
    const { error } = await supabaseAdmin()
      .from("companies")
      .update({ show_on_map: false, lat: null, lng: null, geo_label: null, geo_query: null, geo_at: null })
      .eq("clerk_user_id", userId);
    if (error) return { error: error.message };
    revalidatePath("/map");
    return { location: { lat: null, lng: null, label: null } };
  }

  const me = await myCompany(userId);
  if (!me) return { error: "Firmenprofil nicht gefunden." };

  const hit = await geocodeCompany(me);

  const { error } = await supabaseAdmin()
    .from("companies")
    .update({
      show_on_map: true,
      lat: hit?.lat ?? null,
      lng: hit?.lng ?? null,
      geo_label: hit?.label ?? null,
      geo_query: hit?.query ?? null,
      geo_at: hit ? new Date().toISOString() : null,
    })
    .eq("clerk_user_id", userId);

  if (error) return { error: error.message };

  revalidatePath("/map");
  return { location: { lat: hit?.lat ?? null, lng: hit?.lng ?? null, label: hit?.label ?? null } };
}

/**
 * Standort neu ermitteln — nach einer Adressänderung oder wenn der Punkt
 * nicht stimmt. Nur sinnvoll, solange die Zustimmung steht.
 */
export async function refreshMapLocation(): Promise<{ error?: string; location?: MapLocation }> {
  const { userId } = await auth();
  if (!userId) return { error: "Nicht eingeloggt." };

  const me = await myCompany(userId);
  if (!me) return { error: "Firmenprofil nicht gefunden." };

  const hit = await geocodeCompany(me);
  if (!hit) {
    return {
      error:
        "Zu dieser Adresse wurde kein Standort gefunden. Ergänze Strasse, PLZ und Ort im Firmenprofil.",
    };
  }

  const { error } = await supabaseAdmin()
    .from("companies")
    .update({
      lat: hit.lat,
      lng: hit.lng,
      geo_label: hit.label,
      geo_query: hit.query,
      geo_at: new Date().toISOString(),
    })
    .eq("clerk_user_id", userId);

  if (error) return { error: error.message };

  revalidatePath("/map");
  return { location: { lat: hit.lat, lng: hit.lng, label: hit.label } };
}
