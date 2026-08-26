import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
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
