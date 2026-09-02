import type { SupabaseClient } from "../client"
import type { Profile } from "@fittrack/types"

export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (error) return null
  return data as Profile
}

export async function upsertProfile(
  supabase: SupabaseClient,
  profile: Partial<Profile> & { id: string }
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ ...profile, updated_at: new Date().toISOString() })
    .select()
    .single()

  if (error) return null
  return data as Profile
}

export async function markOnboardingComplete(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_done: true, updated_at: new Date().toISOString() })
    .eq("id", userId)
  return !error
}
