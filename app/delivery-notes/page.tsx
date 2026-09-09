import { Construction } from "lucide-react";
import SheetPage from "@/components/ui/SheetPage";
import { requireCompanyOrOnboard } from "@/lib/company";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Lieferscheine · Obtanet",
  description: "Lieferschein-OCR — erfassen und abgleichen",
};

/* Ein Lieferschein ist ein Beleg, den man liest und ablegt — Papier, im
   Wortsinn. Kopfband in Schwarz, weil die Beschaffung nebenan Navy traegt. */
export default async function DeliveryNotesPage() {
  await requireCompanyOrOnboard();
  return (
    <SheetPage
      band="black"
      eyebrow="Beschaffung"
      title="Lieferschein-Scan"
      lead="Lieferscheine per Foto erfassen, Menge und Material auslesen und gegen SIA-Verträge abgleichen."
    >
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <Construction className="h-4 w-4 shrink-0 text-brand-700" />
        In Aufbau — die OCR-Erfassung folgt als eigenes Modul.
      </div>
    </SheetPage>
  );
}
