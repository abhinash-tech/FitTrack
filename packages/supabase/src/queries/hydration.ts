import type { SupabaseClient } from "../client"
import type { HydrationEntry, HydrationGoal, HydrationReminder } from "@fittrack/types"
import { todayDate } from "@fittrack/utils"

// ─── Hydration Goal ───────────────────────────────────────────────────────────

export async function getActiveHydrationGoal(
  supabase: SupabaseClient,
  userId: string
): Promise<HydrationGoal | null> {
  const { data, error } = await supabase
    .from("hydration_goals")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (error) return null
  return data as HydrationGoal
}

export async function upsertHydrationGoal(
  supabase: SupabaseClient,
  userId: string,
  goalMl: number
): Promise<HydrationGoal | null> {
  // Deactivate existing goals
  await supabase
    .from("hydration_goals")
    .update({ is_active: false })
    .eq("user_id", userId)

  const { data, error } = await supabase
    .from("hydration_goals")
    .insert({ user_id: userId, goal_ml: goalMl, is_active: true })
    .select()
    .single()

  if (error) return null
  return data as HydrationGoal
}

// ─── Hydration Entries ────────────────────────────────────────────────────────

export async function getTodayHydrationEntries(
  supabase: SupabaseClient,
  userId: string,
  date?: string
): Promise<HydrationEntry[]> {
  const targetDate = date ?? todayDate()
  const { data, error } = await supabase
    .from("hydration_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("date", targetDate)
    .order("logged_at", { ascending: false })

  if (error) return []
  return (data ?? []) as HydrationEntry[]
}

export async function getHydrationEntriesForRange(
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
): Promise<HydrationEntry[]> {
  const { data, error } = await supabase
    .from("hydration_entries")
    .select("*")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("logged_at", { ascending: false })

  if (error) return []
  return (data ?? []) as HydrationEntry[]
}

export async function insertHydrationEntry(
  supabase: SupabaseClient,
  entry: Omit<HydrationEntry, "created_at">
): Promise<HydrationEntry | null> {
  const { data, error } = await supabase
    .from("hydration_entries")
    .insert(entry)
    .select()
    .single()

  if (error) return null
  return data as HydrationEntry
}

export async function deleteHydrationEntry(
  supabase: SupabaseClient,
  id: string,
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("hydration_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", userId) // extra safety check

  return !error
}

// ─── Hydration Reminders ──────────────────────────────────────────────────────

export async function getHydrationReminder(
  supabase: SupabaseClient,
  userId: string
): Promise<HydrationReminder | null> {
  const { data, error } = await supabase
    .from("hydration_reminders")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error) return null
  return data as HydrationReminder
}

export async function upsertHydrationReminder(
  supabase: SupabaseClient,
  reminder: Partial<HydrationReminder> & { user_id: string }
): Promise<HydrationReminder | null> {
  const { data, error } = await supabase
    .from("hydration_reminders")
    .upsert({ ...reminder, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
    .select()
    .single()

  if (error) return null
  return data as HydrationReminder
}
