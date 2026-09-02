import type { Metadata } from "next"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { todayDate } from "@fittrack/utils"
import { FitnessClient } from "./fitness-client"

export const metadata: Metadata = {
  title: "Fitness & Workouts | FitTrack",
}

export default async function FitnessPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const today = todayDate()

  // Fetch today's workout sessions
  const { data: workouts } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .order("created_at", { ascending: false })

  return (
    <FitnessClient
      userId={user.id}
      today={today}
      initialWorkouts={workouts || []}
    />
  )
}
