/**
 * @fittrack/config
 * Shared design tokens and constants used by web (Tailwind) and mobile (NativeWind/StyleSheet)
 */

// ─── Color Palette ────────────────────────────────────────────────────────────

export const colors = {
  // Brand
  primary: "#06D6A0",       // Electric teal — main accent
  primaryDim: "#059669",    // Muted teal
  primaryGlow: "rgba(6, 214, 160, 0.15)",
  secondary: "#6366F1",     // Indigo
  secondaryDim: "#4F46E5",

  // Backgrounds
  background: "#0A0F1E",    // Deep navy
  surface: "#111827",       // Card background
  surface2: "#1C2333",      // Elevated card

  // Borders
  border: "#1F2937",
  borderMuted: "#111827",

  // Text
  textPrimary: "#F9FAFB",
  textMuted: "#6B7280",
  textSubtle: "#374151",

  // Semantic
  success: "#10B981",
  successBg: "rgba(16, 185, 129, 0.1)",
  warning: "#F59E0B",
  warningBg: "rgba(245, 158, 11, 0.1)",
  error: "#EF4444",
  errorBg: "rgba(239, 68, 68, 0.1)",
  info: "#3B82F6",
  infoBg: "rgba(59, 130, 246, 0.1)",

  // Chart colors (used in Recharts and Victory)
  chart: {
    hydration: "#06D6A0",
    calories: "#F59E0B",
    protein: "#6366F1",
    carbs: "#F97316",
    fat: "#EC4899",
    sleep: "#8B5CF6",
    weight: "#06B6D4",
    steps: "#84CC16",
  },
} as const

// ─── Spacing ─────────────────────────────────────────────────────────────────

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
  "4xl": 80,
  "5xl": 96,
} as const

// ─── Border Radius ────────────────────────────────────────────────────────────

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
} as const

// ─── Typography ───────────────────────────────────────────────────────────────

export const typography = {
  sizes: {
    micro: 11,
    xs: 12,
    sm: 13,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
    display: 48,
  },
  weights: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },
  lineHeights: {
    tight: 1.2,
    snug: 1.35,
    normal: 1.5,
    relaxed: 1.65,
  },
} as const

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 32,
    elevation: 8,
  },
  glow: {
    shadowColor: "#06D6A0",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 6,
  },
} as const

// ─── App Constants ────────────────────────────────────────────────────────────

export const APP_CONSTANTS = {
  DEFAULT_WATER_GOAL_ML: 2500,
  DEFAULT_SLEEP_GOAL_HOURS: 8,
  DEFAULT_STEP_GOAL: 8000,
  DEFAULT_CALORIE_GOAL: 2000,
  DEFAULT_REMINDER_INTERVAL_MIN: 90,
  MIN_REMINDER_INTERVAL_MIN: 15,
  MAX_WATER_ENTRY_ML: 5000,
  MIN_WATER_ENTRY_ML: 1,
  QUICK_ADD_AMOUNTS: [250, 350, 500, 750] as const,
} as const

// ─── Achievement Slugs ────────────────────────────────────────────────────────

export const ACHIEVEMENT_SLUGS = {
  FIRST_WATER_LOG: "first_water_log",
  HYDRATION_DAY: "hydration_day",
  HYDRATION_STREAK_7: "hydration_streak_7",
  HYDRATION_STREAK_30: "hydration_streak_30",
  HYDRATION_HERO: "hydration_hero",
  FIRST_WORKOUT: "first_workout",
  WORKOUT_STREAK_7: "workout_streak_7",
  WORKOUT_WARRIOR: "workout_warrior",
  FIRST_WALK: "first_walk",
  WALKER_10K: "walker_10k",
  FIRST_RUN: "first_run",
  SLEEP_CHAMPION: "sleep_champion",
  GOAL_CRUSHER: "goal_crusher",
  STREAK_30: "streak_30",
  STREAK_100: "streak_100",
} as const

export type AchievementSlug = (typeof ACHIEVEMENT_SLUGS)[keyof typeof ACHIEVEMENT_SLUGS]
