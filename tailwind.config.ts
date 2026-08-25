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
        // KBOB-Index-Datenlinie (nur Datenvisualisierung)
        "kbob-blue": "#3B82F6",
        "pool-green": "#10B981",
      },
    },
  },
  plugins: [],
};

export default config;
