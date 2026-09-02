import type { DailyStat, Profile, WellnessScoreBreakdown } from "@fittrack/types"
import { formatWater } from "@fittrack/utils"

export interface HealthInsight {
  id: string
  type: "tip" | "achievement" | "warning" | "positive"
  message: string
  icon: string
}

/**
 * Generate personalized daily health insights based on today's data.
 * These are observations, NOT medical advice.
 */
export function generateDailyInsights(
  todayStat: Partial<DailyStat>,
  breakdown: WellnessScoreBreakdown | null,
  profile: Partial<Profile>,
  hydrationStreak: number,
  workoutStreak: number
): HealthInsight[] {
  const insights: HealthInsight[] = []

  const waterGoal = 2500 // fallback; real goal comes from hydration_goals table
  const waterPct = todayStat.water_ml
    ? Math.round((todayStat.water_ml / waterGoal) * 100)
    : 0

  // Hydration insights
  if (waterPct < 30) {
    insights.push({
      id: "hydration_low",
      type: "warning",
      icon: "💧",
      message: "Your hydration is well behind today's pace. Try drinking a glass of water now.",
    })
  } else if (waterPct >= 100) {
    insights.push({
      id: "hydration_complete",
      type: "positive",
      icon: "🎉",
      message: "Amazing! You've hit your water goal for today.",
    })
  } else if (waterPct >= 60) {
    insights.push({
      id: "hydration_good",
      type: "tip",
      icon: "💧",
      message: `Hydration is looking good at ${waterPct}%. Keep it up!`,
    })
  }

  // Streak insights
  if (hydrationStreak >= 7) {
    insights.push({
      id: "hydration_streak",
      type: "positive",
      icon: "🔥",
      message: `You've maintained your hydration goal for ${hydrationStreak} consecutive days. Incredible!`,
    })
  }

  if (workoutStreak >= 3) {
    insights.push({
      id: "workout_streak",
      type: "positive",
      icon: "💪",
      message: `${workoutStreak}-day workout streak! Consistency is the key to lasting results.`,
    })
  }

  // Activity insight
  const steps = todayStat.steps ?? 0
  const stepGoal = 8000
  if (steps > 0 && steps < stepGoal * 0.5) {
    insights.push({
      id: "low_steps",
      type: "tip",
      icon: "🚶",
      message: `Step count is low today. A short 10-minute walk can make a difference.`,
    })
  } else if (steps >= stepGoal) {
    insights.push({
      id: "step_goal_met",
      type: "positive",
      icon: "👟",
      message: `Step goal reached! ${steps.toLocaleString()} steps today.`,
    })
  }

  // Workout insight
  if ((todayStat.workout_count ?? 0) > 0) {
    insights.push({
      id: "workout_done",
      type: "positive",
      icon: "🏋️",
      message: "You've completed your workout today. Your body thanks you!",
    })
  }

  // Sleep insight
  const sleepMin = todayStat.sleep_min ?? 0
  const sleepGoalMin = 480 // 8 hours
  if (sleepMin > 0 && sleepMin < sleepGoalMin * 0.8) {
    insights.push({
      id: "low_sleep",
      type: "warning",
      icon: "😴",
      message: "You got less sleep than your goal. Aim for at least 7-8 hours for optimal recovery.",
    })
  } else if (sleepMin >= sleepGoalMin) {
    insights.push({
      id: "good_sleep",
      type: "positive",
      icon: "🌙",
      message: "Great sleep last night! You're well-rested and ready to perform.",
    })
  }

  // Cap at 3 insights to avoid overwhelming the user
  return insights.slice(0, 3)
}
