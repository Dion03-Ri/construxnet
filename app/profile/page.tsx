import { redirect } from "next/navigation";
import { requireCompanyOrOnboard } from "@/lib/company";

export const dynamic = "force-dynamic";

// Leitet auf das eigene Firmenprofil weiter — dort werden ausschliesslich die
// eigenen Beiträge angezeigt (nicht der ganze Feed).
export default async function ProfileRedirect() {
  const me = await requireCompanyOrOnboard();
  redirect(`/company/${me.id}`);
}
