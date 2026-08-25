"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";

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

  const { error } = await admin.from("companies").insert({
    clerk_user_id: userId,
    company_name,
    uid_number,
    role,
    canton,
    city,
    bio: bio || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Diese UID-Nummer ist bereits registriert." };
    }
    return { error: error.message };
  }

  redirect("/feed");
}
