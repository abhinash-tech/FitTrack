import type { SupabaseClient } from "../client"
import type { DailyStat } from "@fittrack/types"
import { todayDate } from "@fittrack/utils"

export async function getTodayStats(
  supabase: SupabaseClient,
  userId: string
): Promise<DailyStat | null> {
  const { data, error } = await supabase
    .from("daily_stats")
    .select("*")
    .eq("user_id", userId)
    .eq("date", todayDate())
    .single()
  if (error) return null
  return data as DailyStat
}

export async function upsertDailyStat(
  supabase: SupabaseClient,
  stat: Partial<DailyStat> & { user_id: string; date: string }
): Promise<DailyStat | null> {
  const { data, error } = await supabase
    .from("daily_stats")
    .upsert({ ...stat, updated_at: new Date().toISOString() }, { onConflict: "user_id,date" })
    .select()
    .single()
  if (error) return null
  return data as DailyStat
}

export async function getDailyStatsRange(
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
): Promise<DailyStat[]> {
  const { data, error } = await supabase
    .from("daily_stats")
    .select("*")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true })
  if (error) return []
  return (data ?? []) as DailyStat[]
}

export async function getDailyStatsHistory(
  supabase: SupabaseClient,
  userId: string,
  limit: number = 100
): Promise<DailyStat[]> {
  const { data, error } = await supabase
    .from("daily_stats")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(limit)
  
  if (error) return []
  return (data ?? []) as DailyStat[]
}
