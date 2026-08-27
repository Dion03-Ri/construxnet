"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin, cleanSupabaseUrl } from "@/lib/supabase";

export type OnboardingState = { error?: string };

/**
 * Legt das Firmenprofil des eingeloggten Users an.
 *
 * Läuft server-seitig mit Service-Role (companies hat keine INSERT-RLS-Policy);
 * clerk_user_id wird aus auth() gesetzt und ist damit nicht manipulierbar.
 */
export async function createCompany(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const { userId } = await auth();
  if (!userId) return { error: "Nicht eingeloggt." };

  // Konfigurations-Diagnose: die häufigste Ursache für
  // "Invalid path specified in request URL" ist eine fehlende/leere URL.
  const supaUrl = cleanSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (!supaUrl) {
    return {
      error:
        "Server-Konfiguration: NEXT_PUBLIC_SUPABASE_URL fehlt oder ist leer (in Vercel setzen).",
    };
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      error:
        "Server-Konfiguration: SUPABASE_SERVICE_ROLE_KEY fehlt (in Vercel setzen).",
    };
  }
  // Die URL muss die Supabase-API-URL sein (https://<ref>.supabase.co),
  // NICHT die Dashboard-URL. Falscher Host => "Invalid path ...".
  let supaHost = "";
  try {
    supaHost = new URL(supaUrl).host;
  } catch {
    /* ungültige URL */
  }
  if (!supaHost.endsWith(".supabase.co")) {
    return {
      error: `NEXT_PUBLIC_SUPABASE_URL zeigt auf "${supaHost || supaUrl}" — erwartet wird die API-URL https://<ref>.supabase.co (Vercel-Env korrigieren).`,
    };
  }

  const company_name = String(formData.get("company_name") ?? "").trim();
  const uid_number = String(formData.get("uid_number") ?? "").trim();
  const role = String(formData.get("role") ?? "");
  const canton = String(formData.get("canton") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  if (!company_name || !uid_number || !canton || !city) {
    return { error: "Bitte alle Pflichtfelder ausfüllen." };
  }
  if (role !== "BUYER" && role !== "SUPPLIER") {
    return { error: "Bitte eine Rolle wählen." };
  }

  const admin = supabaseAdmin();

  const { data: existing } = await admin
    .from("companies")
    .select("id")
    .eq("clerk_user_id", userId)
    .maybeSingle();
  if (existing) redirect("/feed");

  const base = {
    clerk_user_id: userId,
    company_name,
    uid_number,
    role,
    canton,
    city,
    bio: bio || null,
  };

  // Lieferanten-Profil (nur für Baustoffwerke): Material, Regionen, Radius, Kapazität.
  const supplierExtra =
    role === "SUPPLIER"
      ? {
          supply_materials: formData.getAll("supply_materials").map(String).filter(Boolean),
          supply_regions: formData.getAll("supply_regions").map(String).filter(Boolean),
          delivery_radius_km: Number(formData.get("delivery_radius_km")) || null,
          capacity_note: String(formData.get("capacity_note") ?? "").trim() || null,
        }
      : {};

  // Erst mit Liefer-Profil versuchen; falls die Spalten (Migration 05) noch
  // nicht existieren, ohne die Zusatzfelder einfügen — Onboarding bleibt robust.
  let error = (await admin.from("companies").insert({ ...base, ...supplierExtra })).error;
  if (error && error.code !== "23505" && Object.keys(supplierExtra).length > 0) {
    error = (await admin.from("companies").insert(base)).error;
  }

  if (error) {
    if (error.code === "23505") {
      return { error: "Diese UID-Nummer ist bereits registriert." };
    }
    return { error: `${error.message} · (Host: ${supaHost})` };
  }

  redirect("/feed");
}
