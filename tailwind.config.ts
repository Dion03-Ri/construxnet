import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
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
        card: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)",
        cardhover:
          "0 10px 24px -6px rgb(15 23 42 / 0.12), 0 4px 8px -4px rgb(15 23 42 / 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
