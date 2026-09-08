import Link from "next/link";
import { Bookmark } from "lucide-react";
import OpenPools from "@/components/pools/OpenPools";
import BundleEnginePanel from "@/components/pools/BundleEnginePanel";
import { BTN_GOLD, BTN_OUTLINE_DARK, D_MD, EYEBROW, SHELL } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Smart Pools · Obtanet",
  description: "Offene, gebündelte Bedarfe der Schweizer Baubranche — beitreten und sparen",
};

export default function PoolsPage() {
  return (
    <main className={cn(SHELL, "py-6")}>
      {/* ===================== KOPF, VOLLE BREITE =====================
          Kein Panel, kein Raster, kein Goldkästchen — Zeile, Überschrift,
          Handlung, Haarlinie. Dieselbe Machart wie auf der Netzwerkseite. */}
      <header className="border-b border-white/[0.08]">
        <div className="py-8">
          <span className={EYEBROW}>Smart Pools</span>
          <h1 className={cn(D_MD, "mt-4 max-w-3xl text-white")}>
            Offene, gebündelte Bedarfe in deiner Region
          </h1>
          <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-white/55">
            Melde deinen Materialbedarf und tritt einem Bündel bei. Aus vielen
            kleinen Mengen wird eine grosse — und aus einer grossen Menge ein
            besserer Preis.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/beschaffung" className={BTN_GOLD}>
              Bedarf melden
            </Link>
            <Link href="/pools/saved" className={BTN_OUTLINE_DARK}>
              <Bookmark className="h-4 w-4" /> Merkliste
            </Link>
          </div>
        </div>
      </header>

      {/* Hauptinhalt: offene Bündel mit Countdown */}
      <div className="pt-8">
        <OpenPools />
      </div>

      {/* Zusatztool: Rabatt-Rechner — klein, per Vollbild-Icon aufklappbar */}
      <section className="mt-12">
        <BundleEnginePanel />
      </section>
    </main>
  );
}
