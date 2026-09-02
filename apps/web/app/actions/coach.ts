"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { GeminiCoachProvider, calculateWellnessScore } from "@fittrack/business-logic"
import { getProfile, getTodayStats, getActiveGoals } from "@fittrack/supabase"

export async function generateDailyCoachTipAction(): Promise<{ tip: string, error: string | null }> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { tip: "", error: "Unauthorized" }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return { tip: "", error: "AI API Key missing" }

    const [profile, stats, goals] = await Promise.all([
      getProfile(supabase, user.id),
      getTodayStats(supabase, user.id),
      getActiveGoals(supabase, user.id)
    ])

    const breakdown = calculateWellnessScore({
      waterMl: stats?.water_ml ?? 0,
      waterGoalMl: 2500,
      caloriesConsumed: stats?.calories_consumed ?? 0,
      caloriesGoal: 2000,
      stepsTaken: stats?.steps ?? 0,
      stepsGoal: 8000,
      sleepMin: stats?.sleep_min ?? 0,
      sleepGoalMin: 480,
      workoutCompleted: (stats?.workout_count ?? 0) > 0,
      goalsCompletedCount: 0,
      goalsTotal: goals.length
    })

    const provider = new GeminiCoachProvider(apiKey)
    const tip = await provider.generateDailyTip({
      userName: profile?.name || "there",
      goals: goals.map(g => ({ title: g.title, type: g.type })),
      todayScore: breakdown.total,
      hydrationStreak: stats?.hydration_streak ?? 0,
      workoutStreak: stats?.workout_streak ?? 0,
      sleepHours: (stats?.sleep_min ?? 0) / 60,
      calories: stats?.calories_consumed ?? 0
    })

    return { tip, error: null }
  } catch (err: any) {
    console.error("Failed to generate coach tip:", err)
    return { tip: "", error: "Failed to generate tip" }
  }
}
