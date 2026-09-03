"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import {
  Loader2, AlertTriangle, Check, Building2, MapPin, Phone, FileText,
  Truck, ImagePlus, Factory, ShieldCheck, ExternalLink,
} from "lucide-react";
import { saveProfile, type ProfileState } from "@/app/profile/edit/actions";
import { useSupabaseBrowser } from "@/lib/supabase-browser";
import { PROC_MATERIALS, PROC_CATEGORIES, PROC_REGIONS } from "@/data/procurement";
import { SWISS_CANTONS } from "@/lib/network";
import { CARD } from "@/lib/ui";
import { cn } from "@/lib/utils";

export type EditableCompany = {
  id: string;
  company_name: string;
  uid_number: string;
  role: string;
  verified: boolean;
  canton: string | null;
  city: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  bio: string | null;
  about: string | null;
  logo_url: string | null;
  supply_materials: string[] | null;
  supply_regions: string[] | null;
  delivery_radius_km: number | null;
  capacity_note: string | null;
};

const IMAGE_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const input =
  "w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand/30";
const label = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500";

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

/** Ein Block des Formulars — gleiche Sprache wie die übrigen Karten. */
function Section({
  title,
  hint,
  icon: Icon,
  children,
}: {
  title: string;
  hint?: string;
  icon: typeof Building2;
  children: React.ReactNode;
}) {
  return (
    <section className={cn(CARD, "p-5 sm:p-6")}>
      <h2 className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
        <Icon className="h-4 w-4 text-brand" /> {title}
      </h2>
      {hint && <p className="mt-0.5 text-[12.5px] text-slate-500">{hint}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export default function ProfileForm({ company }: { company: EditableCompany }) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(saveProfile, {});
  const supabase = useSupabaseBrowser();

  const isSupplier = company.role === "SUPPLIER";
  const [logoUrl, setLogoUrl] = useState(company.logo_url ?? "");
  const [logoBusy, setLogoBusy] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadLogo(file: File) {
    setLogoError(null);
    const ext = IMAGE_EXT[file.type];
    if (!ext) {
      setLogoError("Nur JPG, PNG oder WebP.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError("Das Bild ist grösser als 2 MB.");
      return;
    }
    setLogoBusy(true);
    try {
      // Der Speicher erlaubt nur den eigenen Ordner (Firmen-ID) — siehe
      // Migration 20. Endung aus dem Dateityp, nicht aus dem Dateinamen.
      const path = `${company.id}/logo-${Date.now()}.${ext}`;
      const up = await supabase.storage.from("post-media").upload(path, file, { upsert: true });
      if (up.error) throw up.error;
      setLogoUrl(supabase.storage.from("post-media").getPublicUrl(path).data.publicUrl);
    } catch {
      setLogoError("Hochladen fehlgeschlagen. Versuch es später noch einmal.");
    } finally {
      setLogoBusy(false);
    }
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="logo_url" value={logoUrl} />

      {/* Firma */}
      <Section title="Firma" icon={Building2} hint="So erscheint dein Betrieb im Netzwerk, im Feed und auf der Karte.">
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100 text-base font-bold text-slate-700 ring-1 ring-slate-200">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              initials(company.company_name)
            )}
          </span>
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={logoBusy}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-[13px] font-semibold text-slate-600 transition-colors hover:border-brand/40 hover:text-brand disabled:opacity-60"
            >
              {logoBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              {logoUrl ? "Logo ersetzen" : "Logo hochladen"}
            </button>
            {logoUrl && (
              <button
                type="button"
                onClick={() => setLogoUrl("")}
                className="ml-2 text-[12.5px] font-medium text-slate-400 hover:text-slate-600"
              >
                entfernen
              </button>
            )}
            <p className="mt-1 text-[11.5px] text-slate-400">JPG, PNG oder WebP, bis 2 MB.</p>
            {logoError && <p className="mt-1 text-[12px] font-medium text-red-600">{logoError}</p>}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadLogo(f);
              e.target.value = "";
            }}
          />
        </div>

        <div>
          <label htmlFor="company_name" className={label}>Firmenname *</label>
          <input id="company_name" name="company_name" required defaultValue={company.company_name} className={input} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="uid_number" className={label}>UID *</label>
            <input
              id="uid_number"
              name="uid_number"
              required
              defaultValue={company.uid_number}
              placeholder="CHE-123.456.789"
              className={input}
            />
            <p className="mt-1 text-[11.5px] text-slate-400">Form: CHE-123.456.789</p>
          </div>
          <div>
            <span className={label}>Rolle</span>
            <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-500">
              {isSupplier ? <Factory className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
              {isSupplier ? "Baustoffwerk / Lieferant" : "Bauunternehmen"}
              {company.verified && <ShieldCheck className="ml-auto h-4 w-4 text-brand" />}
            </div>
            <p className="mt-1 text-[11.5px] text-slate-400">
              Die Rolle bestimmt, wer bieten und wer beschaffen darf — sie lässt sich hier nicht ändern.
            </p>
          </div>
        </div>
      </Section>

      {/* Standort */}
      <Section
        title="Standort"
        icon={MapPin}
        hint="Diese Adresse bestimmt deinen Punkt auf der Karte. Je vollständiger, desto genauer."
      >
        <div>
          <label htmlFor="address" className={label}>Strasse und Nummer</label>
          <input id="address" name="address" defaultValue={company.address ?? ""} placeholder="z. B. Industriestrasse 12" className={input} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_180px]">
          <div>
            <label htmlFor="city" className={label}>PLZ und Ort *</label>
            <input id="city" name="city" required defaultValue={company.city ?? ""} placeholder="z. B. 8005 Zürich" className={input} />
          </div>
          <div>
            <label htmlFor="canton" className={label}>Kanton *</label>
            <select id="canton" name="canton" required defaultValue={company.canton ?? "ZH"} className={input}>
              {SWISS_CANTONS.map((k) => (
                <option key={k.code} value={k.code}>{k.name}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-[12px] text-slate-400">
          Steht deine Karten-Zustimmung, wird der Punkt nach dem Speichern automatisch neu ermittelt.{" "}
          <Link href="/map" className="font-medium text-brand hover:underline">Zur Karte</Link>
        </p>
      </Section>

      {/* Kontakt */}
      <Section title="Kontakt" icon={Phone} hint="Sichtbar nur für Firmen, mit denen du verbunden bist.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className={label}>E-Mail</label>
            <input id="email" name="email" type="email" defaultValue={company.email ?? ""} placeholder="info@firma.ch" className={input} />
          </div>
          <div>
            <label htmlFor="phone" className={label}>Telefon</label>
            <input id="phone" name="phone" defaultValue={company.phone ?? ""} placeholder="+41 44 123 45 67" className={input} />
          </div>
        </div>
        <div>
          <label htmlFor="website" className={label}>Website</label>
          <input id="website" name="website" defaultValue={company.website ?? ""} placeholder="www.firma.ch" className={input} />
        </div>
      </Section>

      {/* Beschreibung */}
      <Section title="Über den Betrieb" icon={FileText} hint="Die Kurzfassung steht in Listen und Vorschlägen, der Text auf deinem Profil.">
        <div>
          <label htmlFor="bio" className={label}>Kurzbeschreibung</label>
          <input id="bio" name="bio" defaultValue={company.bio ?? ""} maxLength={300} placeholder="Ein Satz zu eurem Betrieb" className={input} />
        </div>
        <div>
          <label htmlFor="about" className={label}>Über uns</label>
          <textarea
            id="about"
            name="about"
            rows={5}
            defaultValue={company.about ?? ""}
            maxLength={2000}
            placeholder="Spezialgebiete, Referenzen, Geschichte …"
            className={cn(input, "resize-y")}
          />
        </div>
      </Section>

      {/* Liefer-Profil */}
      {isSupplier && (
        <Section title="Liefer-Profil" icon={Truck} hint="Was ihr führt und wie weit ihr liefert — Grundlage für passende Bündel.">
          <div>
            <span className={label}>Materialien im Sortiment</span>
            <div className="max-h-72 space-y-3 overflow-y-auto rounded-md border border-slate-200 bg-slate-50 p-3">
              {PROC_CATEGORIES.map((cat) => (
                <div key={cat}>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{cat}</div>
                  <div className="mt-1 grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {PROC_MATERIALS.filter((m) => m.category === cat).map((m) => (
                      <label key={m.key} className="flex cursor-pointer items-center gap-2 text-[13px] text-slate-700">
                        <input
                          type="checkbox"
                          name="supply_materials"
                          value={m.label}
                          defaultChecked={company.supply_materials?.includes(m.label) ?? false}
                          className="h-4 w-4 rounded border-slate-300 accent-[#D99000]"
                        />
                        <span className="truncate">{m.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className={label}>Liefergebiete</span>
            <div className="flex flex-wrap gap-1.5">
              {PROC_REGIONS.map((r) => (
                <label
                  key={r}
                  className="cursor-pointer rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[12.5px] font-medium text-slate-600 transition-colors has-[:checked]:border-brand has-[:checked]:bg-brand/10 has-[:checked]:text-brand-700"
                >
                  <input
                    type="checkbox"
                    name="supply_regions"
                    value={r}
                    defaultChecked={company.supply_regions?.includes(r) ?? false}
                    className="sr-only"
                  />
                  {r}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="delivery_radius_km" className={label}>Lieferradius (km)</label>
              <input
                id="delivery_radius_km"
                name="delivery_radius_km"
                type="number"
                min={0}
                max={500}
                defaultValue={company.delivery_radius_km ?? ""}
                placeholder="z. B. 40"
                className={input}
              />
            </div>
            <div>
              <label htmlFor="capacity_note" className={label}>Kapazität</label>
              <input
                id="capacity_note"
                name="capacity_note"
                defaultValue={company.capacity_note ?? ""}
                placeholder="z. B. bis 600 m³/Tag Transportbeton"
                className={input}
              />
            </div>
          </div>
        </Section>
      )}

      {/* Speichern */}
      {state.error && (
        <p className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">
          <AlertTriangle className="mt-px h-4 w-4 shrink-0" /> {state.error}
        </p>
      )}
      {state.ok && !pending && (
        <p className="flex items-center gap-2 rounded-md border border-brand/25 bg-brand/10 px-4 py-3 text-[13px] font-semibold text-brand-700">
          <Check className="h-4 w-4" /> Gespeichert.
        </p>
      )}

      <div className="sticky bottom-20 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-card backdrop-blur md:bottom-4">
        <button
          type="submit"
          disabled={pending || logoBusy}
          className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-500 disabled:opacity-60"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Änderungen speichern
        </button>
        <Link
          href={`/company/${company.id}`}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-brand/40 hover:text-brand"
        >
          <ExternalLink className="h-4 w-4" /> Profil ansehen
        </Link>
      </div>
    </form>
  );
}
