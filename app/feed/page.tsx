import NetworkFeed from "@/components/NetworkFeed";
import RecommendedPartners from "@/components/feed/RecommendedPartners";
import FeedHead, { type FeedStat } from "@/components/feed/FeedHead";
import KbobTile from "@/components/feed/KbobTile";
import BundleChances from "@/components/pools/BundleChances";
import { requireCompanyOrOnboard } from "@/lib/company";
import { createServerSupabaseClient } from "@/lib/supabase";
import { GROUND, SHELL_WORK } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Feed · Obtanet",
  description: "Vernetzung, Beschaffung und Bündelung der Schweizer Baubranche",
};

/**
 * Der Feed war dreispaltig: Profilkarte links, Strom in der Mitte, Bündel
 * rechts. Drei Spalten sind die Form, die jede Netzwerkseite hat, und die
 * linke Spalte trug ausgerechnet das, was man selbst am wenigsten braucht
 * — die eigene Firma und sechs Verweise, die schon im Kopf der Seite
 * stehen.
 *
 * Jetzt: ein Kopfband, darunter die Bündel-Chancen über die ganze Breite,
 * und zuunterst die News in einer Textspalte mit einer Schiene daneben.
 *
 * Zwei Masse bestimmen den Aufbau:
 *
 * `SHELL_WORK` statt `SHELL` — die Seite ist eine Arbeitsfläche, keine
 * Werbeseite. Über 1760 px werden Zeilenlisten zu Streifen, und ein
 * quadratisches Foto in einem Beitrag wird so gross wie der halbe
 * Bildschirm.
 *
 * Die News stehen zuletzt, weil sie beim Scrollen endlos nachladen. Was
 * darunter stünde, erreicht nie jemand — deshalb steht alles, was daneben
 * nützlich ist, in der Schiene rechts und nicht unter dem Strom.
 */

/** „17 Std", „4 Tage" — die Frist so, wie man sie ausspricht. */
function untilLabel(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (!Number.isFinite(ms) || ms <= 0) return "—";
  const hours = Math.floor(ms / 3_600_000);
  if (hours < 48) return `${Math.max(hours, 1)} Std`;
  return `${Math.round(hours / 24)} Tage`;
}

export default async function FeedPage() {
  const company = await requireCompanyOrOnboard();
  const supabase = createServerSupabaseClient();

  const [{ count: connCount }, { count: poolCount }, { data: pending }, { data: nextBundle }] =
    await Promise.all([
      supabase
        .from("connections")
        .select("id", { count: "exact", head: true })
        .eq("status", "CONNECTED"),
      supabase
        .from("bundle_participations")
        .select("id", { count: "exact", head: true })
        .eq("buyer_company_id", company.id),
      // Eingehende Anfragen: alles Offene, das jemand anders gestellt hat.
      // Die Zuordnung passiert hier statt in der Abfrage, weil eine
      // Verbindung in zwei Spalten stehen kann.
      supabase
        .from("connections")
        .select("company_id_a, company_id_b, requested_by")
        .eq("status", "PENDING"),
      supabase
        .from("bundles")
        .select("deadline")
        .in("status", ["OPEN", "SEALED_BIDDING"])
        .order("deadline", { ascending: true })
        .limit(1),
    ]);

  const incoming = (pending ?? []).filter(
    (r) =>
      (r.company_id_a === company.id || r.company_id_b === company.id) &&
      r.requested_by !== company.id,
  ).length;

  const deadline = nextBundle?.[0]?.deadline as string | undefined;

  const stats: FeedStat[] = [
    { href: "/network", value: String(connCount ?? 0), label: "Verbindungen" },
    { href: "/pools", value: String(poolCount ?? 0), label: "Aktive Pools" },
    { href: "/network/requests", value: String(incoming), label: "Offene Anfragen" },
    { href: "/termine", value: deadline ? untilLabel(deadline) : "—", label: "Nächste Frist" },
  ];

  return (
    <main className={cn(GROUND, SHELL_WORK, "py-6")}>
      <FeedHead stats={stats} badges={{ "/network/requests": incoming }} />

      {/* Das Einzige, was die ganze Breite bekommt: drei Zeilen, die man
          im Vorbeigehen liest. */}
      <BundleChances wide />

      <div className="mt-8 grid grid-cols-1 gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <NetworkFeed />
        </div>

        {/* Die Schiene bleibt beim Lesen stehen — Referenzpreis und Partner
            sind dann die ganze Zeit da statt einmal oben und dann weg.

            Auf dem Handy gibt es kein Nebeneinander: dort rutscht die
            Schiene VOR den Strom. Hinter einer Liste, die endlos nachlaedt,
            waere sie unerreichbar. */}
        <aside className="order-first lg:order-none lg:sticky lg:top-[88px] lg:self-start">
          <KbobTile />
          <RecommendedPartners />
        </aside>
      </div>
    </main>
  );
}
