"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dumbbell, Plus, Flame, Clock, Trash2 } from "lucide-react"
import { formatTime } from "@fittrack/utils"
import { toast } from "sonner"

export interface WorkoutItem {
  id: string
  category: string
  exerciseName: string
  durationMinutes: number
  caloriesBurned: number
  created_at: string
}

interface WorkoutLoggerProps {
  logs: WorkoutItem[]
  onLogWorkout: (data: { category: string; exerciseName: string; durationMinutes: number; caloriesBurned: number }) => Promise<void>
  onDeleteWorkout: (id: string) => Promise<void>
}

const CATEGORIES = [
  { id: "full_body", label: "Full Body 🏋️" },
  { id: "beginner", label: "Home Cardio 🏃" },
  { id: "abs", label: "Abs & Core 🍫" },
  { id: "arms", label: "Arms & Upper 🦾" },
  { id: "legs", label: "Legs & Glutes 🦵" },
]

export function WorkoutLogger({ logs, onLogWorkout, onDeleteWorkout }: WorkoutLoggerProps) {
  const [category, setCategory] = useState("full_body")
  const [exerciseName, setExerciseName] = useState("")
  const [durationMinutes, setDurationMinutes] = useState("30")
  const [caloriesBurned, setCaloriesBurned] = useState("220")
  const [logging, setLogging] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!exerciseName.trim()) {
      toast.error("Please enter an exercise or workout name")
      return
    }

    setLogging(true)
    try {
      await onLogWorkout({
        category,
        exerciseName: exerciseName.trim(),
        durationMinutes: parseInt(durationMinutes, 10) || 30,
        caloriesBurned: parseInt(caloriesBurned, 10) || 150,
      })
      toast.success("Workout session logged! 💪")
      setExerciseName("")
    } catch (err: any) {
      toast.error(err.message || "Failed to log workout")
    } finally {
      setLogging(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await onDeleteWorkout(id)
      toast.success("Workout log deleted")
    } catch (err: any) {
      toast.error(err.message || "Failed to delete workout")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Log Form Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary)/0.15)] flex items-center justify-center text-[hsl(var(--primary))]">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base">Log Workout Session</CardTitle>
              <CardDescription className="text-xs">Record home workouts, gym sessions, or bodyweight exercises</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Selector */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      category === cat.id
                        ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]"
                        : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/0.3)]"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise Name */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Exercise Name / Description</label>
              <Input
                placeholder="e.g. Bodyweight Squats & Pushups"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* Duration & Calories */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Duration (mins)</label>
                <Input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Calories Burned (kcal)</label>
                <Input
                  type="number"
                  value={caloriesBurned}
                  onChange={(e) => setCaloriesBurned(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <Button type="submit" loading={logging} className="w-full">
              <Plus className="w-4 h-4 mr-1.5" /> Log Workout
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* History Log Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Today's Workouts</CardTitle>
          <CardDescription className="text-xs">Logged training sessions for today</CardDescription>
        </CardHeader>

        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-xs text-[hsl(var(--muted-foreground))]">
              No workouts logged today yet. Get moving and record a session above! 🏋️
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background-surface))]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary)/0.15)] flex items-center justify-center text-[hsl(var(--primary))]">
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                        {item.exerciseName}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">
                        <span className="capitalize">{item.category.replace("_", " ")}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{item.durationMinutes} mins</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1 text-[hsl(var(--primary))]">
                          <Flame className="w-3 h-3" />
                          <span>{item.caloriesBurned} kcal</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    loading={deletingId === item.id}
                    disabled={deletingId !== null}
                    onClick={() => handleDelete(item.id)}
                    className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--error))]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
