import { Construction, type LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  planned: { title: string; text: string }[];
};

export default function CockpitPlaceholder({
  icon: Icon,
  title,
  subtitle,
  planned,
}: Props) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8 flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-kbob-blue/15 text-kbob-blue">
          <Icon className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-50 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-neutral-400">{subtitle}</p>
        </div>
      </header>

      <div className="mb-6 flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-sm text-amber-200/90">
        <Construction className="h-4 w-4 shrink-0" />
        In Aufbau — die folgenden Module folgen in den nächsten Iterationen.
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {planned.map((p) => (
          <div
            key={p.title}
            className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-5"
          >
            <h3 className="font-semibold text-neutral-200">{p.title}</h3>
            <p className="mt-1.5 text-sm text-neutral-500">{p.text}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
