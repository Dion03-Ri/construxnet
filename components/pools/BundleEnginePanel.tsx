"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Maximize2, X, TrendingDown } from "lucide-react";
import BundleEngine from "@/components/BundleEngine";
import { cn } from "@/lib/utils";

/**
 * Zeigt den Rabatt-Rechner klein/kompakt an. Über das Vollbild-Icon klappt er
 * in einen fast bildschirmfüllenden Overlay auf — bleibt aber auf der
 * Bündel-Seite (kein Seitenwechsel).
 */
export default function BundleEnginePanel() {
  const [open, setOpen] = useState(false);

  // Esc schliesst; Body-Scroll sperren solange offen.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* Kompakte Teaser-Karte */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex w-full items-center gap-4 overflow-hidden rounded-lg border border-white/10 bg-navy-900 px-5 py-4 text-left text-white shadow-card transition-colors hover:border-brand/40"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand/15 text-brand">
          <Calculator className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-white">
            Rabatt-Rechner
            <span className="rounded border border-white/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/50">
              Zusatztool
            </span>
          </div>
          <p className="mt-0.5 truncate text-[12px] text-white/55">
            Simuliere, wie dein Materialbedarf das Poolvolumen und deinen Rabatt bewegt.
          </p>
        </div>
        <span className="hidden shrink-0 items-center gap-1 text-[12px] font-semibold text-brand sm:inline-flex">
          <TrendingDown className="h-3.5 w-3.5" /> Mindestvorteil
        </span>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-white/15 text-white/70 transition-colors group-hover:border-brand/50 group-hover:text-brand">
          <Maximize2 className="h-4 w-4" />
        </span>
      </button>

      {/* Vollbild-Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col bg-navy-950/80 p-2 backdrop-blur-sm sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Rabatt-Rechner"
          >
            <motion.div
              className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-white/10 bg-navy-950 shadow-2xl"
              initial={{ scale: 0.97, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, y: 8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Overlay-Kopfzeile */}
              <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-white">
                  <Calculator className="h-4 w-4 text-brand" />
                  Rabatt-Rechner
                  <span className="hidden text-[11px] font-normal text-white/45 sm:inline">
                    · Simulation · verlässt die Bündel-Seite nicht
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/15 px-3 py-1.5 text-[12px] font-semibold text-white/75 transition-colors hover:border-white/30 hover:text-white"
                >
                  <X className="h-4 w-4" /> Schliessen
                </button>
              </div>

              {/* Scrollbarer Inhalt */}
              <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
                <BundleEngine />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
