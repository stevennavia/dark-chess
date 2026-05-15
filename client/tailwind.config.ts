import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: "#0a0a0f",
          800: "#12121a",
          700: "#1a1a25",
          600: "#242435",
          500: "#2e2e45",
        },
        blood: {
          DEFAULT: "#8b0000",
          light: "#cc0000",
          dark: "#5c0000",
        },
        gold: {
          DEFAULT: "#c9a84c",
          light: "#e8c96a",
          dark: "#a68830",
        },
      },
      fontFamily: {
        gothic: ["Cinzel", "serif"],
        medieval: ["UnifrakturMaguntia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
