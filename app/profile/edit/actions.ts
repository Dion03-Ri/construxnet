"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { geocodeCompany } from "@/lib/geocode";

export type ProfileState = { error?: string; ok?: boolean; savedAt?: number };

const CANTONS = new Set([
  "AG", "AI", "AR", "BE", "BL", "BS", "FR", "GE", "GL", "GR", "JU", "LU", "NE",
  "NW", "OW", "SG", "SH", "SO", "SZ", "TG", "TI", "UR", "VD", "VS", "ZG", "ZH",
]);

function str(fd: FormData, key: string, max: number): string {
  return String(fd.get(key) ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}
/** Mehrzeiliges Feld: Zeilenumbrüche bleiben erhalten. */
function text(fd: FormData, key: string, max: number): string {
  return String(fd.get(key) ?? "").trim().slice(0, max);
}
function list(fd: FormData, key: string, max: number): string[] {
  return fd
    .getAll(key)
    .map((v) => String(v).trim())
    .filter(Boolean)
    .slice(0, max);
}

/** Erlaubt eine Bild-Adresse aus dem eigenen Supabase-Speicher oder https. */
function safeUrl(raw: string): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return u.protocol === "https:" ? u.toString().slice(0, 500) : null;
  } catch {
    return null;
  }
}

/**
 * Speichert das eigene Firmenprofil.
 *
 * Läuft server-seitig mit Service-Role, weil companies keine UPDATE-Policy
 * hat. Genau darum wird hier eine feste Liste von Feldern geschrieben —
 * `role`, `verified`, `id`, `clerk_user_id` und `show_on_map` sind bewusst
 * NICHT dabei: sonst könnte sich jede Firma selbst verifizieren oder zum
 * Lieferanten machen. Die Zeile wird über die Clerk-ID aus auth() bestimmt,
 * nie über eine ID aus dem Formular.
 */
export async function saveProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const { userId } = await auth();
  if (!userId) return { error: "Nicht eingeloggt." };

  const db = supabaseAdmin();
  const { data: current } = await db
    .from("companies")
    .select("id, role, address, city, canton, show_on_map")
    .eq("clerk_user_id", userId)
    .maybeSingle();
  const me = current as
    | { id: string; role: string; address: string | null; city: string | null; canton: string | null; show_on_map: boolean | null }
    | null;
  if (!me) return { error: "Firmenprofil nicht gefunden." };

  const company_name = str(formData, "company_name", 120);
  const uid_number = str(formData, "uid_number", 20).toUpperCase();
  const canton = str(formData, "canton", 2).toUpperCase();
  const city = str(formData, "city", 80);
  const address = str(formData, "address", 160);
  const email = str(formData, "email", 160);
  const phone = str(formData, "phone", 40);
  const website = str(formData, "website", 200);
  const bio = text(formData, "bio", 300);
  const about = text(formData, "about", 2000);
  const logo_url = safeUrl(str(formData, "logo_url", 500));

  if (!company_name) return { error: "Der Firmenname darf nicht leer sein." };
  if (!uid_number) return { error: "Die UID darf nicht leer sein." };
  if (!/^CHE-\d{3}\.\d{3}\.\d{3}$/.test(uid_number)) {
    return { error: "Die UID muss die Form CHE-123.456.789 haben." };
  }
  if (!CANTONS.has(canton)) return { error: "Bitte einen Kanton wählen." };
  if (!city) return { error: "Bitte den Ort angeben." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { error: "Die E-Mail-Adresse sieht nicht gültig aus." };
  }

  const patch: Record<string, unknown> = {
    company_name,
    uid_number,
    canton,
    city,
    address: address || null,
    email: email || null,
    phone: phone || null,
    website: website || null,
    bio: bio || null,
    about: about || null,
  };
  if (logo_url) patch.logo_url = logo_url;

  // Liefer-Profil nur für Baustoffwerke — für ein Bauunternehmen gäbe es
  // dort nichts zu setzen, und ein untergeschobenes Feld soll nicht greifen.
  if (me.role === "SUPPLIER") {
    const radiusRaw = str(formData, "delivery_radius_km", 6);
    const radius = radiusRaw ? Number(radiusRaw) : null;
    patch.supply_materials = list(formData, "supply_materials", 40);
    patch.supply_regions = list(formData, "supply_regions", 20);
    patch.delivery_radius_km =
      radius !== null && Number.isFinite(radius) && radius >= 0 && radius <= 500
        ? Math.round(radius)
        : null;
    patch.capacity_note = str(formData, "capacity_note", 200) || null;
  }

  // Hat sich die Adresse geändert und steht die Karten-Zustimmung, wird der
  // Punkt gleich mitgezogen — sonst zeigt die Karte auf die alte Adresse.
  const moved =
    (me.address ?? "") !== (address || "") ||
    (me.city ?? "") !== city ||
    (me.canton ?? "") !== canton;
  if (me.show_on_map && moved) {
    const hit = await geocodeCompany({ address, city, canton });
    patch.lat = hit?.lat ?? null;
    patch.lng = hit?.lng ?? null;
    patch.geo_label = hit?.label ?? null;
    patch.geo_query = hit?.query ?? null;
    patch.geo_at = hit ? new Date().toISOString() : null;
  }

  const { error } = await db.from("companies").update(patch).eq("clerk_user_id", userId);

  if (error) {
    // 23505 = Eindeutigkeitsverletzung; die einzige betroffene Spalte ist die UID.
    if (error.code === "23505") {
      return { error: "Diese UID ist bereits bei einer anderen Firma hinterlegt." };
    }
    // Fehlt eine Migration, existiert die Spalte nicht — sagen statt schlucken.
    return { error: `Speichern fehlgeschlagen: ${error.message}` };
  }

  revalidatePath("/profile/edit");
  revalidatePath(`/company/${me.id}`);
  revalidatePath("/map");
  return { ok: true, savedAt: Date.now() };
}
