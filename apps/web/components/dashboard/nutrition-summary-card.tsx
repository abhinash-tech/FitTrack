"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Flame, PieChart } from "lucide-react"

interface NutritionSummaryCardProps {
  currentCalories: number
  targetCalories: number
  proteinGrams: number
  carbsGrams: number
  fatGrams: number
}

export function NutritionSummaryCard({
  currentCalories,
  targetCalories,
  proteinGrams,
  carbsGrams,
  fatGrams,
}: NutritionSummaryCardProps) {
  const calPercent = Math.min(100, Math.round((currentCalories / targetCalories) * 100))

  // Recommended baseline split: 30% Protein, 50% Carbs, 20% Fat
  const targetProtein = Math.round((targetCalories * 0.3) / 4)
  const targetCarbs = Math.round((targetCalories * 0.5) / 4)
  const targetFat = Math.round((targetCalories * 0.2) / 9)

  const proteinPercent = Math.min(100, Math.round((proteinGrams / (targetProtein || 1)) * 100))
  const carbsPercent = Math.min(100, Math.round((carbsGrams / (targetCarbs || 1)) * 100))
  const fatPercent = Math.min(100, Math.round((fatGrams / (targetFat || 1)) * 100))

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--warning)/0.15)] flex items-center justify-center text-[hsl(var(--warning))]">
              <Flame className="w-4 h-4" />
            </div>
            <CardTitle className="text-base">Nutrition & Calories</CardTitle>
          </div>
          <span className="text-xs font-semibold text-[hsl(var(--warning))]">
            {currentCalories} / {targetCalories} kcal
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Calorie Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
            <span>Energy Consumed</span>
            <span>{calPercent}%</span>
          </div>
          <Progress value={calPercent} variant="warning" className="h-2.5" />
        </div>

        {/* Macro Breakdown Grid */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {/* Protein */}
          <div className="p-2.5 rounded-xl bg-[hsl(var(--background-surface))] border border-[hsl(var(--border))] space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[hsl(var(--secondary))]">Protein</span>
              <span className="text-[hsl(var(--muted-foreground))]">{proteinGrams}g</span>
            </div>
            <Progress value={proteinPercent} variant="secondary" className="h-1.5" />
            <p className="text-[10px] text-[hsl(var(--muted-foreground))] text-right">Target {targetProtein}g</p>
          </div>

          {/* Carbs */}
          <div className="p-2.5 rounded-xl bg-[hsl(var(--background-surface))] border border-[hsl(var(--border))] space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[hsl(var(--warning))]">Carbs</span>
              <span className="text-[hsl(var(--muted-foreground))]">{carbsGrams}g</span>
            </div>
            <Progress value={carbsPercent} variant="warning" className="h-1.5" />
            <p className="text-[10px] text-[hsl(var(--muted-foreground))] text-right">Target {targetCarbs}g</p>
          </div>

          {/* Fat */}
          <div className="p-2.5 rounded-xl bg-[hsl(var(--background-surface))] border border-[hsl(var(--border))] space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[hsl(var(--error))]">Fat</span>
              <span className="text-[hsl(var(--muted-foreground))]">{fatGrams}g</span>
            </div>
            <Progress value={fatPercent} variant="error" className="h-1.5" />
            <p className="text-[10px] text-[hsl(var(--muted-foreground))] text-right">Target {targetFat}g</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
