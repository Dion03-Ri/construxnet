"use client";

import { useState } from "react";
import { ArrowRight, Loader2, Check } from "lucide-react";

export default function ComingSoon({ accessError = false }: { accessError?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    setMsg("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState("error");
        setMsg(data?.error ?? "Etwas ist schiefgelaufen.");
        return;
      }
      setState("done");
    } catch {
      setState("error");
      setMsg("Netzwerkfehler. Bitte später erneut versuchen.");
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-950 px-4">
      {/* dezentes Licht + Raster */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "34px 34px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-20%] h-[60vh] w-[60vh] -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(217,144,0,0.18), transparent 60%)" }}
      />

      <div className="relative w-full max-w-md text-center">
        {/* Logo */}
        <div className="mx-auto mb-8 inline-flex items-center gap-2.5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-lg font-black text-navy-900 shadow-lg shadow-brand/25">
            O
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-white">Obtanet</span>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
          Coming Soon
        </span>

        <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
          Obtanet — <span className="text-brand">Coming Soon</span>
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-white/55">
          Die Plattform für die Baubranche. Sei unter den Ersten.
        </p>

        {/* Warteliste */}
        {state === "done" ? (
          <div className="mx-auto mt-8 flex max-w-sm items-center justify-center gap-2.5 rounded-xl border border-brand/30 bg-brand/10 px-5 py-4 text-[14px] font-medium text-white">
            <Check className="h-5 w-5 text-brand" />
            Du bist auf der Warteliste. Wir melden uns.
          </div>
        ) : (
          <form onSubmit={submit} className="mx-auto mt-8 max-w-sm">
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@firma.ch"
                className="h-12 flex-1 rounded-lg border border-white/12 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-brand/60"
              />
              <button
                type="submit"
                disabled={state === "loading"}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-bold text-navy-900 transition-colors hover:bg-brand-500 disabled:opacity-60"
              >
                {state === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Auf Warteliste eintragen <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
            {state === "error" && msg ? (
              <p className="mt-2.5 text-[13px] font-medium text-rose-400">{msg}</p>
            ) : (
              <p className="mt-2.5 text-[12px] text-white/35">Kein Spam. Nur eine Nachricht zum Launch.</p>
            )}
          </form>
        )}

        {/* Team-Zugang: Passwort eingeben, um die Vorschau zu sehen */}
        <div className="mx-auto mt-10 max-w-sm border-t border-white/10 pt-6">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/40">
            Team-Zugang
          </p>
          <form action="/api/preview" method="POST" className="mt-3 flex flex-col gap-2.5 sm:flex-row">
            <input type="hidden" name="next" value="/" />
            <input type="hidden" name="from" value="/coming-soon" />
            <input
              type="password"
              name="password"
              required
              placeholder="Passwort"
              className="h-11 flex-1 rounded-lg border border-white/12 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-brand/60"
            />
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-white/15 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Zugang
            </button>
          </form>
          {accessError ? (
            <p className="mt-2.5 text-[13px] font-medium text-rose-400">Falsches Passwort.</p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
