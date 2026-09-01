import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import {
  ArrowRight,
  Users,
  MessagesSquare,
  ShoppingCart,
  Layers,
  BadgeCheck,
  MapPin,
  Clock,
  Megaphone,
  Gavel,
  FileCheck,
  Combine,
  ShieldCheck,
  Scale,
  Building2,
  HardHat,
  Search,
  UploadCloud,
  Plus,
  Coins,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Daten (illustrative Produkt-Vorschau — pre-launch)                 */
/* ------------------------------------------------------------------ */
const POOLS = [
  { material: "Beton C25/30", region: "Zürich", volume: "180 m³", deadline: "4 Tage", fill: 77 },
  { material: "Bewehrungsstahl B500B", region: "Bern", volume: "48 t", deadline: "9 Tage", fill: 54 },
  { material: "Koffer-/Wandkies 0/45", region: "Nordwestschweiz", volume: "320 t", deadline: "2 Tage", fill: 88 },
  { material: "Beton C30/37", region: "Innerschweiz", volume: "90 m³", deadline: "12 Tage", fill: 32 },
];

const COMPANIES = [
  { name: "Bätschmann Bau AG", city: "Zürich", uid: "CHE-102.345.678", cat: "Bauunternehmen" },
  { name: "Kies + Beton Mittelland", city: "Bern", uid: "CHE-114.987.221", cat: "Baustoffwerk" },
  { name: "Rhomberg Hochbau", city: "Luzern", uid: "CHE-108.556.019", cat: "Bauunternehmen" },
];

/* Wahre, belegbare Fakten statt erfundener Kennzahlen (Quelle: tiers.js / KBOB / Prozess) */
const FACTS = [
  { v: "5–28 %", l: "garantierter Netto-Mindestvorteil — je nach gebündeltem Volumen" },
  { v: "KBOB", l: "amtlicher Referenzpreis als faire Preisbasis" },
  { v: "Sealed-Bid", l: "verdeckte Angebote der Baustoffwerke" },
];

/* Neutrale, wahre Vertrauens-Merkmale (keine Kundenlogos — wir starten gerade) */
const PROOF = [
  { icon: ShieldCheck, t: "CHE-geprüfte Firmen" },
  { icon: Scale, t: "KBOB-Referenzpreise" },
  { icon: Gavel, t: "Sealed-Bid-Ausschreibung" },
  { icon: FileCheck, t: "SIA-118-Verträge" },
];

/* B2B-Funktionsraster — reale Fähigkeiten, keine erfundenen Features */
const FEATURES = [
  { icon: Combine, t: "Automatisierte Beschaffung", d: "Bedarf melden, mit anderen Firmen bündeln und Sealed-Bid-Angebote gegen den KBOB-Referenzpreis erhalten." },
  { icon: Building2, t: "Projekt-Zuordnung", d: "Materialbedarf, Bestellungen und Warenkorb einer Baustelle im Dashboard zuordnen." },
  { icon: Scale, t: "KBOB-Konformität", d: "Jedes Angebot wird laufend mit dem amtlichen KBOB-Referenzpreis verglichen — transparent und nachvollziehbar." },
  { icon: UploadCloud, t: "Ausschreibungen als PDF", d: "Leistungsverzeichnisse direkt im Dashboard hochladen und dem Bedarf zuordnen." },
  { icon: ShieldCheck, t: "Verifiziertes Netzwerk", d: "Nur CHE-geprüfte Bauunternehmen und Baustoffwerke — direkt vernetzen, statt kalt akquirieren." },
  { icon: FileCheck, t: "SIA-118-Verträge", d: "Rechtssichere Vertragsabwicklung vom Zuschlag bis zur Lieferung, alles im Dashboard." },
];

/* ------------------------------------------------------------------ */
/*  Header (eigenständig, hell — ersetzt für "/" die dunkle Marketing- */
/*  Leiste aus AppShell)                                               */
/* ------------------------------------------------------------------ */
function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-slate-900">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-600 text-white">
            <HardHat className="h-4 w-4" />
          </span>
          Obta<span className="text-accent">net</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
          <Link href="/network" className="transition-colors hover:text-slate-900">Netzwerk</Link>
          <Link href="/pools" className="transition-colors hover:text-slate-900">Smart Pools</Link>
          <Link href="/kbob" className="transition-colors hover:text-slate-900">KBOB Index</Link>
        </nav>

        <div className="flex items-center gap-2">
          <SignedOut>
            <Link href="/sign-in" className="hidden px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 sm:inline-block">
              Login
            </Link>
            <Link
              href="/sign-up"
              className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-700"
            >
              Kostenlos starten
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-700"
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
    <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_30px_60px_-20px_rgba(15,23,42,0.15)]">
      {/* Browser-Chrome */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="ml-2 flex-1 truncate rounded-md bg-white px-2.5 py-1 text-[11px] text-slate-400 ring-1 ring-slate-200">
          obtanet.ch/dashboard
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-[140px_minmax(0,1fr)_170px] sm:gap-4 sm:p-4">
        {/* Links: Navigation */}
        <div className="hidden rounded-lg border border-slate-200 bg-slate-50/60 p-2.5 sm:block">
          <div className="mb-2 rounded-md bg-accent/10 px-2.5 py-1.5 text-[11px] font-semibold text-accent">Beschaffung</div>
          {["Übersicht", "Bestellungen", "Verträge", "Berichte"].map((n) => (
            <div key={n} className="mb-1 rounded-md px-2.5 py-1.5 text-[11px] text-slate-400">{n}</div>
          ))}
        </div>

        {/* Mitte: Suche + Tabelle */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400">Material, SIA-Norm oder Bedarf …</span>
          </div>
          <div className="rounded-lg border border-slate-200">
            {[
              { m: "Beton C25/30", p: "156 / m³" },
              { m: "Bewehrungsstahl B500B", p: "1'108 / t" },
              { m: "Koffer-/Wandkies 0/45", p: "39 / t" },
            ].map((r, i) => (
              <div key={r.m} className={`flex items-center justify-between px-3 py-2 text-[11px] ${i > 0 ? "border-t border-slate-100" : ""}`}>
                <span className="font-medium text-slate-700">{r.m}</span>
                <span className="flex items-center gap-2 text-slate-400">
                  CHF {r.p}
                  <span className="grid h-5 w-5 place-items-center rounded border border-brand/30 bg-brand/10 text-brand">
                    <Plus className="h-3 w-3" />
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rechts: Warenkorb & KBOB */}
        <div className="space-y-2.5">
          <div className="rounded-lg border border-slate-200 p-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Warenkorb</div>
            <div className="mt-1.5 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Zwischensumme</span>
              <span className="font-semibold text-slate-800">CHF 41'520</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-accent">
              <span>Mindestvorteil</span>
              <span className="font-semibold">− CHF 4'980</span>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 p-2.5">
            <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              <Coins className="h-3 w-3" /> KBOB-Index
            </div>
            <div className="mt-1 text-[13px] font-bold text-slate-800">CHF 156.12</div>
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
      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-accent-50 blur-3xl" />

        <div className="relative mx-auto max-w-3xl px-4 pb-14 pt-16 text-center sm:px-6 lg:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[12px] font-medium text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            Für Bauunternehmen &amp; Baustoffwerke
          </span>
          <h1 className="mt-5 text-[2.4rem] font-bold leading-[1.08] tracking-[-0.03em] text-slate-900 sm:text-6xl">
            Beschaffung bündeln.<br />
            <span className="text-accent">Gegen KBOB ausschreiben.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-slate-500">
            Materialbedarf mit anderen Firmen bündeln, Ausschreibungen als PDF direkt im
            Dashboard hochladen und jedes Angebot automatisch gegen den amtlichen{" "}
            <span className="font-semibold text-slate-700">KBOB-Referenzpreis</span> vergleichen.
          </p>
          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/beschaffung"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(27,58,92,0.5)] transition-colors hover:bg-accent-700"
            >
              <ShoppingCart className="h-4 w-4" /> Materialbedarf melden
            </Link>
            <Link
              href="/network"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
            >
              Netzwerk entdecken <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Fakten statt erfundener Kennzahlen */}
          <div className="mx-auto mt-10 grid max-w-lg grid-cols-3 gap-5 border-t border-slate-200 pt-6">
            {FACTS.map((s) => (
              <div key={s.l}>
                <div className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">{s.v}</div>
                <div className="mt-0.5 text-[11.5px] leading-tight text-slate-500">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= App-Vorschau ================= */}
        <div className="relative bg-slate-50 px-4 py-14 sm:px-6">
          <AppPreview />
        </div>

        {/* Vertrauens-Streifen — neutrale, wahre Merkmale (keine Kundenlogos) */}
        <div className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-5 sm:px-6">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Geprüfte Schweizer Beschaffung
            </span>
            {PROOF.map((p) => (
              <span key={p.t} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                <p.icon className="h-4 w-4 text-brand" />
                {p.t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 3-Akt-Story ================= */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Die Idee</span>
          <h2 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            Vernetzen ist der Anfang.<br />
            <span className="text-slate-400">Bessere Konditionen sind das Ziel.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[
            {
              icon: Users,
              t: "Vernetzen",
              d: "Finde verifizierte Bauunternehmen und Baustoffwerke (CHE-geprüft) in deiner Region und verbinde dich direkt.",
              href: "/network",
              cta: "Zum Netzwerk",
            },
            {
              icon: MessagesSquare,
              t: "Partnerschaften bilden",
              d: "Aus Kontakten werden feste Beschaffungs-Partnerschaften: gemeinsam planen, direkt verhandeln, verbindlich abschliessen.",
              href: "/messages",
              cta: "Nachrichten",
            },
            {
              icon: Layers,
              t: "Gemeinsam bündeln",
              d: "Möchtest du von besseren Konditionen profitieren? Bündle deinen Materialbedarf mit anderen Firmen — je grösser das gemeinsame Volumen, desto höher der garantierte Mindestvorteil.",
              href: "/pools",
              cta: "Smart Pools",
            },
          ].map((a) => (
            <div
              key={a.t}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-shadow hover:shadow-cardhover"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/20">
                <a.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-900">{a.t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-500">{a.d}</p>
              <Link
                href={a.href}
                className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-accent transition-colors hover:text-accent-700"
              >
                {a.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ================= B2B-Funktionsraster ================= */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-12 max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Funktionen</span>
            <h2 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              Gebaut für die Beschaffung.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.t} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-accent">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-[15px] font-bold text-slate-900">{f.t}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-500">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Smart Pools (Feature-Band) ================= */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[12px] font-semibold text-brand">
              <Combine className="h-3.5 w-3.5" /> Smart Pools
            </span>
            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              Gemeinsam bündeln.<br />
              <span className="text-accent">Verdeckt ausschreiben.</span> Fair beschaffen.
            </h2>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-slate-500">
              Mehrere Firmen bündeln ihren regionalen Bedarf zu grösserem Volumen.
              Die Baustoffwerke geben darauf <b className="text-slate-800">verdeckte Angebote (Sealed-Bid)</b> ab
              — das beste Angebot gegenüber dem <b className="text-slate-800">KBOB-Referenzpreis</b> erhält den Zuschlag.
            </p>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-slate-500">
              Je grösser das gebündelte Volumen, desto höher der{" "}
              <b className="text-slate-800">garantierte Netto-Mindestvorteil</b>. Kein fixer Einheitsrabatt —
              das beste Angebot kann die Garantie sogar übertreffen.
            </p>
            <Link
              href="/pools"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-700"
            >
              Smart Pools ansehen <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Konkretes Bündelungs-Beispiel statt abstrakter Tiers */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
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
              <span className="rounded-md border border-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Beispiel
              </span>
            </div>

            {/* Beitragende Firmen */}
            <div className="mt-5 space-y-2">
              {[
                { n: "Firma A", v: "120 m³" },
                { n: "Firma B", v: "90 m³" },
                { n: "Firma C", v: "90 m³" },
              ].map((f) => (
                <div key={f.n} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <span className="flex-1 text-[13px] text-slate-600">{f.n}</span>
                  <span className="text-[13px] font-semibold text-slate-900">{f.v}</span>
                </div>
              ))}
            </div>

            {/* Summe */}
            <div className="mt-3 flex items-center justify-between rounded-lg border border-brand/30 bg-brand/10 px-3.5 py-3">
              <span className="text-[13px] font-semibold text-slate-800">Gebündeltes Volumen</span>
              <span className="text-[15px] font-bold text-brand">300 m³ · ≈ CHF 120’000</span>
            </div>

            {/* Ergebnis-Kette */}
            <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
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

      {/* ================= So funktioniert's (ohne Nummern) ================= */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-12 max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">So funktioniert&apos;s</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Von der Anfrage zum Vertrag
            </h2>
          </div>

          <div className="relative">
            {/* Verbindungslinie (Desktop) */}
            <div className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-slate-200 lg:block" />
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {[
                { icon: Megaphone, title: "Bedarf melden", text: "Material, Menge und Region erfassen — oder per Foto und Datei hochladen." },
                { icon: Combine, title: "Optional bündeln", text: "Smart Pool aktivieren und mit Firmen in deiner Region gemeinsam beschaffen." },
                { icon: Gavel, title: "Angebot & Zuschlag", text: "Baustoffwerke geben Sealed-Bid-Angebote ab — das beste gegenüber KBOB gewinnt." },
                { icon: FileCheck, title: "Liefern & Vertrag", text: "Lieferung und rechtssicherer SIA-118-Vertrag, alles im Dashboard." },
              ].map((s) => (
                <div key={s.title} className="relative flex flex-col items-start">
                  <span className="relative z-10 grid h-14 w-14 place-items-center rounded-2xl border border-slate-200 bg-white text-accent shadow-card">
                    <s.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-[15px] font-semibold text-slate-900">{s.title}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-500">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= Pools + Netzwerk (Vorschau) ================= */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-20 sm:px-6 lg:grid-cols-2">
        {/* Pools */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold tracking-tight text-slate-900">Aktive Smart Pools</h2>
              <span className="rounded-md border border-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Vorschau
              </span>
            </div>
            <Link href="/pools" className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-700">
              Alle <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="space-y-2.5">
            {POOLS.map((p, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 transition-colors hover:border-accent/30 hover:bg-white"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
                  <Layers className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-semibold text-slate-800">{p.material}</div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                    <MapPin className="h-3 w-3" /> {p.region} · {p.volume}
                  </div>
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-200">
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
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold tracking-tight text-slate-900">Firmen im Netzwerk</h2>
              <span className="rounded-md border border-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Vorschau
              </span>
            </div>
            <Link href="/network" className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-700">
              Zum Netzwerk <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="space-y-2.5">
            {COMPANIES.map((c) => (
              <li
                key={c.uid}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 transition-colors hover:border-accent/30 hover:bg-white"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-[11px] font-bold text-white">
                  {c.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 truncate text-[13.5px] font-semibold text-slate-800">
                    {c.name} <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-accent" />
                  </div>
                  <div className="truncate text-[11px] text-slate-400">{c.cat} · {c.city} · {c.uid}</div>
                </div>
                <Link
                  href="/network"
                  className="shrink-0 rounded-lg border border-accent/30 px-3 py-1.5 text-[12px] font-semibold text-accent transition-colors hover:bg-accent/10"
                >
                  Vernetzen
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ================= Abschluss-CTA ================= */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-accent p-8 sm:p-14">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
          <div className="relative flex flex-col items-start gap-5 sm:max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[12px] font-semibold text-white">
              <ShieldCheck className="h-3.5 w-3.5" /> Erst zahlen, wenn du sparst
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Bereit, günstiger und vernetzter zu bauen?
            </h2>
            <p className="text-[15px] leading-relaxed text-white/75">
              Erstelle dein verifiziertes Firmenprofil und melde deinen ersten Materialbedarf — in wenigen Minuten.
            </p>
            <div className="mt-1 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-brand-500"
              >
                Kostenlos registrieren <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/beschaffung"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
              >
                Materialbedarf melden
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Footer ================= */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 font-semibold tracking-tight text-slate-900">
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
                    <Link href={href} className="text-[13px] text-slate-500 transition-colors hover:text-accent">{label}</Link>
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
