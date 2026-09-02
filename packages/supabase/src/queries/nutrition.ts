import type { SupabaseClient } from "../client"
import type { NutritionEntry, Food } from "@fittrack/types"
import { todayDate } from "@fittrack/utils"

export async function getTodayNutritionEntries(
  supabase: SupabaseClient,
  userId: string,
  date?: string
): Promise<NutritionEntry[]> {
  const { data, error } = await supabase
    .from("nutrition_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date ?? todayDate())
    .order("logged_at", { ascending: false })
  if (error) return []
  return (data ?? []) as NutritionEntry[]
}

export async function insertNutritionEntry(
  supabase: SupabaseClient,
  entry: Omit<NutritionEntry, "created_at">
): Promise<NutritionEntry | null> {
  const { data, error } = await supabase
    .from("nutrition_entries")
    .insert(entry)
    .select()
    .single()
  if (error) return null
  return data as NutritionEntry
}

export async function deleteNutritionEntry(
  supabase: SupabaseClient,
  id: string,
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("nutrition_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
  return !error
}

export async function searchFoods(
  supabase: SupabaseClient,
  query: string,
  limit = 20
): Promise<Food[]> {
  const { data, error } = await supabase
    .from("foods")
    .select("*")
    .or(`name.ilike.%${query}%,name_local.ilike.%${query}%`)
    .order("is_indian", { ascending: false })
    .order("verified", { ascending: false })
    .limit(limit)
  if (error) return []
  return (data ?? []) as Food[]
}
