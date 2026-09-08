import { Construction } from "lucide-react";
import { requireCompanyOrOnboard } from "@/lib/company";
import { D_MD, EYEBROW, COLUMN, SHELL_NARROW } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Lieferscheine · Obtanet",
  description: "Lieferschein-OCR — erfassen und abgleichen",
};

export default async function DeliveryNotesPage() {
  await requireCompanyOrOnboard();
  return (
    <main className={cn(SHELL_NARROW, "py-6 sm:py-8")}>
      <header className="mb-8 border-b border-white/[0.12] pb-8">
        <span className={cn(EYEBROW, "block")}>Beschaffung</span>
        <h1 className={cn(D_MD, "mt-3 text-white")}>Lieferschein-Scan</h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/[0.56]">
          Lieferscheine per Foto erfassen, Menge und Material auslesen und gegen SIA-Verträge abgleichen.
        </p>
      </header>

      <div className={cn(COLUMN, "flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-brand/90")}>
        <Construction className="h-4 w-4 shrink-0" />
        In Aufbau — die OCR-Erfassung folgt als eigenes Modul.
      </div>
    </main>
  );
}
