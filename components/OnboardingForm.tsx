"use client";

import { useActionState } from "react";
import { Building2, Factory, Loader2, AlertTriangle } from "lucide-react";
import { createCompany, type OnboardingState } from "@/app/onboarding/actions";
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
  "w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-brand/50 focus:outline-none";
const labelClass =
  "mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500";

export default function OnboardingForm() {
  const [state, formAction, pending] = useActionState<OnboardingState, FormData>(
    createCompany,
    {},
  );

  return (
    <form action={formAction} className="space-y-5">
      {/* Rolle */}
      <div>
        <span className={labelClass}>Rolle *</span>
        <div className="grid grid-cols-2 gap-3">
          {ROLES.map((r, i) => (
            <label
              key={r.key}
              className="group relative cursor-pointer rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-brand/40 has-[:checked]:border-brand has-[:checked]:bg-brand/10"
            >
              <input
                type="radio"
                name="role"
                value={r.key}
                defaultChecked={i === 0}
                className="peer sr-only"
              />
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 peer-checked:bg-brand/20 peer-checked:text-brand">
                <r.icon className="h-5 w-5" />
              </span>
              <div className="mt-2 text-sm font-semibold text-slate-900">
                {r.label}
              </div>
              <div className="text-xs text-slate-500">{r.hint}</div>
            </label>
          ))}
        </div>
      </div>

      {/* Firmenname */}
      <div>
        <label htmlFor="company_name" className={labelClass}>
          Firmenname *
        </label>
        <input
          id="company_name"
          name="company_name"
          required
          placeholder="z. B. Bätschmann Bau AG"
          className={inputClass}
        />
      </div>

      {/* UID */}
      <div>
        <label htmlFor="uid_number" className={labelClass}>
          UID- / CHE-Nummer *
        </label>
        <input
          id="uid_number"
          name="uid_number"
          required
          placeholder="CHE-123.456.789"
          className={inputClass}
        />
      </div>

      {/* Kanton + Stadt */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label htmlFor="canton" className={labelClass}>
            Kanton *
          </label>
          <select id="canton" name="canton" required defaultValue="ZH" className={inputClass}>
            {CANTONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="city" className={labelClass}>
            Stadt *
          </label>
          <input
            id="city"
            name="city"
            required
            placeholder="z. B. Zürich"
            className={inputClass}
          />
        </div>
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className={labelClass}>
          Kurzbeschreibung (optional)
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          placeholder="Was macht euer Betrieb? Spezialgebiete, Region, Referenzen …"
          className={cn(inputClass, "resize-none")}
        />
      </div>

      {state.error && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Profil erstellen & loslegen
      </button>
    </form>
  );
}
