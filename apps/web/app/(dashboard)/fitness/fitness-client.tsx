"use client"

import { useState } from "react"
import { WorkoutLogger, type WorkoutItem } from "@/components/fitness/workout-logger"
import { CardioCalculator } from "@/components/fitness/cardio-calculator"
import { getSupabaseBrowserClient } from "@/lib/supabase/browser"
import { generateId } from "@fittrack/utils"

interface FitnessClientProps {
  userId: string
  today: string
  initialWorkouts: any[]
}

export function FitnessClient({ userId, today, initialWorkouts }: FitnessClientProps) {
  const [workouts, setWorkouts] = useState<WorkoutItem[]>(
    initialWorkouts.map((w) => ({
      id: w.id,
      category: w.category || "full_body",
      exerciseName: w.name || w.notes || "Workout Session",
      durationMinutes: w.duration_minutes || 30,
      caloriesBurned: w.calories_burned || 150,
      created_at: w.created_at,
    }))
  )

  const supabase = getSupabaseBrowserClient()

  const handleLogWorkout = async (data: {
    category: string
    exerciseName: string
    durationMinutes: number
    caloriesBurned: number
  }) => {
    const newLog: WorkoutItem = {
      id: generateId(),
      category: data.category,
      exerciseName: data.exerciseName,
      durationMinutes: data.durationMinutes,
      caloriesBurned: data.caloriesBurned,
      created_at: new Date().toISOString(),
    }

    setWorkouts((prev) => [newLog, ...prev])

    const { error } = await supabase.from("workout_sessions").insert({
      id: newLog.id,
      user_id: userId,
      category: data.category,
      name: data.exerciseName,
      duration_minutes: data.durationMinutes,
      calories_burned: data.caloriesBurned,
      date: today,
    })

    if (error) {
      setWorkouts((prev) => prev.filter((w) => w.id !== newLog.id))
      throw error
    }
  }

  const handleDeleteWorkout = async (id: string) => {
    const originalWorkouts = [...workouts]
    setWorkouts((prev) => prev.filter((w) => w.id !== id))

    const { error } = await supabase.from("workout_sessions").delete().eq("id", id)

    if (error) {
      setWorkouts(originalWorkouts)
      throw error
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Fitness & Workouts 🏋️</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Log your daily exercises, track cardio pace, and stay active.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WorkoutLogger
            logs={workouts}
            onLogWorkout={handleLogWorkout}
            onDeleteWorkout={handleDeleteWorkout}
          />
        </div>

        <div>
          <CardioCalculator />
        </div>
      </div>
    </div>
  )
}
