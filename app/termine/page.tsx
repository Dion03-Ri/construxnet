import TermineList from "@/components/termine/TermineList";
import SheetPage from "@/components/ui/SheetPage";
import { requireCompanyOrOnboard } from "@/lib/company";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Fristen · Obtanet",
  description: "Sammel- und Angebotsfristen deiner Bündel — direkt in deinen Kalender.",
};

/* Eine Fristenliste liest man ab und arbeitet sie ab — kein Marktbild,
   sondern ein Blatt. Kopfband in Navy; die Nachbarseite „Empfangene
   Anfragen" traegt Schwarz. */
export default async function TerminePage() {
  await requireCompanyOrOnboard();
  return (
    <SheetPage
      band="navy"
      eyebrow="Smart Pools"
      title="Fristen"
      lead="Sammel- und Angebotsfristen der Bündel, an denen du beteiligt bist — mit einem Klick in deinen Kalender."
    >
      <TermineList />
    </SheetPage>
  );
}
