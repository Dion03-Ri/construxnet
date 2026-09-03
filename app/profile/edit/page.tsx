import Link from "next/link";
import { ArrowLeft, UserCog } from "lucide-react";
import ProfileForm, { type EditableCompany } from "@/components/profile/ProfileForm";
import { requireCompanyOrOnboard } from "@/lib/company";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Profil bearbeiten · Obtanet",
  description: "Firmendaten, Standort, Kontakt und Liefer-Profil pflegen.",
};

export default async function EditProfilePage() {
  const me = await requireCompanyOrOnboard();

  // Vollständige Zeile über die Service-Role: die Felder aus den Migrationen
  // 04 und 05 fehlen in einem alten Datenbestand, darum mit Rückfall auf die
  // Grunddaten statt mit einem Fehler.
  const db = supabaseAdmin();
  const full = await db
    .from("companies")
    .select(
      "id, company_name, uid_number, role, verified, canton, city, address, email, phone, website, bio, about, logo_url, supply_materials, supply_regions, delivery_radius_km, capacity_note",
    )
    .eq("id", me.id)
    .maybeSingle();

  const row = (full.error ? null : full.data) as Partial<EditableCompany> | null;

  const company: EditableCompany = {
    id: me.id,
    company_name: row?.company_name ?? me.company_name,
    uid_number: row?.uid_number ?? me.uid_number,
    role: row?.role ?? me.role,
    verified: row?.verified ?? me.verified,
    canton: row?.canton ?? me.canton,
    city: row?.city ?? me.city,
    address: row?.address ?? null,
    email: row?.email ?? null,
    phone: row?.phone ?? null,
    website: row?.website ?? null,
    bio: row?.bio ?? me.bio,
    about: row?.about ?? null,
    logo_url: row?.logo_url ?? me.logo_url,
    supply_materials: row?.supply_materials ?? null,
    supply_regions: row?.supply_regions ?? null,
    delivery_radius_km: row?.delivery_radius_km ?? null,
    capacity_note: row?.capacity_note ?? null,
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <Link
        href={`/company/${me.id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-white/55 transition-colors hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" /> Zurück zum Profil
      </Link>

      <header className="mb-5 flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand/15 text-brand">
          <UserCog className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Profil bearbeiten</h1>
          <p className="text-sm text-white/55">
            Firmendaten, Standort, Kontakt{company.role === "SUPPLIER" ? " und Liefer-Profil" : ""}.
          </p>
        </div>
      </header>

      <ProfileForm company={company} />
    </main>
  );
}
