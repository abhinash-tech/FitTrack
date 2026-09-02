"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { checkNewAchievements } from "@fittrack/business-logic"
import { 
  getDailyStatsHistory, 
  getUserAchievements, 
  getAllAchievements,
  awardAchievements 
} from "@fittrack/supabase"

export async function checkAndAwardAchievementsAction(): Promise<{ success: boolean; unlocked: string[] }> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, unlocked: [] }

    // Fetch context data
    const [stats, userAchvs, allAchvs] = await Promise.all([
      getDailyStatsHistory(supabase, user.id, 100), // Get last 100 days
      getUserAchievements(supabase, user.id),
      getAllAchievements(supabase)
    ])

    // Calculate aggregations for the context
    const totalWaterEntries = stats.filter(s => s.water_ml > 0).length
    const totalWorkouts = stats.reduce((sum, s) => sum + (s.workout_count || 0), 0)
    const totalWalkKm = stats.reduce((sum, s) => sum + (s.walk_km || 0), 0)
    const totalRunKm = stats.reduce((sum, s) => sum + (s.run_km || 0), 0)
    const hydrationStreak = stats[0]?.hydration_streak || 0
    const workoutStreak = stats[0]?.workout_streak || 0

    // Check for new achievements
    const toUnlockSlugs = checkNewAchievements({
      dailyStats: stats,
      userAchievements: userAchvs,
      totalWaterEntries,
      totalWorkouts,
      totalWalkKm,
      totalRunKm,
      hydrationStreak,
      workoutStreak
    })

    if (toUnlockSlugs.length > 0) {
      // Find the UUIDs for these slugs
      const toAwardIds = allAchvs
        .filter(a => toUnlockSlugs.includes(a.slug))
        .map(a => a.id)

      if (toAwardIds.length > 0) {
        await awardAchievements(supabase, user.id, toAwardIds)
        revalidatePath("/achievements")
        revalidatePath("/dashboard")
        return { success: true, unlocked: toUnlockSlugs }
      }
    }

    return { success: true, unlocked: [] }
  } catch (err) {
    console.error("Error in checkAndAwardAchievementsAction", err)
    return { success: false, unlocked: [] }
  }
}
