import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "kbob-blue": "#3B82F6",
        "pool-green": "#10B981",
      },
    },
  },
  plugins: [],
};

export default config;
