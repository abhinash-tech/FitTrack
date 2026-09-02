"use client"

import { useState } from "react"
import { WellnessScoreCard } from "@/components/dashboard/wellness-score-card"
import { HydrationQuickCard } from "@/components/dashboard/hydration-quick-card"
import { NutritionSummaryCard } from "@/components/dashboard/nutrition-summary-card"
import { FitnessSummaryCard } from "@/components/dashboard/fitness-summary-card"
import { SleepSummaryCard } from "@/components/dashboard/sleep-summary-card"
import { SouthIndianQuickAdd } from "@/components/dashboard/south-indian-quick-add"
import { InsightsCard } from "@/components/dashboard/insights-card"
import { getSupabaseBrowserClient } from "@/lib/supabase/browser"
import { generateId } from "@fittrack/utils"
import { AchievementChecker } from "@/components/achievements/achievement-checker"

interface DashboardClientProps {
  userName: string
  userId: string
  today: string
  initialHydrationMl: number
  waterGoalMl: number
  calorieGoal: number
  stepGoal: number
  sleepGoalHours: number
  initialCalories: number
  initialProtein: number
  initialCarbs: number
  initialFat: number
  initialWorkoutMins: number
  initialWorkoutCalories: number
  initialSleepHours: number
  sleepQuality: number
}

export function DashboardClient(props: DashboardClientProps) {
  const [hydrationMl, setHydrationMl] = useState(props.initialHydrationMl)
  const [calories, setCalories] = useState(props.initialCalories)
  const [protein, setProtein] = useState(props.initialProtein)
  const [carbs, setCarbs] = useState(props.initialCarbs)
  const [fat, setFat] = useState(props.initialFat)

  const supabase = getSupabaseBrowserClient()

  // Calculate percentages for Wellness Score
  const hydrationPercent = Math.min(100, Math.round((hydrationMl / props.waterGoalMl) * 100))
  const nutritionPercent = Math.min(100, Math.round((calories / props.calorieGoal) * 100))
  const workoutPercent = Math.min(100, Math.round((props.initialWorkoutMins / 30) * 100)) // 30 min daily target
  const sleepPercent = Math.min(100, Math.round((props.initialSleepHours / props.sleepGoalHours) * 100))

  const handleLogWater = async (amountMl: number) => {
    // Optimistic Update
    setHydrationMl((prev) => prev + amountMl)

    const { error } = await supabase.from("hydration_entries").insert({
      id: generateId(),
      user_id: props.userId,
      amount_ml: amountMl,
      date: props.today,
      source: "quick_add",
    })

    if (error) {
      // Rollback on error
      setHydrationMl((prev) => prev - amountMl)
      throw error
    }
  }

  const handleLogSouthIndianFood = async (food: any) => {
    // Optimistic Update
    setCalories((prev) => prev + food.calories)
    setProtein((prev) => prev + food.protein)
    setCarbs((prev) => prev + food.carbs)
    setFat((prev) => prev + food.fat)

    const { error } = await supabase.from("nutrition_entries").insert({
      id: generateId(),
      user_id: props.userId,
      meal_type: "snack",
      food_name: food.name,
      portion: food.portion,
      calories: food.calories,
      protein_g: food.protein,
      carbs_g: food.carbs,
      fat_g: food.fat,
      date: props.today,
      is_indian_food: true,
    })

    if (error) {
      // Rollback on error
      setCalories((prev) => prev - food.calories)
      setProtein((prev) => prev - food.protein)
      setCarbs((prev) => prev - food.carbs)
      setFat((prev) => prev - food.fat)
      throw error
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <AchievementChecker />
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Hello, {props.userName} 👋
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Here is your daily health and wellness overview for today.
          </p>
        </div>
      </div>

      {/* Wellness Score Card */}
      <WellnessScoreCard
        waterMl={hydrationMl}
        waterGoalMl={props.waterGoalMl}
        caloriesConsumed={calories}
        caloriesGoal={props.calorieGoal}
        stepsTaken={0}
        stepsGoal={props.stepGoal}
        sleepMin={props.initialSleepHours * 60}
        sleepGoalMin={props.sleepGoalHours * 60}
      />

      {/* Smart Daily Insights */}
      <InsightsCard
        hydrationMl={hydrationMl}
        waterGoalMl={props.waterGoalMl}
        calories={calories}
        calorieGoal={props.calorieGoal}
        stepCount={0}
        stepGoal={props.stepGoal}
        sleepHours={props.initialSleepHours}
        sleepGoalHours={props.sleepGoalHours}
      />

      {/* Main Grid: Hydration & South Indian Quick Add */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HydrationQuickCard
          currentMl={hydrationMl}
          targetMl={props.waterGoalMl}
          streakDays={1}
          onLogWater={handleLogWater}
        />

        <SouthIndianQuickAdd onLogFood={handleLogSouthIndianFood} />
      </div>

      {/* Secondary Grid: Nutrition, Movement & Sleep */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NutritionSummaryCard
          currentCalories={calories}
          targetCalories={props.calorieGoal}
          proteinGrams={protein}
          carbsGrams={carbs}
          fatGrams={fat}
        />

        <FitnessSummaryCard
          stepCount={0}
          stepGoal={props.stepGoal}
          workoutMinutes={props.initialWorkoutMins}
          workoutCaloriesBurned={props.initialWorkoutCalories}
        />

        <SleepSummaryCard
          sleepHours={props.initialSleepHours}
          sleepTargetHours={props.sleepGoalHours}
          qualityRating={props.sleepQuality}
        />
      </div>
    </div>
  )
}
