import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Base surface (Navy)
        navy: {
          DEFAULT: "#0F172A",
          950: "#0B1120",
          900: "#0F172A",
          800: "#1E293B",
          700: "#334155",
        },
        // Bau-Akzent / aktive Bestellvorgänge (Orange)
        brand: {
          DEFAULT: "#F97316",
          500: "#F97316",
          600: "#EA580C",
        },
        // Ersparnisse (Emerald)
        emerald: {
          DEFAULT: "#10B981",
          500: "#10B981",
        },
        // Electric-Blue-Akzent (KBOB / Daten)
        accent: {
          DEFAULT: "#2563EB",
          500: "#3B82F6",
          600: "#2563EB",
        },
        // KBOB-Index-Datenlinie (nur Datenvisualisierung)
        "kbob-blue": "#3B82F6",
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
