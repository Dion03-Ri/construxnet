import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "./supabase";

export type Company = {
  id: string;
  clerk_user_id: string;
  company_name: string;
  uid_number: string;
  role: string;
  canton: string | null;
  city: string | null;
  verified: boolean;
  logo_url: string | null;
  bio: string | null;
};

/** Firma des eingeloggten Clerk-Users (oder null). Server-seitig. */
export async function getMyCompany(): Promise<Company | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("companies")
    .select("*")
    .eq("clerk_user_id", userId)
    .maybeSingle();
  return (data as Company | null) ?? null;
}

/**
 * Gate für geschützte App-Seiten: eingeloggte Nutzer ohne Firmenprofil
 * werden ins Onboarding geleitet. Gibt sonst die Firma zurück.
 */
export async function requireCompanyOrOnboard(): Promise<Company> {
  const company = await getMyCompany();
  if (!company) redirect("/onboarding");
  return company;
}
