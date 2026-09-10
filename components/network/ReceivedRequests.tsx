"use client";

import Link from "next/link";
import { AlertTriangle, BadgeCheck, Check, Loader2, Inbox, MapPin } from "lucide-react";
import { ROLE_LABEL, initials, useNetwork } from "@/lib/network";

/**
 * Die eingegangenen Anfragen auf /network/requests.
 *
 * Diese Ansicht hatte bis eben ihre EIGENE Abfrage — dieselbe Frage, zweimal
 * anders gestellt. Zwei Wahrheiten sind eine zu viel: die eine Liste zeigte
 * eine Anfrage, die andere nicht, je nachdem, welche gerade geladen hatte.
 * Jetzt liest sie aus `useNetwork()` wie die Übersicht auch — und bekommt
 * damit dasselbe Live-Verhalten und dieselben Fehlermeldungen.
 */
export default function ReceivedRequests() {
  const { incoming, accept, remove, loading, fehler } = useNetwork();

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-600">
        <Loader2 className="h-4 w-4 animate-spin" /> Anfragen werden geladen …
      </div>
    );
  }

  if (incoming.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-14 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500">
          <Inbox className="h-6 w-6" />
        </span>
        <p className="text-sm font-semibold text-slate-900">Keine offenen Anfragen</p>
        <p className="max-w-sm text-[13px] text-slate-600">
          Wenn dir Firmen eine Vernetzungs-Anfrage senden, erscheinen sie hier zum Annehmen.
        </p>
        {fehler && (
          <p className="flex items-start gap-2 text-[13px] text-rose-600">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {fehler}
          </p>
        )}
        <Link
          href="/network"
          className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-navy-950 transition-colors hover:bg-brand-500"
        >
          Firmen entdecken
        </Link>
      </div>
    );
  }

  return (
    <>
      {fehler && (
        <p className="mb-3 flex items-start gap-2 border-l-2 border-rose-400 py-2 pl-3 text-[13px] text-rose-600">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {fehler}
        </p>
      )}
      <ul className="divide-y divide-slate-200">
        {incoming.map(({ company, conn }) => (
          <li key={conn.id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
            <Link
              href={`/company/${company.id}`}
              className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-semibold text-slate-600"
            >
              {company.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={company.logo_url}
                  alt={company.company_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials(company.company_name)
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={`/company/${company.id}`}
                className="flex items-center gap-1 truncate text-sm font-semibold text-slate-900 transition-colors hover:text-brand-700"
              >
                {company.company_name}
                {company.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-brand-700" />}
              </Link>
              <p className="flex items-center gap-1 truncate text-xs text-slate-500">
                {ROLE_LABEL[company.role] ?? company.role}
                {company.city && (
                  <>
                    <span>·</span>
                    <MapPin className="h-3 w-3" /> {company.city}
                  </>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => remove(conn.id)}
              className="rounded-md border border-slate-200 px-3.5 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Ignorieren
            </button>
            <button
              type="button"
              onClick={() => accept(conn.id)}
              className="inline-flex items-center gap-1 rounded-md bg-brand px-3.5 py-1.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-brand-500"
            >
              <Check className="h-4 w-4" /> Annehmen
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
