import { CalendarDays } from "lucide-react";
import TermineList from "@/components/termine/TermineList";
import { requireCompanyOrOnboard } from "@/lib/company";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Fristen · Obtanet",
  description: "Sammel- und Angebotsfristen deiner Bündel — direkt in deinen Kalender.",
};

export default async function TerminePage() {
  await requireCompanyOrOnboard();
  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6 flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand/15 text-brand">
          <CalendarDays className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Fristen</h1>
          <p className="text-sm text-white/55">
            Sammel- und Angebotsfristen der Bündel, an denen du beteiligt bist —
            mit einem Klick in deinen Kalender.
          </p>
        </div>
      </header>
      <TermineList />
    </main>
  );
}
