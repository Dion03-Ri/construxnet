import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import SinglePost, { type Beitrag } from "@/components/feed/SinglePost";
import { supabaseAdmin } from "@/lib/supabase";
import { COLUMN, SHELL_NARROW } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const FELDER =
  "id, post_type, title, content, region, media_url, likes_count, comments_count, created_at, company_id, companies(company_name, city, verified, logo_url)";

async function holen(id: string): Promise<Beitrag | null> {
  // Ueber den Dienstschluessel, weil die Seite auch ohne Anmeldung
  // aufgeht: ein geteilter Link muss sich oeffnen lassen. Beitraege sind
  // ohnehin oeffentlich lesbar (Regel `network_posts_select_public`).
  const { data, error } = await supabaseAdmin().from("network_posts").select(FELDER).eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as unknown as Beitrag;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await holen(id);
  if (!b) return { title: "Beitrag · Obtanet" };
  const firma = b.companies?.company_name ?? "Obtanet";
  const titel = b.title ?? `Beitrag von ${firma}`;
  const text = b.content.slice(0, 200) + (b.content.length > 200 ? "…" : "");
  // Damit ein geteilter Link in WhatsApp und E-Mail eine Vorschau zeigt
  // und nicht nur eine nackte Adresse.
  return {
    title: `${titel} · Obtanet`,
    description: text,
    openGraph: {
      title: titel,
      description: text,
      type: "article",
      images: b.media_url ? [b.media_url] : undefined,
    },
  };
}

export default async function BeitragPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const beitrag = await holen(id);
  if (!beitrag) notFound();

  return (
    <main className={cn(SHELL_NARROW, "py-6 sm:py-8")}>
      <div className={COLUMN}>
        <Link
          href="/feed"
          className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-white/[0.56] transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" /> Zurück zum Feed
        </Link>
        <SinglePost beitrag={beitrag} />
      </div>
    </main>
  );
}
