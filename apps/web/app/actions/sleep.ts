"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { SleepEntryInput } from "@fittrack/validation"
import { format, subDays } from "date-fns"
import type { SleepEntry } from "@fittrack/types"
import { generateId } from "@fittrack/utils"

export async function logSleepEntry(
  data: SleepEntryInput
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { error } = await supabase.from("sleep_entries").insert({
      id: generateId(),
      user_id: user.id,
      bedtime: data.bedtime,
      wake_time: data.wake_time,
      quality: data.quality ?? null,
      notes: data.notes ?? null,
      date: data.date,
    })

    if (error) throw error
    revalidatePath("/sleep")
    revalidatePath("/dashboard")
    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.message ?? "Failed to log sleep" }
  }
}

export async function deleteSleepEntry(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { error } = await supabase
      .from("sleep_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) throw error
    revalidatePath("/sleep")
    revalidatePath("/dashboard")
    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.message ?? "Failed to delete entry" }
  }
}

export async function getSleepDashboardData(): Promise<{
  entries: SleepEntry[]
  sleepGoalHours: number
}> {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { entries: [], sleepGoalHours: 8 }

    const startDate = format(subDays(new Date(), 13), "yyyy-MM-dd")
    const [entriesRes, goalsRes] = await Promise.all([
      supabase
        .from("sleep_entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .order("date", { ascending: false }),
      supabase
        .from("goals")
        .select("target_value")
        .eq("user_id", user.id)
        .eq("type", "sleep")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle(),
    ])

    const sleepGoalHours = (goalsRes.data?.target_value ?? 480) / 60
    return {
      entries: (entriesRes.data ?? []) as SleepEntry[],
      sleepGoalHours,
    }
  } catch {
    return { entries: [], sleepGoalHours: 8 }
  }
}
