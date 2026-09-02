"use client";

import { useActionState, useState } from "react";
import { Building2, Factory, Loader2, AlertTriangle, Truck } from "lucide-react";
import { createCompany, type OnboardingState } from "@/app/onboarding/actions";
import { PROC_MATERIALS, PROC_CATEGORIES, PROC_REGIONS } from "@/data/procurement";
import { cn } from "@/lib/utils";

const CANTONS = [
  "AG", "AI", "AR", "BE", "BL", "BS", "FR", "GE", "GL", "GR", "JU", "LU", "NE",
  "NW", "OW", "SG", "SH", "SO", "SZ", "TG", "TI", "UR", "VD", "VS", "ZG", "ZH",
];

const ROLES = [
  { key: "BUYER", label: "Bauunternehmen", icon: Building2, hint: "Ich beschaffe Material" },
  { key: "SUPPLIER", label: "Baustoffwerk", icon: Factory, hint: "Ich liefere Material" },
];

const inputClass =
  "w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand/30";
const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500";

export default function OnboardingForm() {
  const [state, formAction, pending] = useActionState<OnboardingState, FormData>(createCompany, {});
  const [role, setRole] = useState("BUYER");
  const isSupplier = role === "SUPPLIER";

  return (
    <form action={formAction} className="space-y-5">
      {/* Rolle */}
      <div>
        <span className={labelClass}>Rolle *</span>
        <div className="grid grid-cols-2 gap-3">
          {ROLES.map((r) => (
            <label
              key={r.key}
              className="group relative cursor-pointer rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-brand/40 has-[:checked]:border-brand has-[:checked]:bg-brand/10"
            >
              <input
                type="radio"
                name="role"
                value={r.key}
                checked={role === r.key}
                onChange={() => setRole(r.key)}
                className="peer sr-only"
              />
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 peer-checked:bg-brand/20 peer-checked:text-brand">
                <r.icon className="h-5 w-5" />
              </span>
              <div className="mt-2 text-sm font-semibold text-slate-900">{r.label}</div>
              <div className="text-xs text-slate-500">{r.hint}</div>
            </label>
          ))}
        </div>
      </div>

      {/* Firmenname */}
      <div>
        <label htmlFor="company_name" className={labelClass}>Firmenname *</label>
        <input id="company_name" name="company_name" required placeholder="z. B. Muster Bau AG" className={inputClass} />
      </div>

      {/* UID */}
      <div>
        <label htmlFor="uid_number" className={labelClass}>UID- / CHE-Nummer *</label>
        <input id="uid_number" name="uid_number" required placeholder="CHE-123.456.789" className={inputClass} />
      </div>

      {/* Kanton + Stadt */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label htmlFor="canton" className={labelClass}>Kanton *</label>
          <select id="canton" name="canton" required defaultValue="ZH" className={inputClass}>
            {CANTONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="city" className={labelClass}>Stadt *</label>
          <input id="city" name="city" required placeholder="z. B. Zürich" className={inputClass} />
        </div>
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className={labelClass}>Kurzbeschreibung (optional)</label>
        <textarea id="bio" name="bio" rows={3} placeholder="Was macht euer Betrieb? Spezialgebiete, Referenzen …" className={cn(inputClass, "resize-none")} />
      </div>

      {/* Liefer-Profil — nur für Baustoffwerke */}
      {isSupplier && (
        <div className="space-y-4 rounded-lg border border-brand/25 bg-brand/[0.04] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Truck className="h-4 w-4 text-brand" /> Liefer-Profil
            <span className="text-[11px] font-normal text-slate-500">— damit Smart Bündeln weiss, ob du für einen Auftrag infrage kommst</span>
          </div>

          <div>
            <span className={labelClass}>Welche Materialien lieferst du? *</span>
            <div className="max-h-72 space-y-3 overflow-y-auto rounded-md border border-slate-200 bg-white p-3">
              {PROC_CATEGORIES.map((cat) => {
                const items = PROC_MATERIALS.filter((m) => m.category === cat);
                if (items.length === 0) return null;
                return (
                  <div key={cat}>
                    <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{cat}</div>
                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                      {items.map((m) => (
                        <label key={m.key} className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700 transition-colors has-[:checked]:border-brand has-[:checked]:bg-brand/10">
                          <input type="checkbox" name="supply_materials" value={m.label} className="accent-[#D99000]" />
                          {m.label}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <span className={labelClass}>Liefergebiete *</span>
            <div className="flex flex-wrap gap-1.5">
              {PROC_REGIONS.map((r) => (
                <label key={r} className="cursor-pointer rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[13px] text-slate-700 transition-colors has-[:checked]:border-brand has-[:checked]:bg-brand/10 has-[:checked]:text-brand">
                  <input type="checkbox" name="supply_regions" value={r} className="sr-only" />
                  {r}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="delivery_radius_km" className={labelClass}>Lieferradius (km)</label>
              <input id="delivery_radius_km" name="delivery_radius_km" type="number" min={0} placeholder="z. B. 40" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="capacity_note" className={labelClass}>Kapazität / Hinweis</label>
              <input id="capacity_note" name="capacity_note" placeholder="z. B. bis 600 m³/Tag Transportbeton" className={inputClass} />
            </div>
          </div>
        </div>
      )}

      {state.error && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Profil erstellen &amp; loslegen
      </button>
    </form>
  );
}
