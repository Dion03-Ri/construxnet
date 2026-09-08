import { ScanLine, Construction } from "lucide-react";
import { requireCompanyOrOnboard } from "@/lib/company";
import { COLUMN, SHELL_NARROW } from "@/lib/ui";
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
      <header className="mb-6 flex max-w-[860px] items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-brand">
          <ScanLine className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Lieferschein-Scan
          </h1>
          <p className="mt-2 text-white/[0.72]">
            Lieferscheine per Foto erfassen, Menge/Material auslesen und gegen
            SIA-Verträge abgleichen.
          </p>
        </div>
      </header>

      <div className={cn(COLUMN, "flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-brand/90")}>
        <Construction className="h-4 w-4 shrink-0" />
        In Aufbau — die OCR-Erfassung folgt als eigenes Modul.
      </div>
    </main>
  );
}
