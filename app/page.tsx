import Link from "next/link";
import {
  ArrowRight,
  Users,
  MessagesSquare,
  ShoppingCart,
  Layers,
  LineChart,
  BadgeCheck,
  MapPin,
  TrendingDown,
  Clock,
  Megaphone,
  Sparkles,
  Gavel,
  FileCheck,
} from "lucide-react";
import KbobWidget from "@/components/KbobWidget";

/* Kernfunktionen — alle gleichwertig */
const CORE = [
  {
    icon: Users,
    title: "Vernetzen",
    text: "Firmenprofile, Verified-Badge (CHE-Nummer) und Connect zwischen Bauunternehmen und Baustoffwerken.",
    href: "/feed",
  },
  {
    icon: MessagesSquare,
    title: "Chatten & Verhandeln",
    text: "Direktnachrichten zwischen verbundenen Firmen — Angebote und Gegenangebote direkt im Chat.",
    href: "/messages",
  },
  {
    icon: ShoppingCart,
    title: "Beschaffen",
    text: "Material direkt bestellen — mit optionaler „Smart Bündeln“-Checkbox für Volumenrabatte.",
    href: "/dashboard",
  },
  {
    icon: Layers,
    title: "Bündeln",
    text: "Preistreppe, Sealed-Bid und garantierter Tier-Rabatt für regionale Smart Pools.",
    href: "/pools",
  },
  {
    icon: LineChart,
    title: "Preisindex",
    text: "KBOB-Index vs. Smart-Pool-Durchschnittspreise — nach Material und Region.",
    href: "/kbob",
  },
];

/* Mock: aktive Pools für den Ticker */
const POOLS = [
  { material: "Beton C25/30", region: "Zürich", volume: "180 m³", tier: "12 %", deadline: "4 Tage" },
  { material: "Bewehrungsstahl B500B", region: "Bern", volume: "48 t", tier: "12 %", deadline: "9 Tage" },
  { material: "Koffer-/Wandkies 0/45", region: "Nordwestschweiz", volume: "320 t", tier: "20 %", deadline: "2 Tage" },
  { material: "Beton C30/37", region: "Innerschweiz", volume: "90 m³", tier: "5 %", deadline: "12 Tage" },
];

/* Mock: Firmen-Vorschau fürs Netzwerk */
const COMPANIES = [
  { name: "Bätschmann Bau AG", city: "Zürich", uid: "CHE-102.345.678", cat: "Bauunternehmen" },
  { name: "Kies + Beton Mittelland", city: "Bern", uid: "CHE-114.987.221", cat: "Baustoffwerk" },
  { name: "Rhomberg Hochbau", city: "Luzern", uid: "CHE-108.556.019", cat: "Bauunternehmen" },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section className="grid grid-cols-1 items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-600">
            <Users className="h-3.5 w-3.5 text-brand" />
            Das B2B-Netzwerk der Schweizer Baubranche
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Vernetzen, verhandeln,{" "}
            <span className="text-brand">beschaffen.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-500">
            ConstruxNet verbindet Bauunternehmen und Baustoffwerke auf einer
            Plattform: Firmenprofile und Connections, Direktverhandlungen im
            Chat und Materialbeschaffung — optional gebündelt zu Smart Pools für
            spürbare Volumenrabatte.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/beschaffung"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-colors hover:bg-brand-600"
            >
              <ShoppingCart className="h-4 w-4" />
              Materialbedarf melden
            </Link>
            <Link
              href="/feed"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100"
            >
              Netzwerk entdecken
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <KbobWidget />
      </section>

      {/* Kernfunktionen */}
      <section>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CORE.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className="group rounded-lg border border-slate-200 bg-white p-5 backdrop-blur transition-colors hover:border-brand/40 hover:bg-slate-50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/15 text-brand">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 flex items-center gap-1.5 font-semibold text-slate-900">
                {f.title}
                <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </h3>
              <p className="mt-1.5 text-sm text-slate-500">{f.text}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* So funktioniert's */}
      <section className="pt-16 sm:pt-20">
        <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8">
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand">So funktioniert&apos;s</span>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                In vier Schritten von der Anfrage zum Vertrag
              </h2>
            </div>
            <Link
              href="/beschaffung"
              className="inline-flex items-center gap-1.5 self-start rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600 sm:self-auto"
            >
              <ShoppingCart className="h-4 w-4" /> Jetzt starten
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Megaphone, title: "Bedarf melden", text: "Material, Menge und Region in vier Schritten erfassen — oder per Foto/Datei hochladen." },
              { icon: Sparkles, title: "Optional bündeln", text: "Smart Pool aktivieren und Bedarf mit Firmen in deiner Region zu Volumenrabatt bündeln." },
              { icon: Gavel, title: "Angebot & Zuschlag", text: "Baustoffwerke geben Sealed-Bid-Angebote ab — bestes Angebot erhält den Zuschlag." },
              { icon: FileCheck, title: "Liefern & SIA-Vertrag", text: "Lieferung und rechtssicherer SIA-118-Vertrag — direkt in deinem Dashboard." },
            ].map((s, i) => (
              <div key={s.title} className="relative rounded-lg border border-slate-200 p-4">
                <span className="absolute right-3 top-3 text-2xl font-bold text-slate-100">{i + 1}</span>
                <span className="grid h-10 w-10 place-items-center rounded-md bg-brand/10 text-brand">
                  <s.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pool-Ticker */}
      <section className="py-16 sm:py-20">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Aktive Smart Pools
          </h2>
          <Link
            href="/pools"
            className="text-sm font-medium text-brand hover:text-brand-600"
          >
            Alle ansehen →
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {POOLS.map((p, i) => (
            <div
              key={i}
              className="w-64 shrink-0 rounded-lg border border-slate-200 bg-white p-4 backdrop-blur"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">
                  {p.material}
                </span>
                <span className="rounded-md bg-emerald/15 px-2 py-0.5 text-[11px] font-semibold text-emerald">
                  {p.tier}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                {p.region}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium text-slate-700">{p.volume}</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {p.deadline}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Netzwerk-Vorschau */}
      <section className="pb-16 sm:pb-20">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Firmen im Netzwerk
          </h2>
          <Link
            href="/network"
            className="text-sm font-medium text-brand hover:text-brand-600"
          >
            Zum Netzwerk →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {COMPANIES.map((c) => (
            <div
              key={c.uid}
              className="rounded-lg border border-slate-200 bg-white p-5 backdrop-blur"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700">
                  {c.name
                    .split(" ")
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald/15 px-2 py-0.5 text-[11px] font-medium text-emerald">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verifiziert
                </span>
              </div>
              <h3 className="mt-3 font-semibold text-slate-900">{c.name}</h3>
              <p className="text-xs text-slate-500">
                {c.cat} · {c.city}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-600">{c.uid}</p>
              <button
                type="button"
                className="mt-4 w-full rounded-lg border border-brand/40 bg-brand/10 px-3 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand/20"
              >
                + Vernetzen
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ROI-Teaser */}
      <section className="pb-20">
        <div className="flex flex-col items-center gap-4 rounded-lg border border-slate-200 bg-white p-8 text-center backdrop-blur sm:p-12">
          <span className="inline-flex items-center gap-2 rounded-md bg-emerald/15 px-3 py-1 text-xs font-medium text-emerald">
            <TrendingDown className="h-3.5 w-3.5" />
            12–15 % typische Ersparnis
          </span>
          <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Wie viel spart dein Betrieb mit Smart Pools?
          </h2>
          <p className="max-w-xl text-slate-500">
            Der ROI-Rechner ermittelt aus deinem Jahresmaterialbudget die
            realistische Ersparnis über ConstruxNet.
          </p>
          <Link
            href="/kbob"
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-colors hover:bg-brand-600"
          >
            Preisvergleich ansehen
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-600">
        ConstruxNet — Das B2B-Netzwerk der Schweizer Baubranche
      </footer>
    </main>
  );
}
