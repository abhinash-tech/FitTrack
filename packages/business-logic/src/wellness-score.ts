import { calculateWellnessScore } from "@fittrack/utils"
import type { WellnessScoreInput, WellnessScoreBreakdown } from "@fittrack/types"

export { calculateWellnessScore }
export type { WellnessScoreInput, WellnessScoreBreakdown }

/**
 * Describe what contributed to the wellness score in plain English
 */
export function explainWellnessScore(breakdown: WellnessScoreBreakdown): string[] {
  const insights: string[] = []

  if (breakdown.hydration >= 25) insights.push("Great hydration today! 💧")
  else if (breakdown.hydration >= 15) insights.push("Hydration is on track.")
  else insights.push("Drink more water to boost your score.")

  if (breakdown.workout === 15) insights.push("Workout completed! 💪")
  else insights.push("Log a workout to earn fitness points.")

  if (breakdown.sleep >= 12) insights.push("Excellent sleep last night. 😴")
  else if (breakdown.sleep >= 8) insights.push("Sleep is decent.")
  else insights.push("Try to get more sleep for better recovery.")

  if (breakdown.activity >= 15) insights.push("Step goal crushed! 🚶")
  else if (breakdown.activity >= 10) insights.push("Activity is looking good.")
  else insights.push("Take a walk to increase your activity score.")

  return insights
}

/**
 * Get wellness score tier
 */
export function getScoreTier(score: number): {
  label: string
  color: string
  emoji: string
} {
  if (score >= 85) return { label: "Excellent", color: "#06D6A0", emoji: "🌟" }
  if (score >= 70) return { label: "Good", color: "#84CC16", emoji: "😊" }
  if (score >= 50) return { label: "Fair", color: "#F59E0B", emoji: "😐" }
  return { label: "Needs Work", color: "#EF4444", emoji: "💪" }
}
