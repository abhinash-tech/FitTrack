import type { Metadata } from "next"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { todayDate } from "@fittrack/utils"
import { HydrationClient } from "./hydration-client"

export const metadata: Metadata = {
  title: "Hydration Tracker | FitTrack",
}

export default async function HydrationPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const today = todayDate()

  // Fetch today's entries
  const { data: entries } = await supabase
    .from("hydration_entries")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .order("created_at", { ascending: false })

  // Fetch water goal
  const { data: goalData } = await supabase
    .from("goals")
    .select("target_value")
    .eq("user_id", user.id)
    .eq("metric", "water_ml")
    .maybeSingle()

  const targetMl = goalData ? Number(goalData.target_value) : 2500

  // Fetch reminder settings
  const { data: reminderData } = await supabase
    .from("hydration_reminders")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  return (
    <HydrationClient
      userId={user.id}
      today={today}
      targetMl={targetMl}
      initialEntries={entries || []}
      initialReminderSettings={
        reminderData
          ? {
              enabled: reminderData.enabled,
              startTime: reminderData.start_time,
              endTime: reminderData.end_time,
              intervalMinutes: reminderData.interval_minutes,
              smartMode: reminderData.smart_mode,
            }
          : undefined
      }
    />
  )
}
