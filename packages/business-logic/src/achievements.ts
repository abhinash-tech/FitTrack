import type { Achievement, UserAchievement, DailyStat } from "@fittrack/types"
import { ACHIEVEMENT_SLUGS } from "@fittrack/config"

export interface AchievementCheckContext {
  dailyStats: DailyStat[]
  userAchievements: UserAchievement[]
  totalWaterEntries: number
  totalWorkouts: number
  totalWalkKm: number
  totalRunKm: number
  hydrationStreak: number
  workoutStreak: number
}

/**
 * Check which achievements should be newly unlocked
 * Returns slugs of achievements to unlock
 */
export function checkNewAchievements(ctx: AchievementCheckContext): string[] {
  const earned = new Set(ctx.userAchievements.map((ua) => ua.achievement?.slug ?? ""))
  const toUnlock: string[] = []

  const check = (slug: string, condition: boolean) => {
    if (!earned.has(slug) && condition) toUnlock.push(slug)
  }

  check(ACHIEVEMENT_SLUGS.FIRST_WATER_LOG, ctx.totalWaterEntries >= 1)
  check(ACHIEVEMENT_SLUGS.HYDRATION_STREAK_7, ctx.hydrationStreak >= 7)
  check(ACHIEVEMENT_SLUGS.HYDRATION_STREAK_30, ctx.hydrationStreak >= 30)
  check(ACHIEVEMENT_SLUGS.FIRST_WORKOUT, ctx.totalWorkouts >= 1)
  check(ACHIEVEMENT_SLUGS.WORKOUT_STREAK_7, ctx.workoutStreak >= 7)
  check(ACHIEVEMENT_SLUGS.WORKOUT_WARRIOR, ctx.totalWorkouts >= 10)
  check(ACHIEVEMENT_SLUGS.FIRST_WALK, ctx.totalWalkKm > 0)
  check(ACHIEVEMENT_SLUGS.WALKER_10K, ctx.totalWalkKm >= 10)
  check(ACHIEVEMENT_SLUGS.FIRST_RUN, ctx.totalRunKm > 0)
  check(
    ACHIEVEMENT_SLUGS.STREAK_30,
    ctx.hydrationStreak >= 30 || ctx.workoutStreak >= 30
  )
  check(
    ACHIEVEMENT_SLUGS.STREAK_100,
    ctx.hydrationStreak >= 100 || ctx.workoutStreak >= 100
  )

  return toUnlock
}

/**
 * Get achievement display data (emoji + message)
 */
export function getAchievementDisplay(slug: string): {
  emoji: string
  title: string
  subtitle: string
} {
  const map: Record<string, { emoji: string; title: string; subtitle: string }> = {
    [ACHIEVEMENT_SLUGS.FIRST_WATER_LOG]: {
      emoji: "💧",
      title: "First Sip",
      subtitle: "Logged your first water entry",
    },
    [ACHIEVEMENT_SLUGS.HYDRATION_STREAK_7]: {
      emoji: "🌊",
      title: "7-Day Water Streak",
      subtitle: "Met your hydration goal 7 days in a row",
    },
    [ACHIEVEMENT_SLUGS.HYDRATION_STREAK_30]: {
      emoji: "🏆",
      title: "Hydration Hero",
      subtitle: "Met your water goal for 30 consecutive days",
    },
    [ACHIEVEMENT_SLUGS.FIRST_WORKOUT]: {
      emoji: "💪",
      title: "First Sweat",
      subtitle: "Completed your first workout",
    },
    [ACHIEVEMENT_SLUGS.WORKOUT_WARRIOR]: {
      emoji: "🔥",
      title: "Workout Warrior",
      subtitle: "Logged 10 workouts",
    },
    [ACHIEVEMENT_SLUGS.FIRST_WALK]: {
      emoji: "🚶",
      title: "First Steps",
      subtitle: "Logged your first walk",
    },
    [ACHIEVEMENT_SLUGS.WALKER_10K]: {
      emoji: "🏅",
      title: "10K Walker",
      subtitle: "Walked a total of 10 km",
    },
    [ACHIEVEMENT_SLUGS.STREAK_30]: {
      emoji: "⚡",
      title: "30-Day Streak",
      subtitle: "30 consecutive days of healthy habits",
    },
    [ACHIEVEMENT_SLUGS.STREAK_100]: {
      emoji: "👑",
      title: "Century Club",
      subtitle: "100 consecutive days — legendary!",
    },
  }
  return (
    map[slug] ?? { emoji: "🏆", title: "Achievement Unlocked", subtitle: "Keep it up!" }
  )
}
