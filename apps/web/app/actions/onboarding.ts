"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { OnboardingSchema, type OnboardingInput } from "@fittrack/validation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { 
  calculateBMR, 
  calculateDailyCalorieTarget, 
  recommendWaterIntake, 
  todayDate 
} from "@fittrack/utils"

export async function submitOnboarding(data: OnboardingInput) {
  const supabase = await createSupabaseServerClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error("Unauthorized")
  }

  const parsed = OnboardingSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error("Invalid onboarding data")
  }

  const { name, age, height_cm, weight_kg, goal_type, activity_level, unit_system, step_goal, sleep_goal_hours } = parsed.data

  // Calculate smart defaults if the user provided metrics
  let waterGoalMl = parsed.data.daily_water_goal_ml
  let calorieGoal = parsed.data.calorie_goal

  if (weight_kg && age && height_cm && activity_level && goal_type) {
    const bmr = calculateBMR(weight_kg, height_cm, age, "male") // default gender, or we can assume average
    const target = calculateDailyCalorieTarget(bmr, activity_level as any)
    if (!calorieGoal) calorieGoal = target
    
    // Adjust water based on weight and activity
    const recommendedWater = recommendWaterIntake(weight_kg, activity_level as any)
    if (waterGoalMl === 2500 && recommendedWater) {
      waterGoalMl = recommendedWater
    }
  }

  // 1. Update Profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      name,
      age,
      height_cm,
      weight_kg,
      goal_type,
      activity_level,
      unit_system,
      onboarding_done: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (profileError) {
    throw new Error(`Failed to update profile: ${profileError.message}`)
  }

  // 2. Setup Goals
  const dateStr = todayDate()
  
  const { error: goalError } = await supabase
    .from("goals")
    .insert([
      { user_id: user.id, type: "water_ml", title: "Daily Hydration", target_value: waterGoalMl, unit: "ml" },
      { user_id: user.id, type: "calories", title: "Daily Calories", target_value: calorieGoal ?? 2000, unit: "kcal" },
      { user_id: user.id, type: "steps", title: "Daily Steps", target_value: step_goal, unit: "steps" },
      { user_id: user.id, type: "sleep_hours", title: "Daily Sleep", target_value: sleep_goal_hours, unit: "hours" },
    ])

  if (goalError) {
    throw new Error(`Failed to set goals: ${goalError.message}`)
  }

  revalidatePath("/dashboard")
  redirect("/dashboard")
}
