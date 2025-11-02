/**
 * Design Tokens for CleanEat
 * Generated based on seed: sha256("NorthTing CleanEat" + "Sepolia" + "202511" + "CleanEat.sol")
 * Design System: Material Design 3
 */

export const designTokens = {
  colors: {
    light: {
      primary: "#00A86B",
      secondary: "#FF6F00",
      background: "#FFFFFF",
      surface: "#F5F5F5",
      error: "#D32F2F",
      textPrimary: "#212121",
      textSecondary: "#757575",
      border: "#E0E0E0",
    },
    dark: {
      primary: "#26A27B",
      secondary: "#FF8A50",
      background: "#121212",
      surface: "#1E1E1E",
      error: "#CF6679",
      textPrimary: "#FFFFFF",
      textSecondary: "#B0B0B0",
      border: "#424242",
    },
  },
  typography: {
    fontFamily: {
      sans: '"Inter", system-ui, -apple-system, sans-serif',
      mono: '"JetBrains Mono", "Courier New", monospace',
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
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  spacing: {
    compact: {
      cardPadding: "16px",
      buttonHeight: "36px",
      tableRowHeight: "40px",
      gap: "12px",
    },
    comfortable: {
      cardPadding: "24px",
      buttonHeight: "48px",
      tableRowHeight: "56px",
      gap: "16px",
    },
  },
  layout: {
    containerMaxWidth: "1280px",
    gridColumns: 12,
    gridGap: "24px",
    breakpoints: {
      mobile: "640px",
      tablet: "1024px",
      desktop: "1280px",
    },
  },
  borderRadius: {
    small: "4px",
    medium: "8px",
    large: "12px",
    full: "9999px",
  },
  shadows: {
    button: "0 2px 4px rgba(0, 0, 0, 0.1)",
    card: "0 4px 12px rgba(0, 0, 0, 0.08)",
    hover: "0 8px 16px rgba(0, 0, 0, 0.12)",
  },
  transitions: {
    duration: {
      fast: "200ms",
      normal: "400ms",
      slow: "600ms",
    },
    easing: {
      standard: "cubic-bezier(0.4, 0.0, 0.2, 1)",
      decelerate: "cubic-bezier(0.0, 0.0, 0.2, 1)",
      accelerate: "cubic-bezier(0.4, 0.0, 1, 1)",
    },
  },
  animation: {
    fadeIn: {
      duration: "400ms",
      easing: "cubic-bezier(0.4, 0.0, 0.2, 1)",
      keyframes: {
        from: { opacity: 0 },
        to: { opacity: 1 },
      },
    },
    slideUp: {
      duration: "400ms",
      easing: "cubic-bezier(0.4, 0.0, 0.2, 1)",
      keyframes: {
        from: { transform: "translateY(20px)", opacity: 0 },
        to: { transform: "translateY(0)", opacity: 1 },
      },
    },
    scaleHover: {
      scale: 1.02,
      duration: "200ms",
    },
  },
  accessibility: {
    minContrastRatio: 4.5, // WCAG AA
    minTouchTarget: "44px",
    focusRingWidth: "2px",
    focusRingColor: "#00A86B",
  },
} as const;

export type DesignTokens = typeof designTokens;
export type ColorMode = "light" | "dark";
export type DensityMode = "compact" | "comfortable";

