import { ScanLine, Construction } from "lucide-react";
import { requireCompanyOrOnboard } from "@/lib/company";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Lieferscheine · ConstruxNet",
  description: "Lieferschein-OCR — erfassen und abgleichen",
};

export default async function DeliveryNotesPage() {
  await requireCompanyOrOnboard();
  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6 flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald/15 text-emerald">
          <ScanLine className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Lieferschein-Scan
          </h1>
          <p className="mt-2 text-slate-500">
            Lieferscheine per Foto erfassen, Menge/Material auslesen und gegen
            SIA-Verträge abgleichen.
          </p>
        </div>
      </header>

      <div className="flex items-center gap-2 rounded-lg border border-emerald/20 bg-emerald/5 px-4 py-3 text-sm text-emerald/90">
        <Construction className="h-4 w-4 shrink-0" />
        In Aufbau — die OCR-Erfassung folgt als eigenes Modul.
      </div>
    </main>
  );
}
