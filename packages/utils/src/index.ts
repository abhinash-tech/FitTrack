/**
 * @fittrack/utils
 * Pure, side-effect-free utility functions shared by web and mobile.
 * All functions are tested.
 */

import { format, parseISO, differenceInMinutes } from "date-fns"
import type { UnitSystem, WellnessScoreInput, WellnessScoreBreakdown } from "@fittrack/types"

// ─── Water / Hydration ────────────────────────────────────────────────────────

/**
 * Format millilitres to human-readable string
 * @example formatWater(2500) → "2.5 L"
 * @example formatWater(750, true) → "750ml"
 */
export function formatWater(ml: number, compact = false): string {
  if (compact) {
    if (ml >= 1000) return `${(ml / 1000).toFixed(ml % 1000 === 0 ? 0 : 1)}L`
    return `${ml}ml`
  }
  if (ml >= 1000) return `${(ml / 1000).toFixed(1)} L`
  return `${ml} ml`
}

/**
 * Calculate percentage, capped at 100 for display
 */
export function formatPercent(value: number, total: number): number {
  if (total === 0) return 0
  return Math.min(100, Math.round((value / total) * 100))
}

// ─── Calories / Nutrition ─────────────────────────────────────────────────────

/**
 * @example formatCalories(1420) → "1,420 kcal"
 */
export function formatCalories(cal: number): string {
  return `${formatNumber(Math.round(cal))} kcal`
}

/**
 * @example formatMacro(28.5) → "28.5g"
 */
export function formatMacro(grams: number): string {
  return `${Math.round(grams * 10) / 10}g`
}

// ─── Duration ─────────────────────────────────────────────────────────────────

/**
 * @example formatDuration(90) → "1h 30m"
 * @example formatDuration(45) → "45m"
 */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/**
 * @example formatSleepDuration(450) → "7h 30m"
 */
export const formatSleepDuration = formatDuration

// ─── Distance / Pace ──────────────────────────────────────────────────────────

/**
 * @example formatDistance(5.25, 'metric') → "5.25 km"
 * @example formatDistance(5.25, 'imperial') → "3.26 mi"
 */
export function formatDistance(km: number, unit: UnitSystem = "metric"): string {
  if (unit === "imperial") {
    return `${(km * 0.621371).toFixed(2)} mi`
  }
  return `${km.toFixed(2)} km`
}

/**
 * @example formatPace(5.5, 'metric') → "5:30 /km"
 */
export function formatPace(minPerKm: number, unit: UnitSystem = "metric"): string {
  const totalSec = Math.round(minPerKm * 60)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  const suffix = unit === "imperial" ? "/mi" : "/km"
  return `${m}:${String(s).padStart(2, "0")} ${suffix}`
}

/**
 * Calculate pace from distance and duration
 */
export function calculatePace(distanceKm: number, durationMin: number): number {
  if (distanceKm === 0) return 0
  return durationMin / distanceKm
}

// ─── Weight ───────────────────────────────────────────────────────────────────

/**
 * @example formatWeight(68.4, 'metric') → "68.4 kg"
 * @example formatWeight(68.4, 'imperial') → "150.8 lb"
 */
export function formatWeight(kg: number, unit: UnitSystem = "metric"): string {
  if (unit === "imperial") {
    return `${(kg * 2.20462).toFixed(1)} lb`
  }
  return `${kg.toFixed(1)} kg`
}

// ─── Numbers ──────────────────────────────────────────────────────────────────

/**
 * @example formatNumber(8000) → "8,000"
 */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat().format(n)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

// ─── Dates ────────────────────────────────────────────────────────────────────

/**
 * Get YYYY-MM-DD for today in local timezone
 */
export function todayDate(): string {
  return format(new Date(), "yyyy-MM-dd")
}

/**
 * @example formatDateLabel('2024-03-15') → "Mar 15"
 */
export function formatDateLabel(dateStr: string): string {
  return format(parseISO(dateStr), "MMM d")
}

/**
 * @example formatDayLabel('2024-03-15') → "Fri"
 */
export function formatDayLabel(dateStr: string): string {
  return format(parseISO(dateStr), "EEE")
}

/**
 * @example formatTime('2024-03-15T22:30:00Z') → "10:30 PM"
 */
export function formatTime(isoString: string): string {
  return format(parseISO(isoString), "h:mm a")
}

/**
 * Calculate duration between two ISO datetime strings in minutes
 */
export function durationBetween(start: string, end: string): number {
  return differenceInMinutes(parseISO(end), parseISO(start))
}

// ─── ID Generation ────────────────────────────────────────────────────────────

/**
 * Generate a UUID v4 (for offline-first optimistic inserts)
 * Works in both browser and React Native environments
 */
export function generateId(): string {
  const g = globalThis as any;
  if (typeof g !== "undefined" && g.crypto && g.crypto.randomUUID) {
    return g.crypto.randomUUID()
  }
  // Fallback for older environments
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// ─── Greeting ─────────────────────────────────────────────────────────────────

export function getGreeting(name?: string): string {
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
  return name ? `${greeting}, ${name.split(" ")[0]}` : greeting
}

// ─── Wellness Score ───────────────────────────────────────────────────────────

export function calculateWellnessScore(input: WellnessScoreInput): WellnessScoreBreakdown {
  const hydrationPct = formatPercent(input.waterMl, input.waterGoalMl)
  const caloriePct = formatPercent(input.caloriesConsumed, input.caloriesGoal)
  const stepsPct = formatPercent(input.stepsTaken, input.stepsGoal)
  const sleepPct = formatPercent(input.sleepMin, input.sleepGoalMin)
  const goalsPct =
    input.goalsTotal > 0
      ? formatPercent(input.goalsCompletedCount, input.goalsTotal)
      : 0

  // Weights: hydration 30%, activity 20%, workout 15%, nutrition 15%, sleep 15%, goals 5%
  const hydration = Math.round(hydrationPct * 0.3)
  const activity = Math.round(stepsPct * 0.2)
  const workout = input.workoutCompleted ? 15 : 0
  const nutrition = Math.round(clamp(caloriePct, 0, 100) * 0.15)
  const sleep = Math.round(sleepPct * 0.15)
  const goals = Math.round(goalsPct * 0.05)

  const total = clamp(hydration + activity + workout + nutrition + sleep + goals, 0, 100)

  return { hydration, activity, workout, nutrition, sleep, goals, total }
}

// ─── Calorie Estimation ───────────────────────────────────────────────────────

/**
 * Estimate calories burned during walking/running
 * MET-based formula: Calories = MET × weight(kg) × duration(hours)
 */
export function estimateCaloriesBurned(
  activityType: "walking" | "running" | "hiit" | "strength" | "yoga",
  durationMin: number,
  weightKg: number
): number {
  const metValues = {
    walking: 3.5,
    running: 8.0,
    hiit: 8.0,
    strength: 5.0,
    yoga: 2.5,
  }
  const met = metValues[activityType]
  return Math.round(met * weightKg * (durationMin / 60))
}

// ─── BMR / Daily Calorie Target ───────────────────────────────────────────────

/**
 * Mifflin-St Jeor BMR formula
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: "male" | "female"
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return Math.round(gender === "male" ? base + 5 : base - 161)
}

/**
 * Activity multipliers for TDEE
 */
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

export function calculateDailyCalorieTarget(
  bmr: number,
  activityLevel: keyof typeof ACTIVITY_MULTIPLIERS
): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel])
}

/**
 * Recommend water intake in ml based on weight and activity level
 */
export function recommendWaterIntake(
  weightKg: number,
  activityLevel: keyof typeof ACTIVITY_MULTIPLIERS
): number {
  const base = weightKg * 35 // 35ml per kg body weight
  const activityBonus =
    activityLevel === "sedentary"
      ? 0
      : activityLevel === "light"
      ? 200
      : activityLevel === "moderate"
      ? 400
      : activityLevel === "active"
      ? 600
      : 800
  return Math.round((base + activityBonus) / 50) * 50 // round to nearest 50ml
}
