import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors:{
        'border':'#3D454D',
        'primary' : '#151A23',
        'background': '#03060A',
        'accent':'#663399',
        'dimmed': '$CDCDCD',
      },
      fontFamily: {
        helvob: ['var(--font-helv-ob)'],
      },
    },
  },
  plugins: [],
} satisfies Config;
