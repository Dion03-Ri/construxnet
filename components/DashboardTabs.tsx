"use client";

import { useState } from "react";
import { Building2, Factory, Construction, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Panel = {
  key: string;
  label: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  planned: { title: string; text: string }[];
};

const PANELS: Panel[] = [
  {
    key: "buyer",
    label: "Bauunternehmer",
    icon: Building2,
    title: "Bauunternehmer-Cockpit",
    subtitle: "Pools beitreten, Tier-Fortschritt verfolgen und Lieferungen abwickeln.",
    planned: [
      {
        title: "Aktive Pool-Teilnahmen",
        text: "Übersicht laufender Smart Pools mit Tier-Fortschrittsbalken.",
      },
      {
        title: "Paket-Koppelung",
        text: "Status-Indikatoren für gekoppelte Beton-/Stahl-Bestellungen.",
      },
      {
        title: "Lieferschein-OCR",
        text: "Lieferscheine per Foto erfassen und automatisch abgleichen.",
      },
      {
        title: "SIA-118 Verträge & Rechnungen",
        text: "Vertrags- und Rechnungsübersicht pro abgeschlossenem Pool.",
      },
    ],
  },
  {
    key: "supplier",
    label: "Baustoffwerk",
    icon: Factory,
    title: "Lieferanten-Cockpit",
    subtitle:
      "Regionale Bündel-Ausschreibungen einsehen und Sealed-Bid-Gebote abgeben.",
    planned: [
      {
        title: "Bündel-Bidding-Feed",
        text: "Regionale Ausschreibungen mit Sealed-Bid-Gebotsabgabe.",
      },
      {
        title: "Kapazitätsplanung",
        text: "Dispositions- und Routenübersicht für zugesprochene Volumen.",
      },
      {
        title: "Provisionsübersicht",
        text: "Monatliche Plattformkommission (2.25 %) pro Auftrag.",
      },
      {
        title: "Auftragshistorie",
        text: "Gewonnene und verlorene Bündel im Überblick.",
      },
    ],
  },
];

export default function DashboardTabs() {
  const [active, setActive] = useState(PANELS[0].key);
  const panel = PANELS.find((p) => p.key === active) ?? PANELS[0];

  return (
    <div>
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Dashboard-Rollen"
        className="inline-flex rounded-xl border border-slate-200 bg-white p-1"
      >
        {PANELS.map((p) => (
          <button
            key={p.key}
            type="button"
            role="tab"
            aria-selected={active === p.key}
            onClick={() => setActive(p.key)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              active === p.key
                ? "bg-brand text-white shadow-sm shadow-brand/30"
                : "text-slate-500 hover:text-slate-900",
            )}
          >
            <p.icon className="h-4 w-4" />
            {p.label}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="mt-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/15 text-brand">
            <panel.icon className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              {panel.title}
            </h2>
            <p className="mt-1 max-w-2xl text-slate-500">{panel.subtitle}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand/90">
          <Construction className="h-4 w-4 shrink-0" />
          In Aufbau — die folgenden Module folgen in den nächsten Iterationen.
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {panel.planned.map((m) => (
            <div
              key={m.title}
              className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5"
            >
              <h3 className="font-semibold text-slate-700">{m.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500">{m.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
