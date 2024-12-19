import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "#38343E",
        primary: "#201E24",
        background: "#0B0911",
        card: "#16121F",
        accent: "#7233F3",
        dimmed: "#92909E",
        button: "#271C43",
        buttonDark: "#211E2D",
        remove: "#D78397",
      },
      fontFamily: {
        helvob: ["var(--font-helv-ob)"],
      },
    },
  },
  plugins: [],
} satisfies Config;
