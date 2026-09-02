import { parseISO, differenceInCalendarDays, isSameDay } from "date-fns"
import type { HydrationEntry, WorkoutSession } from "@fittrack/types"

/**
 * Calculate current hydration streak from entries
 * A streak is consecutive days where the water goal was met.
 * @param dailyTotals Array of { date: string, totalMl: number, goalMl: number }
 */
export function calculateHydrationStreak(
  dailyTotals: Array<{ date: string; totalMl: number; goalMl: number }>
): number {
  if (dailyTotals.length === 0) return 0

  // Sort descending by date
  const sorted = [...dailyTotals].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  let streak = 0
  let prevDate: Date | null = null

  for (const day of sorted) {
    const goalMet = day.totalMl >= day.goalMl
    if (!goalMet) break

    const currentDate = parseISO(day.date)
    if (prevDate === null) {
      streak = 1
      prevDate = currentDate
    } else {
      const diff = differenceInCalendarDays(prevDate, currentDate)
      if (diff === 1) {
        streak++
        prevDate = currentDate
      } else {
        break
      }
    }
  }

  return streak
}

/**
 * Calculate current workout streak
 * A streak is consecutive days with at least one workout logged.
 */
export function calculateWorkoutStreak(sessions: WorkoutSession[]): number {
  if (sessions.length === 0) return 0

  // Get unique workout dates, sorted descending
  const dates = [
    ...new Set(sessions.map((s) => s.date)),
  ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  let streak = 0
  let prevDate: Date | null = null

  for (const dateStr of dates) {
    const currentDate = parseISO(dateStr)
    if (prevDate === null) {
      streak = 1
      prevDate = currentDate
    } else {
      const diff = differenceInCalendarDays(prevDate, currentDate)
      if (diff === 1) {
        streak++
        prevDate = currentDate
      } else {
        break
      }
    }
  }

  return streak
}

/**
 * Check if today's hydration goal was already met
 */
export function isTodayGoalMet(entries: HydrationEntry[], goalMl: number): boolean {
  const today = new Date()
  const todayEntries = entries.filter((e) => isSameDay(parseISO(e.date), today))
  const total = todayEntries.reduce((sum, e) => sum + e.amount_ml, 0)
  return total >= goalMl
}

/**
 * Calculate total water intake for a given date string
 */
export function getTotalWaterForDate(entries: HydrationEntry[], date: string): number {
  return entries
    .filter((e) => e.date === date)
    .reduce((sum, e) => sum + e.amount_ml, 0)
}
