import Link from "next/link";
import {
  ArrowRight,
  Megaphone,
  Layers,
  BadgeCheck,
  MapPin,
  Clock,
  Gavel,
  Combine,
  ShieldCheck,
  Building2,
  Search,
  Plus,
  Coins,
  Handshake,
  FileCheck,
  Truck,
  Users,
} from "lucide-react";
import { CARD } from "@/lib/ui";
import { cn } from "@/lib/utils";

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
  { icon: Megaphone, t: "Bedarf melden", d: "Material, Menge, Region — oder Ausschreibung als PDF." },
  { icon: Combine, t: "Bündeln", d: "Gleiche Bedarfe der Region werden zu einem Volumen." },
  { icon: Gavel, t: "Sealed-Bid", d: "Werke bieten verdeckt gegen den KBOB-Referenzpreis." },
  { icon: FileCheck, t: "Vertrag & Lieferung", d: "Zuschlag, SIA-118-Vertrag, Lieferung — im Dashboard." },
];

/* Feine Raster-Textur der dunklen Panels (identisch zum Feed) */
const GRID_BG = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)",
  backgroundSize: "26px 26px",
};

/* ------------------------------------------------------------------ */
/*  Produkt-Vorschau: Miniatur des 3-Spalten-Dashboards                */
/* ------------------------------------------------------------------ */
function AppPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white shadow-[0_30px_70px_-25px_rgba(0,0,0,0.55)]">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="ml-2 flex-1 truncate rounded-md bg-white px-2.5 py-1 text-[11px] text-slate-400 ring-1 ring-slate-200">
          obtanet.ch/dashboard
        </span>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_170px] gap-3 p-3.5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="text-[11.5px] text-slate-400">Material, SIA-Norm oder Bedarf …</span>
          </div>
          {[
            { m: "Beton C25/30", p: "156 / m³" },
            { m: "Bewehrungsstahl B500B", p: "1'108 / t" },
            { m: "Koffer-/Wandkies 0/45", p: "39 / t" },
          ].map((r) => (
            <div key={r.m} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-[12px]">
              <span className="font-semibold text-slate-700">{r.m}</span>
              <span className="flex items-center gap-2 text-slate-400">
                CHF {r.p}
                <span className="grid h-5 w-5 place-items-center rounded bg-brand/15 text-brand">
                  <Plus className="h-3 w-3" />
                </span>
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="rounded-md border border-slate-200 p-3">
            <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">Warenkorb</div>
            <div className="mt-2 text-[10.5px] text-slate-400">Zwischensumme</div>
            <div className="text-[13px] font-bold text-slate-800">CHF 41'520</div>
            <div className="mt-2 text-[10.5px] text-slate-400">Mindestvorteil</div>
            <div className="text-[13px] font-bold text-brand">− CHF 4'980</div>
          </div>
          <div className="rounded-md border border-slate-200 p-3">
            <div className="flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
              <Coins className="h-2.5 w-2.5" /> KBOB
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
    <main className="bg-slate-50">
      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06]" style={GRID_BG} />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-brand/20 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-brand/30 bg-brand/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand">
              <Layers className="h-3.5 w-3.5" /> Smart Bündeln
            </span>

            <h1 className="mt-4 text-[2.7rem] font-bold leading-[1.05] tracking-tight sm:text-[3.6rem]">
              Vernetzen. Bündeln.<br />
              <span className="text-brand">Sparen.</span>
            </h1>

            <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-white/60">
              Obtanet bündelt deinen Materialbedarf mit anderen Schweizer Baufirmen und
              holt Mengenrabatte heraus — auch kleine Bestellungen profitieren.
            </p>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <Link
                href="/beschaffung"
                className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-3 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-500"
              >
                <Megaphone className="h-4 w-4" /> Materialbedarf melden
              </Link>
              <Link
                href="/pools"
                className="inline-flex items-center gap-2 rounded-md border border-white/15 px-5 py-3 text-sm font-semibold text-white/85 transition-colors hover:bg-white/5"
              >
                Offene Bündel ansehen <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-5 text-[12.5px] text-white/45">
              <span><b className="text-brand">5–28 %</b> garantierter Netto-Mindestvorteil</span>
              <span>Verdeckte Sealed-Bid-Angebote</span>
              <span>Geprüfte Schweizer Lieferanten</span>
            </div>
          </div>

          <AppPreview />
        </div>
      </section>

      {/* ============ Zwei Wege zum besseren Preis ============ */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mb-8 max-w-2xl">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">Zwei Wege</span>
          <h2 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-[2.4rem]">
            Zum besseren Preis — gebündelt oder direkt.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Gebündelt */}
          <Link
            href="/pools"
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-navy-900 p-6 text-white transition-colors hover:border-brand/40 sm:p-7"
          >
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06]" style={GRID_BG} />
            <div className="relative">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand/15 text-brand">
                <Combine className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-xl font-bold tracking-tight">Gemeinsam bündeln</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-white/55">
                Dein Bedarf wird mit gleichen Bedarfen deiner Region zu einem grossen Volumen
                zusammengelegt. Die Werke bieten verdeckt darauf — je grösser das Bündel,
                desto höher der Mengenrabatt.
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-brand">
                Smart Pools ansehen <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>

          {/* Direkt */}
          <Link
            href="/network"
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-navy-800 p-6 text-white transition-colors hover:border-white/25 sm:p-7"
          >
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06]" style={GRID_BG} />
            <div className="relative">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-white/10 text-white">
                <Handshake className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-xl font-bold tracking-tight">Direkt verhandeln</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-white/55">
                Du willst nicht bündeln? Finde geprüfte Baustoffwerke im Netzwerk und
                verhandle direkt — mit dem KBOB-Referenzpreis als transparenter Basis.
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-white">
                Zum Netzwerk <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ================= Smart Pools ================= */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:py-20">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-brand/30 bg-brand/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand">
              <Layers className="h-3.5 w-3.5" /> Smart Pools
            </span>
            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-[2.4rem]">
              Mengenrabatte,<br />die alleine niemand bekommt.
            </h2>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-slate-500">
              Wer alleine einkauft, zahlt Einzelpreise. Obtanet bündelt den Bedarf mehrerer
              Baufirmen zu einem gemeinsamen Auftrag und verhandelt mit dem gesamten Volumen
              bei den Werken. <b className="text-slate-800">Je grösser das Bündel, desto höher
              der Rabatt</b> — auch für kleine Einzelbestellungen.
            </p>
            <Link
              href="/pools"
              className="mt-7 inline-flex items-center gap-2 rounded-md bg-navy-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
            >
              So funktioniert ein Pool <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Bündelungs-Grafik */}
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-navy-900 p-6 text-white shadow-[0_24px_60px_-24px_rgba(8,17,30,0.6)] sm:p-7">
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06]" style={GRID_BG} />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-brand/15 blur-3xl"
            />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-bold">Beton C25/30 · Raum Zürich</div>
                  <div className="text-[11px] text-white/40">Sammelphase läuft</div>
                </div>
                <span className="rounded-md border border-brand/30 bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                  Beispiel
                </span>
              </div>

              {/* Beitragende Firmen */}
              <div className="mt-5 grid grid-cols-3 gap-2">
                {[
                  { n: "Firma A", v: "120 m³" },
                  { n: "Firma B", v: "90 m³" },
                  { n: "Firma C", v: "90 m³" },
                ].map((f) => (
                  <div key={f.n} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-center">
                    <Building2 className="mx-auto h-4 w-4 text-white/35" />
                    <div className="mt-1.5 text-[11px] text-white/50">{f.n}</div>
                    <div className="text-[13px] font-bold">{f.v}</div>
                  </div>
                ))}
              </div>

              {/* Zusammenführung */}
              <div className="relative mt-3 flex justify-center">
                <div className="h-5 w-px bg-gradient-to-b from-white/10 to-brand/60" />
              </div>

              {/* Gebündeltes Volumen */}
              <div className="rounded-lg border border-brand/30 bg-brand/10 px-4 py-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] font-semibold text-white/85">Gebündeltes Volumen</span>
                  <span className="text-[15px] font-bold text-brand">300 m³</span>
                </div>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[86%] rounded-full bg-brand" />
                </div>
              </div>

              {/* Ergebnis */}
              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/10 pt-4">
                <div className="rounded-lg bg-white/[0.04] px-3 py-2.5">
                  <div className="text-[10px] uppercase tracking-wider text-white/40">Mengenrabatt</div>
                  <div className="mt-0.5 text-[19px] font-bold text-brand">16 %</div>
                  <div className="text-[10.5px] text-white/40">garantiert, ggü. KBOB</div>
                </div>
                <div className="rounded-lg bg-white/[0.04] px-3 py-2.5">
                  <div className="text-[10px] uppercase tracking-wider text-white/40">Ersparnis</div>
                  <div className="mt-0.5 text-[19px] font-bold text-white">CHF 19'200</div>
                  <div className="text-[10.5px] text-white/40">für alle Teilnehmer</div>
                </div>
              </div>

              <p className="relative mt-4 flex items-start gap-2 text-[11.5px] leading-relaxed text-white/45">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                Das beste Sealed-Bid-Angebot kann die Garantie sogar übertreffen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= So funktioniert's (kompakt) ================= */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-7 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[19px] font-bold tracking-tight text-slate-900">Von der Anfrage zum Vertrag</h2>
          <span className="text-[12px] text-slate-400">Vier Schritte, vollständig im Dashboard</span>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.t} className={cn(CARD, "flex items-start gap-3 p-4")}>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-navy-900 text-brand">
                <s.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="text-[13.5px] font-bold text-slate-900">{s.t}</div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-slate-500">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= Pools + Netzwerk ================= */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-4 pb-16 sm:px-6 lg:grid-cols-2">
        {/* Pools */}
        <div className={cn(CARD, "p-6")}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[16px] font-bold tracking-tight text-slate-900">Aktive Smart Pools</h2>
            <Link href="/pools" className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand hover:text-brand-600">
              Alle <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="space-y-2">
            {POOLS.map((p) => (
              <li key={p.material} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:border-brand/40">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy-900 text-brand">
                  <Layers className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-slate-900">{p.material}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                    <MapPin className="h-3 w-3" /> {p.region} · {p.volume}
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
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
        <div className={cn(CARD, "p-6")}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[16px] font-bold tracking-tight text-slate-900">Firmen im Netzwerk</h2>
            <Link href="/network" className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand hover:text-brand-600">
              Zum Netzwerk <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="space-y-2">
            {COMPANIES.map((c) => (
              <li key={c.uid} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:border-brand/40">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy-900 text-[11px] font-bold text-white">
                  {c.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 truncate text-[13px] font-semibold text-slate-900">
                    {c.name} <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-brand" />
                  </div>
                  <div className="truncate text-[11px] text-slate-400">{c.cat} · {c.city}</div>
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

      {/* ================= Abschluss-CTA ================= */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-navy-900 px-6 py-12 text-white sm:px-12 sm:py-16">
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06]" style={GRID_BG} />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-brand/20 blur-3xl"
          />
          <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-brand/30 bg-brand/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand">
                <ShieldCheck className="h-3.5 w-3.5" /> Erst zahlen, wenn du sparst
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-[2.3rem]">
                Bereit, günstiger und vernetzter zu bauen?
              </h2>
              <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/55">
                Firmenprofil erstellen, ersten Materialbedarf melden — in wenigen Minuten.
              </p>
              <div className="mt-7 flex flex-wrap gap-2.5">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-3 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-500"
                >
                  Kostenlos registrieren <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/beschaffung"
                  className="inline-flex items-center gap-2 rounded-md border border-white/15 px-5 py-3 text-sm font-semibold text-white/85 transition-colors hover:bg-white/5"
                >
                  Materialbedarf melden
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {[
                { icon: Users, t: "Geprüfte Schweizer Firmen", d: "CHE-verifiziert, keine anonymen Anbieter." },
                { icon: Coins, t: "KBOB als Preisbasis", d: "Jedes Angebot messbar gegen den Referenzpreis." },
                { icon: Truck, t: "Regional geliefert", d: "Werke aus deiner Region, kurze Wege." },
              ].map((f) => (
                <div key={f.t} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
                  <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <div>
                    <div className="text-[13px] font-semibold">{f.t}</div>
                    <div className="text-[11.5px] text-white/45">{f.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= Footer ================= */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 font-bold tracking-tight text-slate-900">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy-900 text-brand">
                <Layers className="h-4 w-4" />
              </span>
              Obta<span className="text-brand">net</span>
            </div>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-slate-500">
              Das B2B-Netzwerk der Schweizer Baubranche — vernetzen, bündeln, sparen.
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
                    <Link href={href} className="text-[13px] text-slate-500 transition-colors hover:text-brand">{label}</Link>
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
