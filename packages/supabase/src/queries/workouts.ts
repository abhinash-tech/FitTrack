import type { SupabaseClient } from "../client"
import type { WorkoutSession } from "@fittrack/types"
import { todayDate } from "@fittrack/utils"

export async function getTodayWorkouts(
  supabase: SupabaseClient,
  userId: string
): Promise<WorkoutSession[]> {
  const { data, error } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("date", todayDate())
    .order("created_at", { ascending: false })
  if (error) return []
  return (data ?? []) as WorkoutSession[]
}

export async function getWorkoutHistory(
  supabase: SupabaseClient,
  userId: string,
  limit = 30
): Promise<WorkoutSession[]> {
  const { data, error } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(limit)
  if (error) return []
  return (data ?? []) as WorkoutSession[]
}

export async function insertWorkoutSession(
  supabase: SupabaseClient,
  session: Omit<WorkoutSession, "created_at">
): Promise<WorkoutSession | null> {
  const { data, error } = await supabase
    .from("workout_sessions")
    .insert(session)
    .select()
    .single()
  if (error) return null
  return data as WorkoutSession
}

export async function deleteWorkoutSession(
  supabase: SupabaseClient,
  id: string,
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("workout_sessions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
  return !error
}
