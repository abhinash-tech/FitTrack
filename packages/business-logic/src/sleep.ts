/**
 * @fittrack/business-logic — Sleep
 * Pure functions for sleep analysis, quality labeling, debt calculation, and hygiene insights.
 */

import type { SleepEntry } from "@fittrack/types"
import { differenceInMinutes, parseISO, format } from "date-fns"

// ─── Quality Labels ────────────────────────────────────────────────────────────

export interface SleepQualityInfo {
  label: string
  emoji: string
  colorClass: string
  description: string
}

const QUALITY_MAP_LIST: Array<{ rating: number } & SleepQualityInfo> = [
  { rating: 1, label: "Poor", emoji: "😴", colorClass: "text-red-500", description: "Restless night, you may feel fatigued." },
  { rating: 2, label: "Fair", emoji: "😪", colorClass: "text-orange-400", description: "Light sleep, not fully restorative." },
  { rating: 3, label: "Good", emoji: "😌", colorClass: "text-yellow-400", description: "Decent rest, recovery in progress." },
  { rating: 4, label: "Very Good", emoji: "😊", colorClass: "text-teal-400", description: "Well rested, good energy expected." },
  { rating: 5, label: "Excellent", emoji: "🌟", colorClass: "text-green-400", description: "Peak recovery, you should feel great!" },
]

const DEFAULT_QUALITY: SleepQualityInfo = {
  label: "Good",
  emoji: "😌",
  colorClass: "text-yellow-400",
  description: "Decent rest, recovery in progress.",
}

export function getSleepQualityInfo(quality: number): SleepQualityInfo {
  const rounded = Math.round(quality)
  return QUALITY_MAP_LIST.find((q) => q.rating === rounded) ?? DEFAULT_QUALITY
}

// ─── Duration Helpers ──────────────────────────────────────────────────────────

/**
 * Calculate sleep duration in minutes between bedtime and wake time ISO strings.
 * Handles crossing midnight correctly.
 */
export function calcSleepDurationMinutes(bedtime: string, wakeTime: string): number {
  const diff = differenceInMinutes(parseISO(wakeTime), parseISO(bedtime))
  return diff > 0 ? diff : 0
}

/**
 * Convert duration in minutes to a display string like "7h 30m"
 */
export function formatSleepDurationLabel(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

// ─── Debt / Surplus ────────────────────────────────────────────────────────────

export interface SleepDebtResult {
  debtMinutes: number          // Positive = debt, negative = surplus
  debtHours: number
  label: string                // e.g. "-1.5 hrs debt" or "+0.5 hrs surplus"
  isDeficit: boolean
  weeklyActualMinutes: number
  weeklyTargetMinutes: number
}

/**
 * Calculate sleep debt or surplus over the past 7 days.
 * @param entries - Array of SleepEntry, sorted descending, up to 7 days
 * @param targetHoursPerNight - User's sleep goal (default 8)
 */
export function calculateSleepDebt(
  entries: SleepEntry[],
  targetHoursPerNight = 8
): SleepDebtResult {
  const last7 = entries.slice(0, 7)
  const daysWithData = last7.length || 1
  const targetMinutes = targetHoursPerNight * 60 * daysWithData
  const actualMinutes = last7.reduce((sum, e) => sum + (e.duration_min ?? 0), 0)
  const debtMinutes = targetMinutes - actualMinutes
  const debtHours = Math.abs(debtMinutes / 60)
  const isDeficit = debtMinutes > 0

  const label = isDeficit
    ? `-${debtHours.toFixed(1)} hrs debt`
    : `+${debtHours.toFixed(1)} hrs surplus`

  return {
    debtMinutes,
    debtHours,
    label,
    isDeficit,
    weeklyActualMinutes: actualMinutes,
    weeklyTargetMinutes: targetMinutes,
  }
}

// ─── Averages ─────────────────────────────────────────────────────────────────

export interface SleepAverages {
  avgDurationMinutes: number
  avgDurationHours: number
  avgQuality: number
  entryCount: number
  label: string  // e.g. "7h 20m avg"
}

export function calculateSleepAverages(entries: SleepEntry[]): SleepAverages {
  if (entries.length === 0) {
    return { avgDurationMinutes: 0, avgDurationHours: 0, avgQuality: 0, entryCount: 0, label: "No data" }
  }
  const totalMin = entries.reduce((sum, e) => sum + (e.duration_min ?? 0), 0)
  const totalQuality = entries.reduce((sum, e) => sum + (e.quality ?? 0), 0)
  const entriesWithQuality = entries.filter((e) => e.quality != null).length

  const avgDurationMinutes = Math.round(totalMin / entries.length)
  const avgDurationHours = avgDurationMinutes / 60
  const avgQuality = entriesWithQuality > 0 ? totalQuality / entriesWithQuality : 0

  return {
    avgDurationMinutes,
    avgDurationHours,
    avgQuality,
    entryCount: entries.length,
    label: formatSleepDurationLabel(avgDurationMinutes),
  }
}

// ─── Chart Data ────────────────────────────────────────────────────────────────

export interface SleepChartPoint {
  date: string       // YYYY-MM-DD
  dayLabel: string   // "Mon", "Tue", etc.
  durationHours: number
  durationMinutes: number
  quality: number | null
  bedtime: string | null
  wakeTime: string | null
  notes: string | null
  qualityInfo: SleepQualityInfo | null
}

/**
 * Build the 7-day chart data, filling in zeros for days with no log.
 */
export function buildSleepChartData(
  entries: SleepEntry[],
  days = 7
): SleepChartPoint[] {
  const entryMap = new Map<string, SleepEntry>()
  entries.forEach((e) => entryMap.set(e.date, e))

  const result: SleepChartPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = format(d, "yyyy-MM-dd")
    const entry = entryMap.get(dateStr)

    result.push({
      date: dateStr,
      dayLabel: format(d, "EEE"),
      durationHours: entry ? (entry.duration_min ?? 0) / 60 : 0,
      durationMinutes: entry?.duration_min ?? 0,
      quality: entry?.quality ?? null,
      bedtime: entry?.bedtime ?? null,
      wakeTime: entry?.wake_time ?? null,
      notes: entry?.notes ?? null,
      qualityInfo: entry?.quality ? getSleepQualityInfo(entry.quality) : null,
    })
  }
  return result
}

// ─── Hygiene Insights ──────────────────────────────────────────────────────────

export interface SleepInsight {
  icon: string
  title: string
  tip: string
  priority: "high" | "medium" | "low"
}

/**
 * Generate contextual, non-medical sleep hygiene suggestions.
 */
export function getSleepHygieneInsights(
  avgHours: number,
  avgQuality: number,
  targetHours = 8
): SleepInsight[] {
  const insights: SleepInsight[] = []

  if (avgHours < targetHours - 1) {
    insights.push({
      icon: "🕰️",
      title: "Consistent Bedtime",
      tip: `Aim to be in bed by the same time each night. Even small consistency improvements can add up to ${(targetHours - avgHours).toFixed(1)} more hours.`,
      priority: "high",
    })
  }

  if (avgQuality <= 2.5) {
    insights.push({
      icon: "📵",
      title: "Screen Curfew",
      tip: "Avoid screens at least 30 minutes before bed. Blue light suppresses melatonin, reducing deep sleep quality.",
      priority: "high",
    })
  }

  if (avgHours < targetHours) {
    insights.push({
      icon: "🌡️",
      title: "Cool Your Room",
      tip: "A room temperature between 18–21°C is scientifically linked to faster sleep onset and better sleep efficiency.",
      priority: "medium",
    })
  }

  insights.push({
    icon: "☕",
    title: "Caffeine Cutoff",
    tip: "Caffeine has a 5–6 hour half-life. Cut off caffeine by 2 PM to ensure it clears your system before bed.",
    priority: "medium",
  })

  if (avgQuality >= 4) {
    insights.push({
      icon: "✨",
      title: "Great Sleep Hygiene!",
      tip: "Your sleep quality is excellent. Keep up the consistent bedtime routine and protect this streak.",
      priority: "low",
    })
  }

  return insights.slice(0, 3)
}
