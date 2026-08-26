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
  ArrowUpRight,
  HardHat,
} from "lucide-react";

/* Kernfunktionen */
const CORE = [
  { icon: Users, title: "Vernetzen", text: "Verifizierte Firmenprofile (CHE-Nummer) und Connections zwischen Bau und Baustoffwerk.", href: "/feed" },
  { icon: MessagesSquare, title: "Verhandeln", text: "Direktnachrichten mit strukturierten Angeboten und Gegenangeboten im Chat.", href: "/messages" },
  { icon: ShoppingCart, title: "Beschaffen", text: "Materialbedarf in vier Schritten melden — optional automatisch gebündelt.", href: "/beschaffung" },
  { icon: Layers, title: "Bündeln", text: "Preistreppe, Sealed-Bid und garantierter Tier-Rabatt für regionale Smart Pools.", href: "/pools" },
  { icon: LineChart, title: "Preisindex", text: "KBOB-Index gegen Smart-Pool-Durchschnittspreise — nach Material und Region.", href: "/kbob" },
];

const POOLS = [
  { material: "Beton C25/30", region: "Zürich", volume: "180 m³", tier: "12 %", deadline: "4 Tage" },
  { material: "Bewehrungsstahl B500B", region: "Bern", volume: "48 t", tier: "12 %", deadline: "9 Tage" },
  { material: "Koffer-/Wandkies 0/45", region: "Nordwestschweiz", volume: "320 t", tier: "20 %", deadline: "2 Tage" },
  { material: "Beton C30/37", region: "Innerschweiz", volume: "90 m³", tier: "5 %", deadline: "12 Tage" },
];

const COMPANIES = [
  { name: "Bätschmann Bau AG", city: "Zürich", uid: "CHE-102.345.678", cat: "Bauunternehmen" },
  { name: "Kies + Beton Mittelland", city: "Bern", uid: "CHE-114.987.221", cat: "Baustoffwerk" },
  { name: "Rhomberg Hochbau", city: "Luzern", uid: "CHE-108.556.019", cat: "Bauunternehmen" },
];

const TRUST = ["KIBAG", "Vigier Beton", "Implenia", "Losinger Marazzi", "Holcim", "Eberhard"];

/* ------------------------------------------------------------------ */
/*  Produkt-Mock im Hero                                              */
/* ------------------------------------------------------------------ */
function HeroMock() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[28px] bg-gradient-to-br from-brand/20 via-accent/10 to-transparent blur-2xl" />
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_20px_50px_-12px_rgba(15,34,56,0.25)]">
        {/* Browser-Chrome */}
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="ml-2 flex-1 truncate rounded-md bg-white px-2.5 py-1 text-[11px] text-slate-400 ring-1 ring-slate-200">
            construxnet.ch/feed
          </span>
        </div>
        <div className="space-y-3 p-4">
          {/* Profil-Streifen */}
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="h-10 bg-gradient-to-r from-brand via-brand-600 to-accent" />
            <div className="flex items-center gap-2.5 px-3 pb-3">
              <div className="-mt-4 grid h-9 w-9 place-items-center rounded-lg border-2 border-white bg-navy text-[11px] font-bold text-white">BB</div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-[12px] font-semibold text-slate-900">
                  Bätschmann Bau AG <BadgeCheck className="h-3 w-3 text-accent" />
                </div>
                <div className="text-[10px] text-slate-400">Bauunternehmen · Zürich</div>
              </div>
              <span className="ml-auto rounded-sm border border-accent-500/30 bg-accent-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent-700">
                Offen für Aufträge
              </span>
            </div>
          </div>
          {/* KPI-Reihe */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { v: "CHF 4.2M", l: "Volumen", d: "+12%" },
              { v: "13.8 %", l: "Ø Ersparnis", d: "+2.3%" },
              { v: "1'847", l: "Bestellungen", d: "+8%" },
            ].map((k) => (
              <div key={k.l} className="rounded-lg border border-slate-200 p-2">
                <div className="text-[13px] font-bold text-slate-900">{k.v}</div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-400">{k.l}</span>
                  <span className="inline-flex items-center text-[9px] font-semibold text-accent">
                    <ArrowUpRight className="h-2.5 w-2.5" />{k.d}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {/* Pool-Karte + Mini-Chart */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-200 p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-800">Beton C25/30</span>
                <span className="rounded-sm border border-accent-500/30 bg-accent-50 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider text-accent-700">Tier 2</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-sm bg-slate-100">
                <div className="h-full w-[77%] rounded-sm bg-gradient-to-r from-accent to-accent/70" />
              </div>
              <div className="mt-1.5 text-[9px] text-slate-400">230 / 300 m³ · Raum Zürich</div>
            </div>
            <div className="flex items-end justify-between gap-1 rounded-lg border border-slate-200 p-2.5">
              {[40, 62, 48, 78, 56, 84, 66].map((h, i) => (
                <span key={i} className="w-full rounded-sm bg-brand/80" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 pb-14 pt-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-20 lg:pt-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[12px] font-medium text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Das B2B-Netzwerk der Schweizer Baubranche
            </span>
            <h1 className="mt-5 text-[2.6rem] font-bold leading-[1.05] tracking-[-0.03em] text-slate-900 sm:text-6xl">
              Bauen beginnt mit dem{" "}
              <span className="bg-gradient-to-r from-brand to-brand-600 bg-clip-text text-transparent">richtigen Netzwerk.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-slate-500">
              Vernetze dich mit verifizierten Bauunternehmen und Baustoffwerken,
              verhandle direkt und beschaffe Material — optional gebündelt zu
              Smart Pools mit garantiertem Volumenrabatt.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/beschaffung"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
              >
                <ShoppingCart className="h-4 w-4" /> Materialbedarf melden
              </Link>
              <Link
                href="/feed"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50"
              >
                Netzwerk entdecken <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {/* Trust-Stats */}
            <div className="mt-8 grid max-w-lg grid-cols-3 gap-4 border-t border-slate-200 pt-6">
              {[
                { v: "500+", l: "verifizierte Firmen" },
                { v: "13.8 %", l: "Ø Pool-Ersparnis" },
                { v: "CHF 98 Mio.", l: "gebündeltes Volumen" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-xl font-bold tracking-tight text-slate-900">{s.v}</div>
                  <div className="text-[12px] leading-tight text-slate-500">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <HeroMock />
        </div>

        {/* Trust-Strip */}
        <div className="border-t border-slate-200 bg-white/60">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-4 sm:px-6">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Vertraut von Firmen wie</span>
            {TRUST.map((t) => (
              <span key={t} className="text-sm font-semibold text-slate-400">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Kernfunktionen */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-8 max-w-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand">Eine Plattform</span>
          <h2 className="mt-1.5 text-3xl font-bold tracking-tight text-slate-900">
            Fünf Kernfunktionen, ein Workflow
          </h2>
          <p className="mt-2 text-slate-500">
            Von der ersten Verbindung bis zum unterschriebenen SIA-118-Vertrag — alles an einem Ort.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CORE.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className="group rounded-lg border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-cardhover"
            >
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand/10 text-brand ring-1 ring-brand/15">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 flex items-center gap-1.5 text-[17px] font-semibold text-slate-900">
                {f.title}
                <ArrowRight className="h-4 w-4 -translate-x-1 text-brand opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.text}</p>
            </Link>
          ))}
          {/* CTA-Kachel */}
          <Link
            href="/beschaffung"
            className="group flex flex-col justify-between rounded-lg border border-brand/30 bg-gradient-to-br from-brand/10 to-accent/10 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cardhover"
          >
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand text-white">
              <Megaphone className="h-5 w-5" />
            </span>
            <div className="mt-4">
              <h3 className="text-[17px] font-semibold text-slate-900">Jetzt Bedarf melden</h3>
              <p className="mt-1.5 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                In 4 Schritten zum Angebot <ArrowRight className="h-4 w-4" />
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Dunkles Feature-Band */}
      <section className="bg-navy">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[12px] font-medium text-white/80">
              <Sparkles className="h-3.5 w-3.5 text-brand" /> Smart Pools
            </span>
            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
              Gemeinsam bündeln.<br />Bis zu <span className="text-brand">20 % günstiger</span> beschaffen.
            </h2>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/60">
              ConstruxNet bündelt regionalen Bedarf automatisch nach KBOB-Referenz.
              Erreicht ein Pool das nächste Tier, erhalten <b className="text-white/90">alle</b> Teilnehmer
              denselben Rabatt — unabhängig vom Beitrittszeitpunkt.
            </p>
            <Link
              href="/pools"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-navy transition-transform hover:scale-[1.02]"
            >
              Smart Pools ansehen <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { t: "Tier 1", d: "5 %", r: "0–100" },
              { t: "Tier 2", d: "12 %", r: "101–300" },
              { t: "Tier 3", d: "20 %", r: "301+" },
            ].map((x, i) => (
              <div
                key={x.t}
                className={`rounded-xl border p-4 text-center ${i === 2 ? "border-brand/50 bg-brand/10" : "border-white/10 bg-white/5"}`}
              >
                <div className="text-[11px] font-semibold uppercase tracking-wider text-white/50">{x.t}</div>
                <div className={`mt-1 text-3xl font-bold ${i === 2 ? "text-brand" : "text-white"}`}>{x.d}</div>
                <div className="mt-0.5 text-[11px] text-white/40">{x.r} Einheiten</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* So funktioniert's */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-8 max-w-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand">So funktioniert&apos;s</span>
          <h2 className="mt-1.5 text-3xl font-bold tracking-tight text-slate-900">
            Von der Anfrage zum Vertrag — in vier Schritten
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Megaphone, title: "Bedarf melden", text: "Material, Menge und Region erfassen — oder per Foto/Datei hochladen." },
            { icon: Sparkles, title: "Optional bündeln", text: "Smart Pool aktivieren und mit Firmen in deiner Region bündeln." },
            { icon: Gavel, title: "Angebot & Zuschlag", text: "Baustoffwerke geben Sealed-Bid-Angebote ab — bestes gewinnt." },
            { icon: FileCheck, title: "Liefern & Vertrag", text: "Lieferung und rechtssicherer SIA-118-Vertrag im Dashboard." },
          ].map((s, i) => (
            <div key={s.title} className="relative rounded-lg border border-slate-200 bg-white p-5">
              <span className="absolute right-4 top-3 text-3xl font-bold text-slate-100">{i + 1}</span>
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand/10 text-brand">
                <s.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pools + Netzwerk (zwei Spalten, dicht) */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 pb-14 sm:px-6 lg:grid-cols-2">
        {/* Pools */}
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Aktive Smart Pools</h2>
            <Link href="/pools" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-600">
              Alle <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {POOLS.map((p, i) => (
              <li key={i} className="flex items-center gap-3 py-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
                  <Layers className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-slate-800">{p.material}</div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <MapPin className="h-3 w-3" /> {p.region} · {p.volume}
                  </div>
                </div>
                <span className="shrink-0 rounded-sm border border-accent-500/30 bg-accent-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-700">
                  −{p.tier}
                </span>
                <span className="hidden shrink-0 items-center gap-1 text-[11px] text-slate-400 sm:inline-flex">
                  <Clock className="h-3 w-3" /> {p.deadline}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Netzwerk */}
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Firmen im Netzwerk</h2>
            <Link href="/network" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-600">
              Zum Netzwerk <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {COMPANIES.map((c) => (
              <li key={c.uid} className="flex items-center gap-3 py-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-navy text-[11px] font-bold text-white">
                  {c.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 truncate text-[13px] font-semibold text-slate-800">
                    {c.name} <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-accent" />
                  </div>
                  <div className="truncate text-[11px] text-slate-400">{c.cat} · {c.city} · {c.uid}</div>
                </div>
                <Link
                  href="/network"
                  className="shrink-0 rounded-md border border-brand/40 px-3 py-1.5 text-[12px] font-semibold text-brand transition-colors hover:bg-brand/10"
                >
                  Vernetzen
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Abschluss-CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 sm:p-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />
          <div className="relative flex flex-col items-start gap-4 sm:max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-500/30 bg-accent-50 px-3 py-1 text-[12px] font-semibold text-accent-700">
              <TrendingDown className="h-3.5 w-3.5" /> 12–20 % typische Ersparnis
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Bereit, günstiger und vernetzter zu bauen?
            </h2>
            <p className="text-[15px] leading-relaxed text-slate-500">
              Erstelle dein verifiziertes Firmenprofil und melde deinen ersten Materialbedarf — in wenigen Minuten.
            </p>
            <div className="mt-1 flex flex-col gap-3 sm:flex-row">
              <Link href="/sign-up" className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600">
                Kostenlos registrieren <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/beschaffung" className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50">
                Materialbedarf melden
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-10 sm:px-6 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 font-semibold tracking-tight text-slate-900">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-600 text-white">
                <HardHat className="h-4 w-4" />
              </span>
              Construx<span className="text-brand">Net</span>
            </div>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-slate-500">
              Das B2B-Netzwerk der Schweizer Baubranche — vernetzen, verhandeln, beschaffen.
            </p>
          </div>
          {[
            { h: "Plattform", links: [["Feed", "/feed"], ["Netzwerk", "/network"], ["Smart Pools", "/pools"], ["KBOB Index", "/kbob"]] },
            { h: "Beschaffung", links: [["Bedarf melden", "/beschaffung"], ["Nachrichten", "/messages"], ["Dashboard", "/dashboard"]] },
            { h: "Konto", links: [["Registrieren", "/sign-up"], ["Login", "/sign-in"]] },
          ].map((col) => (
            <div key={col.h}>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{col.h}</div>
              <ul className="mt-3 space-y-2">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-[13px] text-slate-600 transition-colors hover:text-brand">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-200 py-5 text-center text-[12px] text-slate-400">
          © {new Date().getFullYear()} ConstruxNet · Schweizer Baubranche
        </div>
      </footer>
    </main>
  );
}
