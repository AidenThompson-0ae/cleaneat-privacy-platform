/**
 * Design Tokens - NorthTing CleanEat
 * 
 * Generated from deterministic seed:
 * sha256("NorthTing CleanEat" + "localhost" + "202411" + "CleanEat.sol")
 * 
 * Theme: Modern Health & Food
 * - Clean, fresh aesthetic for food/health context
 * - High contrast for data visibility
 * - Calming greens and warm accent colors
 */

export type ColorMode = 'light' | 'dark';
export type Density = 'compact' | 'comfortable';

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const colors = {
  // Primary - Fresh Green (health/food theme)
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',  // Main
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  // Secondary - Warm Orange (appetite/satisfaction)
  secondary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',  // Main
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  
  // Neutral - Gray scale
  neutral: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
  },
  
  // Semantic colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Data visualization (for charts/graphs)
  chart: {
    nutrition: '#22c55e',
    satisfaction: '#f97316',
    accent1: '#3b82f6',
    accent2: '#8b5cf6',
    accent3: '#ec4899',
  },
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  fontFamily: {
    sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", Consolas, monospace',
  },
  
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// ============================================================================
// SPACING (based on 4px grid)
// ============================================================================

export const spacing = {
  compact: {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '0.75rem',  // 12px
    lg: '1rem',     // 16px
    xl: '1.5rem',   // 24px
    '2xl': '2rem',  // 32px
    '3xl': '3rem',  // 48px
    '4xl': '4rem',  // 64px
  },
  comfortable: {
    xs: '0.375rem', // 6px
    sm: '0.75rem',  // 12px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
    '3xl': '4rem',  // 64px
    '4xl': '6rem',  // 96px
  },
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
} as const;

// ============================================================================
// BREAKPOINTS (3-tier responsive)
// ============================================================================

export const breakpoints = {
  mobile: '640px',   // sm
  tablet: '1024px',  // lg
  desktop: '1280px', // xl
} as const;

// ============================================================================
// THEME TOKENS (Light & Dark modes)
// ============================================================================

export const lightTheme = {
  colors: {
    background: {
      primary: colors.neutral[50],
      secondary: '#ffffff',
      tertiary: colors.neutral[100],
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    text: {
      primary: colors.neutral[900],
      secondary: colors.neutral[600],
      tertiary: colors.neutral[500],
      inverse: '#ffffff',
      link: colors.primary[600],
      linkHover: colors.primary[700],
    },
    border: {
      default: colors.neutral[200],
      hover: colors.neutral[300],
      focus: colors.primary[500],
    },
    interactive: {
      default: colors.primary[500],
      hover: colors.primary[600],
      active: colors.primary[700],
      disabled: colors.neutral[300],
    },
    status: {
      success: colors.success,
      warning: colors.warning,
      error: colors.error,
      info: colors.info,
    },
  },
} as const;

export const darkTheme = {
  colors: {
    background: {
      primary: colors.neutral[900],
      secondary: colors.neutral[800],
      tertiary: colors.neutral[700],
      overlay: 'rgba(0, 0, 0, 0.7)',
    },
    text: {
      primary: colors.neutral[50],
      secondary: colors.neutral[300],
      tertiary: colors.neutral[400],
      inverse: colors.neutral[900],
      link: colors.primary[400],
      linkHover: colors.primary[300],
    },
    border: {
      default: colors.neutral[700],
      hover: colors.neutral[600],
      focus: colors.primary[500],
    },
    interactive: {
      default: colors.primary[500],
      hover: colors.primary[400],
      active: colors.primary[300],
      disabled: colors.neutral[600],
    },
    status: {
      success: colors.success,
      warning: colors.warning,
      error: colors.error,
      info: colors.info,
    },
  },
} as const;

// ============================================================================
// COMPONENT TOKENS
// ============================================================================

export const components = {
  button: {
    paddingX: {
      compact: spacing.compact.lg,
      comfortable: spacing.comfortable.lg,
    },
    paddingY: {
      compact: spacing.compact.sm,
      comfortable: spacing.comfortable.sm,
    },
    borderRadius: borderRadius.md,
    fontWeight: typography.fontWeight.medium,
    transition: 'all 0.2s ease-in-out',
  },
  
  card: {
    padding: {
      compact: spacing.compact.lg,
      comfortable: spacing.comfortable.xl,
    },
    borderRadius: borderRadius.lg,
    shadow: shadows.md,
    hoverShadow: shadows.lg,
    transition: 'all 0.3s ease-in-out',
  },
  
  input: {
    paddingX: {
      compact: spacing.compact.md,
      comfortable: spacing.comfortable.md,
    },
    paddingY: {
      compact: spacing.compact.sm,
      comfortable: spacing.comfortable.sm,
    },
    borderRadius: borderRadius.md,
    borderWidth: '1px',
    focusRingWidth: '2px',
    focusRingOffset: '2px',
  },
  
  navbar: {
    height: {
      compact: '56px',
      comfortable: '64px',
    },
    paddingX: {
      compact: spacing.compact.lg,
      comfortable: spacing.comfortable.xl,
    },
    shadow: shadows.sm,
  },
} as const;

// ============================================================================
// ANIMATION
// ============================================================================

export const animation = {
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ============================================================================
// ACCESSIBILITY (WCAG AA compliant)
// ============================================================================

export const a11y = {
  minTouchTarget: '44px',
  focusRingColor: colors.primary[500],
  focusRingWidth: '2px',
  focusRingOffset: '2px',
  focusRingStyle: 'solid',
  
  // Contrast ratios (WCAG AA: 4.5:1 for normal text, 3:1 for large text)
  contrastRatios: {
    normalText: 4.5,
    largeText: 3,
    uiComponents: 3,
  },
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getSpacing(density: Density) {
  return density === 'compact' ? spacing.compact : spacing.comfortable;
}

export function getTheme(mode: ColorMode) {
  return mode === 'light' ? lightTheme : darkTheme;
}

export function getComponentTokens(component: keyof typeof components, density: Density) {
  const comp = components[component];
  const result: any = {};
  
  for (const [key, value] of Object.entries(comp)) {
    if (typeof value === 'object' && 'compact' in value && 'comfortable' in value) {
      result[key] = value[density];
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

