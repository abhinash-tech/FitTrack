"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, Sparkles, Loader2 } from "lucide-react"
import { generateDailyInsights, calculateWellnessScore } from "@fittrack/business-logic"
import { generateDailyCoachTipAction } from "@/app/actions/coach"

interface InsightsCardProps {
  hydrationMl: number
  waterGoalMl: number
  calories: number
  calorieGoal: number
  stepCount: number
  stepGoal: number
  sleepHours: number
  sleepGoalHours: number
}

export function InsightsCard(props: InsightsCardProps) {
  const [aiTip, setAiTip] = useState<string | null>(null)
  const [loadingAi, setLoadingAi] = useState(true)

  useEffect(() => {
    let mounted = true
    const fetchTip = async () => {
      const { tip } = await generateDailyCoachTipAction()
      if (mounted && tip) {
        setAiTip(tip)
      }
      if (mounted) setLoadingAi(false)
    }
    fetchTip()
    return () => { mounted = false }
  }, [])

  const breakdown = calculateWellnessScore({
    waterMl: props.hydrationMl,
    waterGoalMl: props.waterGoalMl,
    caloriesConsumed: props.calories,
    caloriesGoal: props.calorieGoal,
    stepsTaken: props.stepCount,
    stepsGoal: props.stepGoal,
    sleepMin: props.sleepHours * 60,
    sleepGoalMin: props.sleepGoalHours * 60,
    workoutCompleted: false,
    goalsCompletedCount: 0,
    goalsTotal: 0,
  })

  const insights = generateDailyInsights(
    {
      water_ml: props.hydrationMl,
      steps: props.stepCount,
      sleep_min: props.sleepHours * 60,
    },
    breakdown,
    {},
    1, // hydration streak default
    1  // workout streak default
  )

  return (
    <Card className="border-[hsl(var(--primary)/0.2)] bg-gradient-to-r from-[hsl(var(--card))] to-[hsl(var(--primary)/0.05)]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary)/0.15)] flex items-center justify-center text-[hsl(var(--primary))]">
            <Lightbulb className="w-4 h-4" />
          </div>
          <CardTitle className="text-base">Daily Smart Insights</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* AI Coach Block */}
          <div className="flex items-start gap-3 p-4 rounded-xl border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.05)] text-sm">
            <span className="text-xl shrink-0 mt-0.5"><Sparkles className="w-5 h-5 text-[hsl(var(--primary))]" /></span>
            <div className="flex-1">
              <p className="font-bold text-[hsl(var(--primary))] mb-1 flex items-center gap-2">
                AI Coach
                {loadingAi && <Loader2 className="w-3 h-3 animate-spin" />}
              </p>
              <p className="text-[hsl(var(--foreground))] leading-relaxed font-medium">
                {loadingAi ? "Analyzing your day..." : (aiTip || "Keep up the great work! Consistency is key.")}
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="flex items-start gap-3 p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background-surface)/0.6)] text-xs text-[hsl(var(--foreground))]"
              >
                <span className="text-base shrink-0">{insight.icon}</span>
                <div className="flex-1">
                  <p className="text-[hsl(var(--foreground))]">{insight.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
