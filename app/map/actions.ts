"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Setzt die Einwilligung, mit Standort auf der Lieferantenkarte zu
 * erscheinen.
 *
 * Läuft server-seitig mit Service-Role, weil companies keine
 * UPDATE-Policy hat. Bewusst so: eine allgemeine Update-Regel würde es
 * einer Firma erlauben, auch `verified` oder `role` an sich selbst zu
 * schreiben. Hier wird genau ein Feld geschrieben, und die Zeile wird
 * über die Clerk-ID aus auth() bestimmt — nicht über eine ID aus dem
 * Formular.
 */
export async function setMapConsent(show: boolean): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Nicht eingeloggt." };

  const { error } = await supabaseAdmin()
    .from("companies")
    .update({ show_on_map: show })
    .eq("clerk_user_id", userId);

  if (error) return { error: error.message };

  revalidatePath("/map");
  return {};
}
