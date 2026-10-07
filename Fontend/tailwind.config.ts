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
        brand: {
          950: "#04271c",
          900: "#063B2A", // Primary dark green
          850: "#084532",
          800: "#0b573e",
          700: "#106e50",
          600: "#198863",
          100: "#d7eee4",
          50: "#eef7f3",
        },
        gold: {
          50: "#faf7ee",
          100: "#f7f1df",
          200: "#eedcb3",
          300: "#e4c683",
          400: "#d6b866",
          500: "#C6A24A", // Primary luxury gold
          600: "#ab8835",
          700: "#866624",
        },
        surface: {
          bg: "#F8F7F3",
          card: "#FFFFFF",
          muted: "#F0EFEA",
          border: "#E7E5DD",
        },
        text: {
          primary: "#17201B",
          secondary: "#5C6660",
          muted: "#8C9690",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(6, 59, 42, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)",
        cardHover: "0 10px 25px -4px rgba(6, 59, 42, 0.1), 0 4px 10px -2px rgba(0, 0, 0, 0.04)",
        goldGlow: "0 4px 15px -1px rgba(198, 162, 74, 0.25)",
        bottomNav: "0 -4px 20px rgba(6, 59, 42, 0.06)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
