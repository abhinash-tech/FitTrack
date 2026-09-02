import type { SupabaseClient } from "../client"
import type { WeightEntry, BodyMeasurement } from "@fittrack/types"

export async function getWeightHistory(
  supabase: SupabaseClient,
  userId: string,
  limit = 60
): Promise<WeightEntry[]> {
  const { data, error } = await supabase
    .from("weight_entries")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(limit)
  if (error) return []
  return (data ?? []) as WeightEntry[]
}

export async function upsertWeightEntry(
  supabase: SupabaseClient,
  entry: Omit<WeightEntry, "created_at">
): Promise<WeightEntry | null> {
  const { data, error } = await supabase
    .from("weight_entries")
    .upsert(entry, { onConflict: "user_id,date" })
    .select()
    .single()
  if (error) return null
  return data as WeightEntry
}

export async function getBodyMeasurements(
  supabase: SupabaseClient,
  userId: string,
  limit = 30
): Promise<BodyMeasurement[]> {
  const { data, error } = await supabase
    .from("body_measurements")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(limit)
  if (error) return []
  return (data ?? []) as BodyMeasurement[]
}

export async function insertBodyMeasurement(
  supabase: SupabaseClient,
  measurement: Omit<BodyMeasurement, "created_at">
): Promise<BodyMeasurement | null> {
  const { data, error } = await supabase
    .from("body_measurements")
    .insert(measurement)
    .select()
    .single()
  if (error) return null
  return data as BodyMeasurement
}
