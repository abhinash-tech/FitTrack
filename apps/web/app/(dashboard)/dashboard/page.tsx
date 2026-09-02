import type { Metadata } from "next"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { todayDate } from "@fittrack/utils"
import { DashboardClient } from "./dashboard-client"

export const metadata: Metadata = {
  title: "Dashboard | FitTrack",
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile?.onboarding_done) {
    redirect("/onboarding")
  }

  const today = todayDate()

  // Fetch today's hydration entries
  const { data: hydrationEntries } = await supabase
    .from("hydration_entries")
    .select("amount_ml")
    .eq("user_id", user.id)
    .eq("date", today)

  const totalWaterMl = hydrationEntries?.reduce((acc, curr) => acc + curr.amount_ml, 0) || 0

  // Fetch today's goals
  const { data: goals } = await supabase
    .from("goals")
    .select("metric, target_value")
    .eq("user_id", user.id)

  const goalsMap: Record<string, number> = {}
  goals?.forEach((g) => {
    goalsMap[g.metric] = Number(g.target_value)
  })

  // Fetch today's nutrition entries
  const { data: nutritionEntries } = await supabase
    .from("nutrition_entries")
    .select("calories, protein_g, carbs_g, fat_g")
    .eq("user_id", user.id)
    .eq("date", today)

  const currentCalories = nutritionEntries?.reduce((acc, curr) => acc + curr.calories, 0) || 0
  const proteinGrams = nutritionEntries?.reduce((acc, curr) => acc + (Number(curr.protein_g) || 0), 0) || 0
  const carbsGrams = nutritionEntries?.reduce((acc, curr) => acc + (Number(curr.carbs_g) || 0), 0) || 0
  const fatGrams = nutritionEntries?.reduce((acc, curr) => acc + (Number(curr.fat_g) || 0), 0) || 0

  // Fetch today's workout sessions
  const { data: workouts } = await supabase
    .from("workout_sessions")
    .select("duration_minutes, calories_burned")
    .eq("user_id", user.id)
    .eq("date", today)

  const workoutMinutes = workouts?.reduce((acc, curr) => acc + curr.duration_minutes, 0) || 0
  const workoutCalories = workouts?.reduce((acc, curr) => acc + (curr.calories_burned || 0), 0) || 0

  // Fetch sleep entries
  const { data: sleepEntries } = await supabase
    .from("sleep_logs")
    .select("duration_minutes, quality_rating")
    .eq("user_id", user.id)
    .eq("date", today)
    .single()

  const sleepHours = sleepEntries ? Math.round((sleepEntries.duration_minutes / 60) * 10) / 10 : 0

  return (
    <DashboardClient
      userName={profile.name || "User"}
      userId={user.id}
      today={today}
      initialHydrationMl={totalWaterMl}
      waterGoalMl={goalsMap["water_ml"] || 2500}
      calorieGoal={goalsMap["calories"] || 2000}
      stepGoal={goalsMap["steps"] || 8000}
      sleepGoalHours={goalsMap["sleep_hours"] || 8}
      initialCalories={currentCalories}
      initialProtein={proteinGrams}
      initialCarbs={carbsGrams}
      initialFat={fatGrams}
      initialWorkoutMins={workoutMinutes}
      initialWorkoutCalories={workoutCalories}
      initialSleepHours={sleepHours}
      sleepQuality={sleepEntries?.quality_rating || 4}
    />
  )
}
