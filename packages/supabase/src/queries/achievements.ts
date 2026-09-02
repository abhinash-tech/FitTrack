import type { SupabaseClient } from "../client"
import type { Achievement, UserAchievement } from "@fittrack/types"

export async function getAllAchievements(supabase: SupabaseClient): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .order("points", { ascending: true })
  
  if (error) {
    console.error("Error fetching achievements", error)
    return []
  }
  return (data ?? []) as Achievement[]
}

export async function getUserAchievements(
  supabase: SupabaseClient,
  userId: string
): Promise<UserAchievement[]> {
  const { data, error } = await supabase
    .from("user_achievements")
    .select("*, achievement:achievements(*)")
    .eq("user_id", userId)
    .order("earned_at", { ascending: false })
  
  if (error) {
    console.error("Error fetching user achievements", error)
    return []
  }
  return (data ?? []) as UserAchievement[]
}

export async function awardAchievements(
  supabase: SupabaseClient,
  userId: string,
  achievementIds: string[]
): Promise<boolean> {
  if (achievementIds.length === 0) return true

  const inserts = achievementIds.map(id => ({
    user_id: userId,
    achievement_id: id,
  }))

  const { error } = await supabase
    .from("user_achievements")
    .upsert(inserts, { onConflict: "user_id,achievement_id" })

  if (error) {
    console.error("Error awarding achievements", error)
    return false
  }
  return true
}
