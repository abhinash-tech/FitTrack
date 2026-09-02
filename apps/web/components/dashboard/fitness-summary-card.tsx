"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Dumbbell, Footprints } from "lucide-react"

interface FitnessSummaryCardProps {
  stepCount: number
  stepGoal: number
  workoutMinutes: number
  workoutCaloriesBurned: number
}

export function FitnessSummaryCard({
  stepCount,
  stepGoal,
  workoutMinutes,
  workoutCaloriesBurned,
}: FitnessSummaryCardProps) {
  const stepPercent = Math.min(100, Math.round((stepCount / stepGoal) * 100))

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary)/0.15)] flex items-center justify-center text-[hsl(var(--primary))]">
            <Dumbbell className="w-4 h-4" />
          </div>
          <CardTitle className="text-base">Movement & Steps</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Step Progress */}
        <div className="p-3 rounded-xl bg-[hsl(var(--background-surface))] border border-[hsl(var(--border))] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Footprints className="w-4 h-4 text-[hsl(var(--primary))]" />
              <span className="text-xs font-semibold">Daily Steps</span>
            </div>
            <span className="text-xs font-bold text-[hsl(var(--foreground))]">
              {stepCount.toLocaleString()} / {stepGoal.toLocaleString()}
            </span>
          </div>
          <Progress value={stepPercent} className="h-2" />
        </div>

        {/* Workout Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-[hsl(var(--background-surface))] border border-[hsl(var(--border))]">
            <p className="text-[10px] uppercase font-semibold text-[hsl(var(--muted-foreground))]">Active Duration</p>
            <p className="text-xl font-bold text-[hsl(var(--foreground))] mt-0.5">{workoutMinutes} <span className="text-xs font-normal text-[hsl(var(--muted-foreground))]">mins</span></p>
          </div>
          <div className="p-3 rounded-xl bg-[hsl(var(--background-surface))] border border-[hsl(var(--border))]">
            <p className="text-[10px] uppercase font-semibold text-[hsl(var(--muted-foreground))]">Active Burn</p>
            <p className="text-xl font-bold text-[hsl(var(--primary))] mt-0.5">{workoutCaloriesBurned} <span className="text-xs font-normal text-[hsl(var(--muted-foreground))]">kcal</span></p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
