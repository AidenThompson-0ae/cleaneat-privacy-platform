import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#00A86B",
          dark: "#26A27B",
        },
        secondary: {
          light: "#FF6F00",
          dark: "#FF8A50",
        },
        background: {
          light: "#FFFFFF",
          dark: "#121212",
        },
        surface: {
          light: "#F5F5F5",
          dark: "#1E1E1E",
        },
        textPrimary: {
          light: "#212121",
          dark: "#FFFFFF",
        },
        textSecondary: {
          light: "#757575",
          dark: "#B0B0B0",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        h1: "48px",
        h2: "36px",
        h3: "28px",
        h4: "24px",
        body: "16px",
        small: "14px",
        caption: "12px",
      },
      borderRadius: {
        button: "8px",
        card: "12px",
      },
      boxShadow: {
        button: "0 2px 4px rgba(0,0,0,0.1)",
        card: "0 4px 12px rgba(0,0,0,0.08)",
        hover: "0 8px 16px rgba(0,0,0,0.12)",
      },
      transitionDuration: {
        fast: "200ms",
        normal: "400ms",
        slow: "600ms",
      },
      spacing: {
        compact: "16px",
        comfortable: "24px",
      },
    },
  },
  plugins: [],
};

export default config;

