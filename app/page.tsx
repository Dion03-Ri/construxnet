import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import {
  ArrowRight,
  ShoppingCart,
  Layers,
  BadgeCheck,
  MapPin,
  Clock,
  Gavel,
  FileCheck,
  Combine,
  ShieldCheck,
  Building2,
  HardHat,
  Search,
  Plus,
  Coins,
  Users,
  MessagesSquare,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Daten (illustrative Produkt-Vorschau — pre-launch)                 */
/* ------------------------------------------------------------------ */
const POOLS = [
  { material: "Beton C25/30", region: "Zürich", volume: "180 m³", deadline: "4 Tage", fill: 77 },
  { material: "Bewehrungsstahl B500B", region: "Bern", volume: "48 t", deadline: "9 Tage", fill: 54 },
  { material: "Koffer-/Wandkies 0/45", region: "Nordwestschweiz", volume: "320 t", deadline: "2 Tage", fill: 88 },
];

const COMPANIES = [
  { name: "Bätschmann Bau AG", city: "Zürich", uid: "CHE-102.345.678", cat: "Bauunternehmen" },
  { name: "Kies + Beton Mittelland", city: "Bern", uid: "CHE-114.987.221", cat: "Baustoffwerk" },
  { name: "Rhomberg Hochbau", city: "Luzern", uid: "CHE-108.556.019", cat: "Bauunternehmen" },
];

const STEPS = [
  { n: "01", title: "Bedarf melden", text: "Material, Menge und Region erfassen — oder direkt eine Ausschreibung als PDF hochladen." },
  { n: "02", title: "Optional bündeln", text: "Mit Firmen in deiner Region zusammenlegen und das gemeinsame Volumen ausschreiben." },
  { n: "03", title: "Angebot & Zuschlag", text: "Baustoffwerke bieten verdeckt (Sealed-Bid) — das beste Angebot gegenüber KBOB gewinnt." },
  { n: "04", title: "Liefern & Vertrag", text: "Lieferung und rechtssicherer SIA-118-Vertrag, alles nachvollziehbar im Dashboard." },
];

/* ------------------------------------------------------------------ */
/*  Header — eigenständig, hell, ersetzt für "/" die dunkle Marketing- */
/*  Leiste aus AppShell                                                */
/* ------------------------------------------------------------------ */
function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 text-[20px] font-extrabold tracking-tight text-slate-900">
          <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-gradient-to-br from-brand to-brand-600 text-white">
            <HardHat className="h-4.5 w-4.5" />
          </span>
          Obta<span className="text-accent">net</span>
        </Link>

        <nav className="hidden items-center gap-8 text-[14px] font-semibold text-slate-500 md:flex">
          <Link href="/feed" className="transition-colors hover:text-slate-900">Feed</Link>
          <Link href="/network" className="transition-colors hover:text-slate-900">Netzwerk</Link>
          <Link href="/pools" className="transition-colors hover:text-slate-900">Smart Pools</Link>
          <Link href="/kbob" className="transition-colors hover:text-slate-900">KBOB Index</Link>
        </nav>

        <div className="flex items-center gap-2">
          <SignedOut>
            <Link href="/sign-in" className="hidden px-3 py-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900 sm:inline-block">
              Login
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-accent px-5 py-2.5 text-[14px] font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-accent-700 hover:shadow-[0_10px_28px_-6px_rgba(27,58,92,0.4)]"
            >
              Kostenlos starten
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-[14px] font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-accent-700 hover:shadow-[0_10px_28px_-6px_rgba(27,58,92,0.4)]"
            >
              Zum Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  App-Vorschau: helle, minimalistische Miniatur des 3-Spalten-       */
/*  Dashboards (Navigation · Beschaffung · Warenkorb)                  */
/* ------------------------------------------------------------------ */
function AppPreview() {
  return (
    <div className="mx-auto max-w-4xl overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_40px_90px_-30px_rgba(15,23,42,0.22)]">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4.5 py-3.5">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="ml-2.5 flex-1 truncate rounded-[7px] bg-white px-3 py-1.5 text-[12px] text-slate-400 ring-1 ring-slate-200">
          obtanet.ch/dashboard
        </span>
      </div>

      <div className="grid grid-cols-[150px_minmax(0,1fr)_190px] gap-4.5 p-5.5">
        {/* Links: Navigation */}
        <div className="hidden rounded-xl bg-slate-50 p-3 sm:block">
          <div className="mb-1.5 rounded-lg bg-accent/[0.08] px-2.5 py-2 text-[12px] font-bold text-accent">Beschaffung</div>
          {["Übersicht", "Verträge", "Berichte"].map((n) => (
            <div key={n} className="mb-0.5 rounded-lg px-2.5 py-2 text-[12px] text-slate-400">{n}</div>
          ))}
        </div>

        {/* Mitte: Suche + Tabelle */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3.5 py-2.5">
            <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="text-[12px] text-slate-400">Material, SIA-Norm oder Bedarf …</span>
          </div>
          {[
            { m: "Beton C25/30", p: "156 / m³" },
            { m: "Bewehrungsstahl B500B", p: "1'108 / t" },
            { m: "Koffer-/Wandkies 0/45", p: "39 / t" },
          ].map((r) => (
            <div key={r.m} className="flex items-center justify-between rounded-lg border border-slate-200 px-3.5 py-2.5 text-[12.5px]">
              <span className="font-semibold text-slate-700">{r.m}</span>
              <span className="flex items-center gap-2 text-slate-400">
                CHF {r.p}
                <span className="grid h-5 w-5 place-items-center rounded-md bg-brand/10 text-brand">
                  <Plus className="h-3 w-3" />
                </span>
              </span>
            </div>
          ))}
        </div>

        {/* Rechts: Warenkorb & KBOB */}
        <div className="hidden space-y-2.5 sm:block">
          <div className="rounded-xl border border-slate-200 p-3.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Warenkorb</div>
            <div className="mt-2 flex flex-col gap-0.5">
              <span className="text-[11px] text-slate-400">Zwischensumme</span>
              <span className="text-[14px] font-bold text-slate-800">CHF 41'520</span>
            </div>
            <div className="mt-2.5 flex flex-col gap-0.5">
              <span className="text-[11px] text-slate-400">Mindestvorteil</span>
              <span className="text-[14px] font-bold text-accent">− CHF 4'980</span>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3.5">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <Coins className="h-3 w-3" /> KBOB-Index
            </div>
            <div className="mt-1.5 text-[14px] font-bold text-slate-800">CHF 156.12</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <main className="bg-white text-slate-900">
      <Header />

      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden bg-white pb-16 pt-24 sm:pb-20 sm:pt-32">
        <div className="pointer-events-none absolute left-1/2 top-[-160px] h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-brand/[0.07] blur-3xl" />

        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-[12px] font-bold uppercase tracking-wider text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            Für Bauunternehmen &amp; Baustoffwerke
          </span>

          <h1 className="mx-auto mt-7 max-w-[880px] text-[clamp(2.6rem,7.2vw,5.25rem)] font-black leading-[1.03] tracking-[-0.04em] text-slate-900">
            Beschaffung bündeln.<br />
            Zum <span className="text-brand">besten</span> Preis.
          </h1>

          <p className="mx-auto mt-6 max-w-lg text-[17px] leading-relaxed text-slate-500">
            Materialbedarf mit anderen Firmen bündeln, Ausschreibungen als PDF direkt im
            Dashboard hochladen und jedes Angebot automatisch gegen den amtlichen
            KBOB-Referenzpreis vergleichen.
          </p>

          <p className="mx-auto mt-5 max-w-xl text-[13.5px] font-medium text-slate-400">
            <b className="text-accent">5–28&nbsp;%</b> garantierter Netto-Mindestvorteil
            <span className="mx-2.5">·</span>Verdeckte Sealed-Bid-Angebote
            <span className="mx-2.5">·</span>Geprüfte Schweizer Lieferanten
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              href="/beschaffung"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-[15px] font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-accent-700 hover:shadow-[0_14px_32px_-8px_rgba(27,58,92,0.45)]"
            >
              <ShoppingCart className="h-4 w-4" /> Materialbedarf melden
            </Link>
          </div>
        </div>

        {/* App-Vorschau */}
        <div className="relative mt-16 px-4 sm:px-6">
          <AppPreview />
        </div>
      </section>

      {/* ================= Story-Satz ================= */}
      <section className="mx-auto max-w-4xl px-4 py-28 text-center sm:px-6 sm:py-36">
        <p className="text-[clamp(1.5rem,3.6vw,2.6rem)] font-bold leading-[1.5] tracking-tight text-slate-300">
          Wer allein beschafft, zahlt den Einzelpreis.<br />
          Wer sich <b className="text-slate-900">vernetzt</b>, verhandelt auf{" "}
          <span className="text-brand">Augenhöhe.</span>
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[14px] font-semibold text-accent">
          <Link href="/network" className="inline-flex items-center gap-1.5 hover:text-accent-700">
            <Users className="h-4 w-4" /> Verifizierte Firmen finden
          </Link>
          <Link href="/messages" className="inline-flex items-center gap-1.5 hover:text-accent-700">
            <MessagesSquare className="h-4 w-4" /> Direkt verhandeln
          </Link>
        </div>
      </section>

      {/* ================= Smart Pools ================= */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-4 py-24 sm:px-6 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1.5 text-[12px] font-bold text-brand">
              <Combine className="h-3.5 w-3.5" /> Smart Pools
            </span>
            <h2 className="mt-5 text-[clamp(1.9rem,3.6vw,2.75rem)] font-extrabold leading-[1.1] tracking-tight text-slate-900">
              Gemeinsam bündeln.<br />
              <span className="text-accent">Verdeckt ausschreiben.</span> Fair beschaffen.
            </h2>
            <p className="mt-5 max-w-lg text-[15.5px] leading-relaxed text-slate-500">
              Mehrere Firmen bündeln ihren regionalen Bedarf zu grösserem Volumen. Die
              Baustoffwerke geben darauf <b className="text-slate-800">verdeckte Angebote
              (Sealed-Bid)</b> ab — das beste Angebot gegenüber dem{" "}
              <b className="text-slate-800">KBOB-Referenzpreis</b> erhält den Zuschlag.
              Kein fixer Einheitsrabatt für alle: Je grösser das gebündelte Volumen, desto
              höher der <b className="text-slate-800">garantierte Netto-Mindestvorteil</b> —
              und das beste Angebot kann die Garantie sogar übertreffen.
            </p>
            <Link
              href="/pools"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[14px] font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-accent-700"
            >
              Smart Pools ansehen <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Konkretes Bündelungs-Beispiel statt abstrakter Tiers */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.12)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent">
                  <Layers className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-[14px] font-bold text-slate-900">Beton C25/30 · Raum Zürich</div>
                  <div className="text-[11px] text-slate-400">So entsteht ein Pool</div>
                </div>
              </div>
              <span className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Beispiel
              </span>
            </div>

            <div className="mt-5 space-y-2">
              {[
                { n: "Firma A", v: "120 m³" },
                { n: "Firma B", v: "90 m³" },
                { n: "Firma C", v: "90 m³" },
              ].map((f) => (
                <div key={f.n} className="flex items-center gap-3 rounded-lg bg-slate-50 px-3.5 py-2.5">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <span className="flex-1 text-[13px] text-slate-600">{f.n}</span>
                  <span className="text-[13px] font-bold text-slate-900">{f.v}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between rounded-lg border border-brand/30 bg-brand/10 px-4 py-3.5">
              <span className="text-[13px] font-bold text-slate-800">Gebündeltes Volumen</span>
              <span className="text-[15px] font-extrabold text-brand">300 m³ · ≈ CHF 120'000</span>
            </div>

            <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
              <div className="flex items-start gap-3">
                <Gavel className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <p className="text-[13px] leading-relaxed text-slate-500">
                  Werke geben <b className="text-slate-700">Sealed-Bid-Angebote</b> gegen den KBOB-Referenzpreis ab.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <p className="text-[13px] leading-relaxed text-slate-500">
                  In dieser Grösse: <b className="text-slate-700">16&nbsp;% garantierter Netto-Mindestvorteil</b>
                  <span className="text-slate-400"> (je nach Volumen 5–28&nbsp;%)</span> — das beste Angebot kann mehr bringen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= So funktioniert's ================= */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        <div className="mb-16 text-center">
          <span className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-brand">So funktioniert&apos;s</span>
          <h2 className="mt-3 text-[clamp(1.9rem,3.6vw,2.75rem)] font-extrabold tracking-tight text-slate-900">
            Von der Anfrage zum Vertrag
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n}>
              <div className="text-[3.4rem] font-black leading-none tracking-tight text-slate-200">{s.n}</div>
              <h3 className="mt-4 text-[16px] font-extrabold tracking-tight text-slate-900">{s.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-500">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= Pools + Netzwerk (Vorschau) ================= */}
      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-24 sm:px-6 lg:grid-cols-2">
          {/* Pools */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[17px] font-extrabold tracking-tight text-slate-900">Aktive Smart Pools</h2>
              <Link href="/pools" className="inline-flex items-center gap-1 text-[13.5px] font-bold text-accent hover:text-accent-700">
                Alle <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <ul className="space-y-2">
              {POOLS.map((p, i) => (
                <li key={i} className="flex items-center gap-3.5 rounded-xl border border-slate-200 p-3.5 transition-colors hover:border-accent/30">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
                    <Layers className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-bold text-slate-800">{p.material}</div>
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                      <MapPin className="h-3 w-3" /> {p.region} · {p.volume}
                    </div>
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-brand" style={{ width: `${p.fill}%` }} />
                    </div>
                  </div>
                  <span className="hidden shrink-0 items-center gap-1 self-start text-[11px] text-slate-400 sm:inline-flex">
                    <Clock className="h-3 w-3" /> {p.deadline}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Netzwerk */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[17px] font-extrabold tracking-tight text-slate-900">Firmen im Netzwerk</h2>
              <Link href="/network" className="inline-flex items-center gap-1 text-[13.5px] font-bold text-accent hover:text-accent-700">
                Zum Netzwerk <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <ul className="space-y-2">
              {COMPANIES.map((c) => (
                <li key={c.uid} className="flex items-center gap-3.5 rounded-xl border border-slate-200 p-3.5 transition-colors hover:border-accent/30">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-[11px] font-bold text-white">
                    {c.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 truncate text-[13.5px] font-bold text-slate-800">
                      {c.name} <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-accent" />
                    </div>
                    <div className="truncate text-[11px] text-slate-400">{c.cat} · {c.city}</div>
                  </div>
                  <Link
                    href="/network"
                    className="shrink-0 rounded-full border border-accent/30 px-3.5 py-1.5 text-[12px] font-bold text-accent transition-colors hover:bg-accent/10"
                  >
                    Vernetzen
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ================= Abschluss-CTA ================= */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="relative overflow-hidden rounded-[28px] bg-accent px-8 py-20 text-center sm:px-14">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-brand/25 blur-3xl" />
          <div className="relative mx-auto max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[12px] font-bold text-white">
              <ShieldCheck className="h-3.5 w-3.5" /> Erst zahlen, wenn du sparst
            </span>
            <h2 className="mt-5 text-[clamp(1.9rem,3.6vw,2.6rem)] font-extrabold tracking-tight text-white">
              Bereit, günstiger und vernetzter zu bauen?
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-white/70">
              Erstelle dein verifiziertes Firmenprofil und melde deinen ersten Materialbedarf — in wenigen Minuten.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-7 py-3.5 text-[15px] font-bold text-navy-950 transition-all hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-[0_14px_32px_-8px_rgba(217,144,0,0.5)]"
              >
                Kostenlos registrieren <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Footer ================= */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 font-extrabold tracking-tight text-slate-900">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-600 text-white">
                <HardHat className="h-4 w-4" />
              </span>
              Obta<span className="text-accent">net</span>
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
                    <Link href={href} className="text-[13px] font-medium text-slate-500 transition-colors hover:text-accent">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-200 py-5 text-center text-[12px] text-slate-400">
          © {new Date().getFullYear()} Obtanet · Schweizer Baubranche
        </div>
      </footer>
    </main>
  );
}
