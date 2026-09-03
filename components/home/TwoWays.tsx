import Link from "next/link";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { D_LG, D_MD, EYEBROW, BTN_LIGHT, SECTION } from "@/lib/ui";

/**
 * Zwei Wege zum besseren Preis — im Aufbau der grossen Produktkarten:
 * dunkler Grund, sehr weiche Ecken, hauchdünner Rand, mittig Titel, kurzer
 * Satz, runder Knopf — und darunter ein Bild, das bis an die untere Kante
 * läuft und von unten leuchtet.
 *
 * Die Bilder sind aus unseren eigenen Bausteinen gebaut, nicht eingekauft:
 * links die Bündelung (drei Bedarfe werden ein Volumen), rechts der direkte
 * Weg (ein Werk, ein Preis gegen die KBOB-Referenz).
 */

const GRID_BG = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)",
  backgroundSize: "26px 26px",
};

function Card({
  title,
  lead,
  cta,
  href,
  children,
}: {
  title: string;
  lead: string;
  cta: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[28px] border border-white/[0.09] bg-[#08111C] pt-9 sm:rounded-[32px] sm:pt-12">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.04]" style={GRID_BG} />

      <div className="relative px-6 text-center sm:px-10">
        <h3 className={cn(D_MD, "text-white")}>{title}</h3>
        <p className="mx-auto mt-4 max-w-[24rem] text-[14.5px] font-medium leading-relaxed text-white/60 sm:text-[15.5px]">
          {lead}
        </p>
        <Link
          href={href}
          className={cn(BTN_LIGHT, "mt-7 sm:mt-8")}
        >
          {cta}
        </Link>
      </div>

      {/* Bildfläche: läuft bis an die untere Kante und leuchtet von unten */}
      <div className="relative mt-7 h-[206px] overflow-hidden sm:mt-9 sm:h-[228px]">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 left-1/2 h-[240px] w-[78%] max-w-[420px] -translate-x-1/2 rounded-full bg-brand/20 blur-[80px]"
        />
        <div className="relative flex h-full items-end justify-center pb-6">{children}</div>
      </div>
    </div>
  );
}

/** Drei Bedarfe legen sich zu einem Volumen zusammen. */
function BundleArt() {
  return (
    <div className="w-full max-w-[320px] px-6">
      <div className="flex items-end justify-center gap-2">
        {[
          { n: "Firma A", v: "120 m³", h: "h-[92px]" },
          { n: "Firma B", v: "90 m³", h: "h-[76px]" },
          { n: "Firma C", v: "90 m³", h: "h-[76px]" },
        ].map((f) => (
          <div
            key={f.n}
            className={`flex ${f.h} flex-1 flex-col justify-end rounded-2xl border border-white/10 bg-white/[0.04] p-2.5`}
          >
            <Building2 className="h-3 w-3 text-white/25" />
            <div className="mt-1.5 text-[9.5px] text-white/40">{f.n}</div>
            <div className="text-[13px] font-bold text-white">{f.v}</div>
          </div>
        ))}
      </div>
      <div className="mt-2.5 rounded-2xl border border-brand/40 bg-brand/15 px-3.5 py-2.5">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-semibold text-white/80">Gebündelt</span>
          <span className="text-[16px] font-bold text-brand">300 m³</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-[86%] rounded-full bg-brand" />
        </div>
      </div>
    </div>
  );
}

/** Ein Werk, ein Preis — gemessen an der KBOB-Referenz. */
function DirectArt() {
  return (
    <div className="w-full max-w-[320px] px-6">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand/15 text-brand">
            <Building2 className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="text-[12.5px] font-semibold text-white">Baustoffwerk</div>
            <div className="text-[10px] text-white/40">verifiziert · deine Region</div>
          </div>
        </div>
        <div className="mt-3.5 space-y-2 border-t border-white/10 pt-3">
          <div className="flex items-baseline justify-between">
            <span className="text-[10.5px] text-white/40">KBOB-Referenz</span>
            <span className="text-[12px] font-semibold tabular-nums text-white/60 line-through">
              156.00
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[10.5px] text-white/60">Dein Angebot</span>
            <span className="text-[17px] font-bold tabular-nums text-brand">141.40</span>
          </div>
        </div>
      </div>
      <div className="mt-2.5 rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-center text-[10.5px] text-white/45">
        Beispiel — verhandelt wird direkt im Chat.
      </div>
    </div>
  );
}

export default function TwoWays() {
  return (
    <section className="bg-[#05090F]">
      <div className={cn("mx-auto max-w-6xl px-4 sm:px-6", SECTION)}>
        <div className="mb-12 max-w-2xl sm:mb-16">
          <span className={EYEBROW}>
            Zwei Wege
          </span>
          <h2 className={cn(D_LG, "mt-5 text-white")}>
            Zum besseren Preis — gebündelt oder direkt.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          <Card
            title="Gemeinsam bündeln"
            lead="Dein Bedarf wird mit gleichen Bedarfen deiner Region zusammengelegt. Je grösser das Bündel, desto höher der Mengenrabatt."
            cta="Smart Pools ansehen"
            href="/pools"
          >
            <BundleArt />
          </Card>

          <Card
            title="Direkt verhandeln"
            lead="Du willst nicht bündeln? Finde geprüfte Baustoffwerke und verhandle direkt — mit dem KBOB-Referenzpreis als Basis."
            cta="Zum Netzwerk"
            href="/network"
          >
            <DirectArt />
          </Card>
        </div>
      </div>
    </section>
  );
}
