import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SavedPools from "@/components/pools/SavedPools";
import { requireCompanyOrOnboard } from "@/lib/company";
import { D_MD, EYEBROW, SHELL } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gespeicherte Pools · Obtanet",
  description: "Deine gemerkten Smart Pools auf einen Blick.",
};

/**
 * Der Kopf hatte ein goldenes Kästchen mit einem Lesezeichen-Symbol neben
 * der Überschrift. Ein Symbol, das nur wiederholt, was das Wort daneben
 * schon sagt, ist Dekoration — und ein gerundetes Farbkästchen davor ist
 * das Erkennungszeichen erzeugter Oberflächen.
 *
 * Stattdessen dieselbe Kopfform wie auf /pools: Zeile, Überschrift, Satz,
 * Haarlinie. Was zusammengehört, sieht gleich aus.
 */
export default async function SavedPoolsPage() {
  await requireCompanyOrOnboard();

  return (
    <main className={cn(SHELL, "py-6")}>
      <header className="border-b border-white/[0.12] pb-8">
        <Link
          href="/pools"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white/[0.56] transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" /> Zurück zu Smart Pools
        </Link>

        <span className={cn(EYEBROW, "mt-6 block")}>Smart Pools</span>
        <h1 className={cn(D_MD, "mt-3 text-white")}>Merkliste</h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/[0.56]">
          Bündel, die du dir gemerkt hast. Geschlossene fallen von selbst heraus.
        </p>
      </header>

      <SavedPools />
    </main>
  );
}
