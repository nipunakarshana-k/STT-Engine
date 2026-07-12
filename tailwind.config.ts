import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F7F5EE",
        paper: "#FFFDF7",
        ink: "#17211B",
        muted: "#66736A",
        sage: "#BFD8C2",
        moss: "#577C5F",
        fern: "#2F6F46",
        mint: "#DCECDD",
      },
      boxShadow: {
        soft: "0 18px 60px rgba(23, 33, 27, 0.09)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
