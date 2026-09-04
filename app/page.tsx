import Link from "next/link";
import TwoWays from "@/components/home/TwoWays";
import ProcessVideo from "@/components/home/ProcessVideo";
import PhotoSlot from "@/components/home/PhotoSlot";
import PriceProof from "@/components/home/PriceProof";
import { PHOTO_POOLS, PHOTO_NETWORK, HERO_IMAGE } from "@/data/media";
import TrustBar from "@/components/home/TrustBar";
import {
  ArrowRight,
  Megaphone,
  Layers,
  BadgeCheck,
  MapPin,
  Clock,
  ShieldCheck,
  Building2,
  Search,
  Plus,
  Coins,
  Handshake,
  Truck,
  Users,
} from "lucide-react";
import {
  GROUND,
  PANEL,
  ROW_HOVER,
  SECTION_WIDE,
  D_XL,
  D_LG,
  D_MD,
  LEAD,
  EYEBROW,
  SECTION,
  SECTION_TIGHT,
  BTN_GOLD,
  BTN_OUTLINE_DARK,
  BTN_LIGHT,
} from "@/lib/ui";
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
  { name: "Muster Bau AG", city: "Zürich", uid: "CHE-102.345.678", cat: "Bauunternehmen" },
  { name: "Beispiel Beton Mittelland", city: "Bern", uid: "CHE-114.987.221", cat: "Baustoffwerk" },
  { name: "Musterbau Innerschweiz AG", city: "Luzern", uid: "CHE-108.556.019", cat: "Bauunternehmen" },
];

// Bewusst ohne Icons: eine Nummer und zwei Zeilen Text tragen den Ablauf
// besser als vier Symbolkacheln, die alle gleich aussehen.
const STEPS = [
  { t: "Bedarf melden", d: "Material, Menge, Region — oder die Ausschreibung als PDF." },
  { t: "Bündeln", d: "Gleiche Bedarfe derselben Region werden zu einem Volumen." },
  { t: "Sealed-Bid", d: "Werke bieten verdeckt gegen den KBOB-Referenzpreis." },
  { t: "Vertrag & Lieferung", d: "Zuschlag, SIA-118-Vertrag, Lieferung — alles im Dashboard." },
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

export default function Home() {
  return (
    <main className={GROUND}>
      {/* ============================ HERO ============================ */}
      {/* Vollflaechiges Bild statt einer Grafik neben dem Text. Der Kran bei
          Nacht bringt das Navy der Marke schon mit — es muss nichts eingefaerbt
          werden. Zwei Verlaeufe legen sich darueber: einer von links, damit die
          Schrift steht, einer von unten, damit der Uebergang zum naechsten
          Abschnitt nicht abreisst. */}
      <section className="relative isolate overflow-hidden bg-navy-950 text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-[64%_38%]"
        />
        {/* Zwei getrennte Abdunklungen statt einer fuer alles.
            Am Bildschirm steht der Text links neben dem Bild, also faellt
            der Verlauf von links. Auf dem Handy steht er MITTEN darauf —
            dort braucht es eine Abdunklung von unten und oben, sonst laeuft
            die Schrift ueber das Kranlicht und wird unlesbar. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/60 to-navy-950/70 lg:hidden"
        />
        <div
          aria-hidden
          className="absolute inset-0 hidden bg-gradient-to-r from-navy-950 via-navy-950/82 to-navy-950/5 lg:block"
        />
        <div
          aria-hidden
          className="absolute inset-0 hidden bg-gradient-to-t from-navy-950 via-transparent to-navy-950/45 lg:block"
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="py-24 sm:py-32 lg:w-[56%] lg:py-44">
            <span className={EYEBROW}>Smart Bündeln</span>

            <h1 className={cn(D_XL, "mt-5 text-white")}>
              Vernetzen.<br />Bündeln.<br />
              <span className="text-brand">Sparen.</span>
            </h1>

            <p className={cn(LEAD, "mt-7 max-w-lg text-white/70")}>
              Obtanet bündelt deinen Materialbedarf mit anderen Schweizer Baufirmen und
              holt Mengenrabatte heraus — auch kleine Bestellungen profitieren.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/beschaffung" className={BTN_GOLD}>
                <Megaphone className="h-4 w-4" /> Materialbedarf melden
              </Link>
              <Link href="/pools" className={BTN_OUTLINE_DARK}>
                Offene Bündel ansehen <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Vertrauensanker ================= */}
      <TrustBar />

      {/* ============ Zwei Wege zum besseren Preis ============ */}
      <TwoWays />

      {/* ================= Smart Pools ================= */}
      <section className="border-y border-white/[0.07] bg-[#080F19]">
        <div className={cn("mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr]", SECTION)}>
          <div>
            <span className={EYEBROW}>Smart Pools</span>
            <h2 className={cn(D_LG, "mt-5 text-white")}>
              Mengenrabatte,<br />die alleine niemand bekommt.
            </h2>
            <p className={cn(LEAD, "mt-7 max-w-lg text-white/60")}>
              Wer alleine einkauft, zahlt Einzelpreise. Obtanet bündelt den Bedarf mehrerer
              Baufirmen zu einem gemeinsamen Auftrag und verhandelt mit dem gesamten Volumen
              bei den Werken. <b className="text-white">Je grösser das Bündel, desto höher
              der Rabatt</b> — auch für kleine Einzelbestellungen.
            </p>
            <Link href="/pools" className={cn(BTN_LIGHT, "mt-9")}>
              So funktioniert ein Pool <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Bündelungs-Grafik */}
          <div className="relative overflow-hidden rounded-[26px] border border-white/[0.09] bg-navy-900 p-6 text-white shadow-[0_24px_60px_-24px_rgba(8,17,30,0.6)] sm:rounded-[30px] sm:p-7">
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
                <span className="rounded-full border border-brand/30 bg-brand/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
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
                  <div key={f.n} className="rounded-2xl border border-white/[0.09] bg-white/[0.04] px-3 py-2.5 text-center">
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
              <div className="rounded-2xl border border-brand/30 bg-brand/10 px-4 py-3.5">
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
                <div className="rounded-2xl bg-white/[0.04] px-3 py-2.5">
                  <div className="text-[10px] uppercase tracking-wider text-white/40">Mengenrabatt</div>
                  <div className="mt-0.5 text-[19px] font-bold text-brand">16 %</div>
                  <div className="text-[10.5px] text-white/40">garantiert, ggü. KBOB</div>
                </div>
                <div className="rounded-2xl bg-white/[0.04] px-3 py-2.5">
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

      {/* ================= Von der Anfrage zum Vertrag ================= */}
      {/* Bewusst ohne Karten und ohne Symbole. Vier Nummern, vier Titel,
          vier Zeilen — der Ablauf braucht keinen Rahmen, um Ablauf zu sein. */}
      <section className="bg-navy-950 text-white">
        <div className={cn("mx-auto max-w-6xl px-4 sm:px-6", SECTION)}>
          <div className="max-w-2xl">
            <span className={EYEBROW}>Ablauf</span>
            <h2 className={cn(D_MD, "mt-5 text-white")}>Von der Anfrage zum Vertrag</h2>
            <p className={cn(LEAD, "mt-6 text-white/55")}>
              Vier Schritte, vollständig im Dashboard — von der ersten Meldung bis zur
              Lieferung auf die Baustelle.
            </p>
          </div>

          <ol className="mt-16 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.t} className="border-t border-white/15 pt-5">
                <div className="font-display text-[26px] font-bold tabular-nums leading-none text-brand">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-5 text-[19px] font-bold tracking-tight text-white">{step.t}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-white/50">{step.d}</p>
              </li>
            ))}
          </ol>

          {/* Ablauf als Video — erscheint, sobald die Adresse in data/media.ts steht */}
          <ProcessVideo />
        </div>
      </section>

      {/* ================= Der Beweis in Zahlen ================= */}
      {/* Deutlich vom Ablauf darueber abgesetzt: eigener Grundton, Haarlinie
          oben, und der weiteste Abstand der ganzen Seite. Auf einer durchweg
          dunklen Seite trennt nicht mehr die Farbe, sondern der Raum. */}
      <section className="border-t border-white/[0.08] bg-[#040810]">
        <div className={cn("mx-auto max-w-6xl px-4 sm:px-6", SECTION_WIDE)}>
          <div className="mx-auto max-w-2xl text-center">
            <span className={EYEBROW}>Der Unterschied in Zahlen</span>
            <h2 className={cn(D_MD, "mt-5 text-white")}>
              Was du heute zahlst — und was gebündelt möglich ist.
            </h2>
            <p className={cn(LEAD, "mt-6 text-white/55")}>
              Jede Zeile misst sich am KBOB-Referenzpreis. Kein Prospektversprechen,
              sondern die Grösse, gegen die auf Obtanet jedes Angebot antritt.
            </p>
          </div>

          <div className="mx-auto mt-14 max-w-3xl sm:mt-16">
            <PriceProof />
          </div>
        </div>
      </section>

      {/* ================= Pools + Netzwerk ================= */}
      <section className={cn("mx-auto grid max-w-6xl grid-cols-1 gap-5 px-4 sm:px-6 lg:grid-cols-2", SECTION_TIGHT)}>
        {/* Pools */}
        <div className={cn(PANEL, "overflow-hidden")}>
          <div className="h-40 border-b border-white/[0.08] sm:h-44">
            <PhotoSlot slot={PHOTO_POOLS} />
          </div>
          <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[16px] font-bold tracking-tight text-white">Aktive Smart Pools</h2>
            <Link href="/pools" className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand hover:text-brand-500">
              Alle <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="space-y-2">
            {POOLS.map((p) => (
              <li key={p.material} className={cn(ROW_HOVER, "flex items-center gap-3 p-3")}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/15 text-brand ring-1 ring-brand/25">
                  <Layers className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-white">{p.material}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-[11px] text-white/45">
                    <MapPin className="h-3 w-3" /> {p.region} · {p.volume}
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${p.fill}%` }} />
                  </div>
                </div>
                <span className="hidden shrink-0 items-center gap-1 self-start text-[11px] text-white/40 sm:inline-flex">
                  <Clock className="h-3 w-3" /> {p.deadline}
                </span>
              </li>
            ))}
          </ul>
          </div>
        </div>

        {/* Netzwerk */}
        <div className={cn(PANEL, "overflow-hidden")}>
          <div className="h-40 border-b border-white/[0.08] sm:h-44">
            <PhotoSlot slot={PHOTO_NETWORK} />
          </div>
          <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[16px] font-bold tracking-tight text-white">Firmen im Netzwerk</h2>
            <Link href="/network" className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand hover:text-brand-500">
              Zum Netzwerk <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="space-y-2">
            {COMPANIES.map((c) => (
              <li key={c.uid} className={cn(ROW_HOVER, "flex items-center gap-3 p-3")}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-[11px] font-bold text-white ring-1 ring-white/15">
                  {c.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 truncate text-[13px] font-semibold text-white">
                    {c.name} <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-brand" />
                  </div>
                  <div className="truncate text-[11px] text-white/45">{c.cat} · {c.city}</div>
                </div>
                <Link
                  href="/network"
                  className="shrink-0 rounded-full border border-brand/50 px-3.5 py-1.5 text-[12px] font-semibold text-brand transition-colors hover:bg-brand/15"
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
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:pb-32">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-navy-900 px-6 py-14 text-white sm:rounded-[32px] sm:px-14 sm:py-20">
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06]" style={GRID_BG} />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-brand/20 blur-3xl"
          />
          <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <span className={EYEBROW}>Erst zahlen, wenn du sparst</span>
              <h2 className={cn(D_MD, "mt-5")}>
                Bereit, günstiger und vernetzter zu bauen?
              </h2>
              <p className={cn(LEAD, "mt-6 max-w-lg text-white/55")}>
                Firmenprofil erstellen, ersten Materialbedarf melden — in wenigen Minuten.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/sign-up" className={BTN_GOLD}>
                  Kostenlos registrieren <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/beschaffung" className={BTN_OUTLINE_DARK}>
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
                <div key={f.t} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
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
      <footer className="border-t border-white/[0.08] bg-[#0B1522]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 font-bold tracking-tight text-white">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy-900 text-brand">
                <Layers className="h-4 w-4" />
              </span>
              Obta<span className="text-brand">net</span>
            </div>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-white/55">
              Das B2B-Netzwerk der Schweizer Baubranche — vernetzen, bündeln, sparen.
            </p>
          </div>
          {[
            { h: "Plattform", links: [["Feed", "/feed"], ["Netzwerk", "/network"], ["Smart Pools", "/pools"], ["KBOB Index", "/kbob"]] },
            { h: "Beschaffung", links: [["Bedarf melden", "/beschaffung"], ["Nachrichten", "/messages"], ["Dashboard", "/dashboard"]] },
            { h: "Konto", links: [["Registrieren", "/sign-up"], ["Login", "/sign-in"]] },
            { h: "Rechtliches", links: [["Impressum", "/impressum"], ["AGB", "/agb"], ["Datenschutz", "/datenschutz"]] },
          ].map((col) => (
            <div key={col.h}>
              <div className="text-[11px] font-bold uppercase tracking-wider text-white/40">{col.h}</div>
              <ul className="mt-3 space-y-2">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-[13px] text-white/55 transition-colors hover:text-brand">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-white/[0.08] py-5 text-center text-[12px] text-white/40">
          <span>© {new Date().getFullYear()} Obtanet · Schweizer Baubranche</span>
          <span aria-hidden>·</span>
          <Link href="/impressum" className="transition-colors hover:text-brand">Impressum</Link>
          <Link href="/agb" className="transition-colors hover:text-brand">AGB</Link>
          <Link href="/datenschutz" className="transition-colors hover:text-brand">Datenschutz</Link>
        </div>
      </footer>
    </main>
  );
}
