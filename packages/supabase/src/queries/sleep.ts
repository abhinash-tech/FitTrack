import type { SupabaseClient } from "../client"
import type { SleepEntry } from "@fittrack/types"

export async function getRecentSleepEntries(
  supabase: SupabaseClient,
  userId: string,
  limit = 30
): Promise<SleepEntry[]> {
  const { data, error } = await supabase
    .from("sleep_entries")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(limit)
  if (error) return []
  return (data ?? []) as SleepEntry[]
}

export async function insertSleepEntry(
  supabase: SupabaseClient,
  entry: Omit<SleepEntry, "created_at" | "duration_min">
): Promise<SleepEntry | null> {
  const { data, error } = await supabase
    .from("sleep_entries")
    .insert(entry)
    .select()
    .single()
  if (error) return null
  return data as SleepEntry
}

export async function deleteSleepEntry(
  supabase: SupabaseClient,
  id: string
): Promise<boolean> {
  const { error } = await supabase
    .from("sleep_entries")
    .delete()
    .eq("id", id)
  return !error
}

export async function getWeeklySleepSummary(
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
): Promise<SleepEntry[]> {
  const { data, error } = await supabase
    .from("sleep_entries")
    .select("*")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false })
  if (error) return []
  return (data ?? []) as SleepEntry[]
}
