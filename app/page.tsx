import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
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

/* ------------------------------------------------------------------ */
/*  Produkt-Mock im Hero (dunkel, zurückhaltend)                       */
/* ------------------------------------------------------------------ */
function HeroMock() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-8 -z-10 rounded-[32px] bg-gradient-to-br from-brand/25 via-accent-500/10 to-transparent blur-3xl" />
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-navy-800 shadow-[0_30px_80px_-24px_rgba(0,0,0,0.7)]">
        {/* Browser-Chrome */}
        <div className="flex items-center gap-2 border-b border-white/10 bg-navy-900 px-3.5 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="ml-2 flex-1 truncate rounded-md bg-white/5 px-2.5 py-1 text-[11px] text-white/40 ring-1 ring-white/10">
            construxnet.ch/pools
          </span>
        </div>
        <div className="space-y-3 p-4">
          {/* Aktiver Pool */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand/15 text-brand">
                  <Layers className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-[12.5px] font-semibold text-white">Beton C25/30</div>
                  <div className="text-[10px] text-white/40">Raum Zürich · Ausschreibung läuft</div>
                </div>
              </div>
              <span className="rounded-md border border-brand/40 bg-brand/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand">
                Sealed-Bid
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[77%] rounded-full bg-gradient-to-r from-brand to-brand-600" />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-white/45">
              <span>230 / 300 m³ gebündelt</span>
              <span className="text-brand">Nächstes Tier in 70 m³</span>
            </div>
          </div>
          {/* KBOB-Verlauf */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
            <div className="mb-2 flex items-center justify-between text-[10px]">
              <span className="font-semibold text-white/70">KBOB-Referenz · 12 Monate</span>
              <span className="text-white/40">Basis fürs Angebot</span>
            </div>
            <div className="flex items-end justify-between gap-1">
              {[40, 52, 46, 60, 54, 68, 58, 72, 64, 78, 70, 84].map((h, i) => (
                <span
                  key={i}
                  className={`w-full rounded-sm ${i >= 9 ? "bg-brand" : "bg-accent-500/70"}`}
                  style={{ height: `${h * 0.7}px` }}
                />
              ))}
            </div>
          </div>
          {/* Netzwerk-Zeile */}
          <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy-950 text-[10px] font-bold text-white">BB</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-[11.5px] font-semibold text-white">
                Bätschmann Bau AG <BadgeCheck className="h-3 w-3 text-brand" />
              </div>
              <div className="text-[9.5px] text-white/40">Bauunternehmen · Zürich</div>
            </div>
            <span className="rounded-md border border-white/15 px-2 py-1 text-[10px] font-semibold text-white/70">
              Vernetzen
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <main className="bg-navy-950 text-white">
      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden border-b border-white/10">
        {/* Ambient-Verläufe */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-24 lg:pt-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[12px] font-medium text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              Das B2B-Netzwerk der Schweizer Baubranche
            </span>
            <h1 className="mt-5 text-[2.6rem] font-bold leading-[1.05] tracking-[-0.03em] text-white sm:text-6xl">
              Bauen beginnt mit dem{" "}
              <span className="bg-gradient-to-r from-brand to-brand-500 bg-clip-text text-transparent">
                richtigen Netzwerk.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/60">
              Vernetze dich mit verifizierten Firmen, baue feste
              <span className="font-semibold text-white/90"> Beschaffungs-Partnerschaften</span> auf
              und bündelt euren Materialbedarf zu Smart Pools — für Konditionen,
              die alleine niemand bekommt.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/beschaffung"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-navy-950 shadow-[0_8px_24px_-8px_rgba(217,144,0,0.6)] transition-colors hover:bg-brand-500"
              >
                <ShoppingCart className="h-4 w-4" /> Materialbedarf melden
              </Link>
              <Link
                href="/network"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Netzwerk entdecken <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {/* Fakten statt erfundener Kennzahlen */}
            <div className="mt-9 grid max-w-lg grid-cols-3 gap-5 border-t border-white/10 pt-6">
              {FACTS.map((s) => (
                <div key={s.l}>
                  <div className="text-lg font-bold tracking-tight text-white sm:text-xl">{s.v}</div>
                  <div className="mt-0.5 text-[11.5px] leading-tight text-white/50">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <HeroMock />
        </div>

        {/* Vertrauens-Streifen — neutrale, wahre Merkmale (keine Kundenlogos) */}
        <div className="relative border-t border-white/10 bg-white/[0.02]">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-4 sm:px-6">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
              Geprüfte Schweizer Beschaffung
            </span>
            {PROOF.map((p) => (
              <span key={p.t} className="inline-flex items-center gap-2 text-sm font-medium text-white/60">
                <p.icon className="h-4 w-4 text-brand/80" />
                {p.t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 3-Akt-Story ================= */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">Die Idee</span>
          <h2 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            Vernetzen ist der Anfang.<br />
            <span className="text-white/50">Bessere Konditionen sind das Ziel.</span>
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
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-brand/30 hover:bg-white/[0.05]"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/20">
                <a.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-xl font-bold tracking-tight text-white">{a.t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-white/55">{a.d}</p>
              <Link
                href={a.href}
                className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand transition-colors hover:text-brand-500"
              >
                {a.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ================= Smart Pools (Feature-Band) ================= */}
      <section className="border-y border-white/10 bg-gradient-to-b from-navy-900 to-navy-950">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[12px] font-semibold text-brand">
              <Combine className="h-3.5 w-3.5" /> Smart Pools
            </span>
            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
              Gemeinsam bündeln.<br />
              <span className="text-brand">Verdeckt ausschreiben.</span> Fair beschaffen.
            </h2>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/60">
              Mehrere Firmen bündeln ihren regionalen Bedarf zu grösserem Volumen.
              Die Baustoffwerke geben darauf <b className="text-white/90">verdeckte Angebote (Sealed-Bid)</b> ab
              — das beste Angebot gegenüber dem <b className="text-white/90">KBOB-Referenzpreis</b> erhält den Zuschlag.
            </p>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/60">
              Je grösser das gebündelte Volumen, desto höher der{" "}
              <b className="text-white/90">garantierte Netto-Mindestvorteil</b>. Kein fixer Einheitsrabatt —
              das beste Angebot kann die Garantie sogar übertreffen.
            </p>
            <Link
              href="/pools"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-brand-500"
            >
              Smart Pools ansehen <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Konkretes Bündelungs-Beispiel statt abstrakter Tiers */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand/15 text-brand">
                  <Layers className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-[14px] font-bold text-white">Beton C25/30 · Raum Zürich</div>
                  <div className="text-[11px] text-white/40">So entsteht ein Pool</div>
                </div>
              </div>
              <span className="rounded-md border border-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/50">
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
                <div key={f.n} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
                  <Building2 className="h-4 w-4 text-white/40" />
                  <span className="flex-1 text-[13px] text-white/70">{f.n}</span>
                  <span className="text-[13px] font-semibold text-white">{f.v}</span>
                </div>
              ))}
            </div>

            {/* Summe */}
            <div className="mt-3 flex items-center justify-between rounded-lg border border-brand/30 bg-brand/10 px-3.5 py-3">
              <span className="text-[13px] font-semibold text-white">Gebündeltes Volumen</span>
              <span className="text-[15px] font-bold text-brand">300 m³ · ≈ CHF 120’000</span>
            </div>

            {/* Ergebnis-Kette */}
            <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
              <div className="flex items-start gap-3">
                <Gavel className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <p className="text-[13px] leading-relaxed text-white/60">
                  Werke geben <b className="text-white/85">Sealed-Bid-Angebote</b> gegen den KBOB-Referenzpreis ab.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <p className="text-[13px] leading-relaxed text-white/60">
                  In dieser Grösse: <b className="text-white/85">16&nbsp;% garantierter Netto-Mindestvorteil</b>
                  <span className="text-white/40"> (je nach Volumen 5–28&nbsp;%)</span> — das beste Angebot kann mehr bringen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= So funktioniert's (ohne Nummern) ================= */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">So funktioniert&apos;s</span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Von der Anfrage zum Vertrag
          </h2>
        </div>

        <div className="relative">
          {/* Verbindungslinie (Desktop) */}
          <div className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent lg:block" />
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {[
              { icon: Megaphone, title: "Bedarf melden", text: "Material, Menge und Region erfassen — oder per Foto und Datei hochladen." },
              { icon: Combine, title: "Optional bündeln", text: "Smart Pool aktivieren und mit Firmen in deiner Region gemeinsam beschaffen." },
              { icon: Gavel, title: "Angebot & Zuschlag", text: "Baustoffwerke geben Sealed-Bid-Angebote ab — das beste gegenüber KBOB gewinnt." },
              { icon: FileCheck, title: "Liefern & Vertrag", text: "Lieferung und rechtssicherer SIA-118-Vertrag, alles im Dashboard." },
            ].map((s) => (
              <div key={s.title} className="relative flex flex-col items-start">
                <span className="relative z-10 grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-navy-800 text-brand shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)]">
                  <s.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-[15px] font-semibold text-white">{s.title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/55">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Pools + Netzwerk (Vorschau) ================= */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 pb-20 sm:px-6 lg:grid-cols-2">
        {/* Pools */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold tracking-tight text-white">Aktive Smart Pools</h2>
              <span className="rounded-md border border-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                Vorschau
              </span>
            </div>
            <Link href="/pools" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-500">
              Alle <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="space-y-2.5">
            {POOLS.map((p, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 transition-colors hover:border-brand/30 hover:bg-white/[0.04]"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
                  <Layers className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-semibold text-white">{p.material}</div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-white/45">
                    <MapPin className="h-3 w-3" /> {p.region} · {p.volume}
                  </div>
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-600" style={{ width: `${p.fill}%` }} />
                  </div>
                </div>
                <span className="hidden shrink-0 items-center gap-1 self-start text-[11px] text-white/40 sm:inline-flex">
                  <Clock className="h-3 w-3" /> {p.deadline}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Netzwerk */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold tracking-tight text-white">Firmen im Netzwerk</h2>
              <span className="rounded-md border border-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                Vorschau
              </span>
            </div>
            <Link href="/network" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-500">
              Zum Netzwerk <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="space-y-2.5">
            {COMPANIES.map((c) => (
              <li
                key={c.uid}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 transition-colors hover:border-brand/30 hover:bg-white/[0.04]"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy-950 text-[11px] font-bold text-white ring-1 ring-white/10">
                  {c.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 truncate text-[13.5px] font-semibold text-white">
                    {c.name} <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-brand" />
                  </div>
                  <div className="truncate text-[11px] text-white/45">{c.cat} · {c.city} · {c.uid}</div>
                </div>
                <Link
                  href="/network"
                  className="shrink-0 rounded-lg border border-brand/40 px-3 py-1.5 text-[12px] font-semibold text-brand transition-colors hover:bg-brand/10"
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
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 p-8 sm:p-14">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-accent-500/15 blur-3xl" />
          <div className="relative flex flex-col items-start gap-5 sm:max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[12px] font-semibold text-brand">
              <ShieldCheck className="h-3.5 w-3.5" /> Erst zahlen, wenn du sparst
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Bereit, günstiger und vernetzter zu bauen?
            </h2>
            <p className="text-[15px] leading-relaxed text-white/60">
              Erstelle dein verifiziertes Firmenprofil und melde deinen ersten Materialbedarf — in wenigen Minuten.
            </p>
            <div className="mt-1 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-navy-950 shadow-[0_8px_24px_-8px_rgba(217,144,0,0.6)] transition-colors hover:bg-brand-500"
              >
                Kostenlos registrieren <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/beschaffung"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Materialbedarf melden
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Footer ================= */}
      <footer className="border-t border-white/10 bg-navy-950">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 font-semibold tracking-tight text-white">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-600 text-navy-950">
                <HardHat className="h-4 w-4" />
              </span>
              Construx<span className="text-brand">Net</span>
            </div>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-white/50">
              Das B2B-Netzwerk der Schweizer Baubranche — vernetzen, verhandeln, beschaffen.
            </p>
          </div>
          {[
            { h: "Plattform", links: [["Feed", "/feed"], ["Netzwerk", "/network"], ["Smart Pools", "/pools"], ["KBOB Index", "/kbob"]] },
            { h: "Beschaffung", links: [["Bedarf melden", "/beschaffung"], ["Nachrichten", "/messages"], ["Dashboard", "/dashboard"]] },
            { h: "Konto", links: [["Registrieren", "/sign-up"], ["Login", "/sign-in"]] },
          ].map((col) => (
            <div key={col.h}>
              <div className="text-[11px] font-bold uppercase tracking-wider text-white/40">{col.h}</div>
              <ul className="mt-3 space-y-2">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-[13px] text-white/60 transition-colors hover:text-brand">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 py-5 text-center text-[12px] text-white/40">
          © {new Date().getFullYear()} ConstruxNet · Schweizer Baubranche
        </div>
      </footer>
    </main>
  );
}
