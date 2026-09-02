import type { SupabaseClient } from "../client"
import type { Goal } from "@fittrack/types"

export async function getActiveGoals(
  supabase: SupabaseClient,
  userId: string
): Promise<Goal[]> {
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
  if (error) return []
  return (data ?? []) as Goal[]
}

export async function insertGoal(
  supabase: SupabaseClient,
  goal: Omit<Goal, "created_at" | "updated_at" | "current_value">
): Promise<Goal | null> {
  const { data, error } = await supabase
    .from("goals")
    .insert({ ...goal, current_value: 0 })
    .select()
    .single()
  if (error) return null
  return data as Goal
}

export async function updateGoalProgress(
  supabase: SupabaseClient,
  id: string,
  userId: string,
  currentValue: number
): Promise<boolean> {
  const { error } = await supabase
    .from("goals")
    .update({ current_value: currentValue, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
  return !error
}

export async function deactivateGoal(
  supabase: SupabaseClient,
  id: string,
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("goals")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
  return !error
}
