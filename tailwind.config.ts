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
        // Primär / Marke: SourceOn-Gold (--gold #D99000, dunkler #9A6A00)
        brand: {
          DEFAULT: "#D99000",
          500: "#D99000",
          600: "#9A6A00",
        },
        // Ersparnisse / positiv: SourceOn-Grün
        emerald: {
          DEFAULT: "#10B981",
          500: "#10B981",
        },
        // Sekundär-Akzent: SourceOn-Navy (--navy #1B3A5C / --navy-md #254D7A)
        accent: {
          DEFAULT: "#1B3A5C",
          500: "#254D7A",
          600: "#1B3A5C",
        },
        // Datenlinien (nur Visualisierung) — SourceOn-Navy
        "kbob-blue": "#254D7A",
        "pool-green": "#10B981",
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
