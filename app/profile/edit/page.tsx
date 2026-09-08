import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProfileForm, { type EditableCompany } from "@/components/profile/ProfileForm";
import { requireCompanyOrOnboard } from "@/lib/company";
import { supabaseAdmin } from "@/lib/supabase";
import { SHELL_NARROW } from "@/lib/ui";
import { cn } from "@/lib/utils";

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
    <main className={cn(SHELL_NARROW, "py-6 sm:py-8")}>
      <Link
        href={`/company/${me.id}`}
        className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-white/45 transition-colors hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" /> Zurück zum Profil
      </Link>

      {/* Blatt mit schwarzem Kopfband.

          Die Beschaffung hat ein Navyband, diese hier ein schwarzes. Das
          ist Absicht: Schwarz und Weiss sind die Farben, die überall
          vorkommen dürfen, Navy ist die zweite Möglichkeit. Wechselt man
          ab, entsteht ein Rhythmus statt einer Schablone — und genau eine
          Schablone, die auf jeder Seite gleich aussieht, ist das, was eine
          Oberfläche erzeugt wirken lässt. */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900">
        <header className="bg-[#060B12] px-6 py-7 text-white sm:px-9 sm:py-9">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
            Dein Profil
          </span>
          <h1 className="mt-3 font-display text-[28px] font-bold leading-[1.15] tracking-[-0.02em] sm:text-[34px]">
            Profil bearbeiten
          </h1>
          <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-white/55">
            Firmendaten, Standort, Kontakt{company.role === "SUPPLIER" ? " und Liefer-Profil" : ""}.
            Was hier steht, sehen die Firmen, mit denen du verhandelst.
          </p>
        </header>

        <div className="px-6 py-7 sm:px-9 sm:py-9">
          <ProfileForm company={company} />
        </div>
      </div>
    </main>
  );
}
