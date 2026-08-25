import { MessageSquare, Construction } from "lucide-react";

export const metadata = {
  title: "Nachrichten · ConstruxNet",
  description: "Direktnachrichten und Verhandlungen zwischen verbundenen Firmen",
};

export default function MessagesPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8 flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/15 text-brand">
          <MessageSquare className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
            Nachrichten
          </h1>
          <p className="mt-2 text-slate-400">
            Direktnachrichten und Verhandlungen zwischen verbundenen Firmen —
            inklusive Angebote und Gegenangebote direkt im Chat.
          </p>
        </div>
      </header>

      <div className="flex items-center gap-2 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand/90">
        <Construction className="h-4 w-4 shrink-0" />
        In Aufbau — der Chat mit strukturierten Angeboten folgt als späteres
        Modul.
      </div>
    </main>
  );
}
