import type { Config } from "tailwindcss";

const config: Config = {
  // lib/ und data/ MUESSEN mitgescannt werden: die Design-Bausteine in
  // lib/ui.ts sind reine Klassen-Strings. Fehlt der Pfad, erzeugt Tailwind
  // sie nicht und die Klassen kommen im CSS nie an — sichtbar nur dort, wo
  // dieselbe Klasse zufaellig auch woanders steht.
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Marketing-Ueberschriften. Nur fuer Display-Groessen ab ~32 px.
        display: [
          "var(--font-display)",
          "var(--font-sans)",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        sans: [
          "var(--font-sans)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        // SourceOn Corporate Identity — exakt dieselben Farben wie sourceon.ch.
        // Dunkle Navy-Flächen (SourceOn --dark / --bg)
        navy: {
          DEFAULT: "#0F2238",
          950: "#070F1A",
          900: "#08111E",
          800: "#0C1824",
          700: "#111F2E",
        },
        // Primär / Marke: SourceOn-Gold (--gold #D99000, heller/dunkler)
        brand: {
          DEFAULT: "#D99000",
          50: "#FBF3E2",
          100: "#F6E6C2",
          500: "#D99000",
          600: "#B8770A",
          700: "#9A6A00",
        },
        // Sekundär-Akzent: SourceOn-Blau/Navy — volle Skala (KEIN Grün mehr)
        accent: {
          DEFAULT: "#1B3A5C",
          50: "#EEF3F8",
          100: "#DCE7F1",
          200: "#BCD0E4",
          500: "#254D7A",
          600: "#1B3A5C",
          700: "#16314F",
        },
        // Datenlinien (nur Visualisierung) — SourceOn-Blau
        "kbob-blue": "#254D7A",
        "pool-green": "#254D7A",
      },
      // Display-Stufen fuer die oeffentlichen Seiten. Die Sprungweite ist
      // Absicht: zwischen Lauftext (15 px) und Hero (bis 92 px) darf nichts
      // Mittelmaessiges stehen, sonst liest sich die Seite wie eine Liste.
      fontSize: {
        "d-sm": ["2rem", { lineHeight: "1.1", letterSpacing: "-0.022em" }],
        "d-md": ["2.75rem", { lineHeight: "1.05", letterSpacing: "-0.026em" }],
        "d-lg": ["3.75rem", { lineHeight: "1.02", letterSpacing: "-0.03em" }],
        "d-xl": ["5.75rem", { lineHeight: "0.96", letterSpacing: "-0.035em" }],
      },
      boxShadow: {
        // Präzise, flache Enterprise-Elevation (Stripe/Salesforce-Stil)
        card: "0 1px 3px 0 rgb(15 23 42 / 0.05)",
        cardhover: "0 4px 12px -2px rgb(15 23 42 / 0.10), 0 2px 4px -2px rgb(15 23 42 / 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
