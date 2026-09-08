
import TermineList from "@/components/termine/TermineList";
import { requireCompanyOrOnboard } from "@/lib/company";
import { D_MD, EYEBROW, COLUMN, SHELL_NARROW } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Fristen · Obtanet",
  description: "Sammel- und Angebotsfristen deiner Bündel — direkt in deinen Kalender.",
};

export default async function TerminePage() {
  await requireCompanyOrOnboard();
  return (
    <main className={cn(SHELL_NARROW, "py-6 sm:py-8")}>
      <header className="mb-8 border-b border-white/[0.12] pb-8">
        <span className={cn(EYEBROW, "block")}>Smart Pools</span>
        <h1 className={cn(D_MD, "mt-3 text-white")}>Fristen</h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/[0.56]">
          Sammel- und Angebotsfristen der Bündel, an denen du beteiligt bist — mit einem Klick in deinen Kalender.
        </p>
      </header>
      <div className={COLUMN}>
        <TermineList />
      </div>
    </main>
  );
}
