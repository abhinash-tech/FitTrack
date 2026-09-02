"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { calculateWellnessScore, explainWellnessScore, getScoreTier } from "@fittrack/business-logic"
import { Sparkles, Trophy, Info } from "lucide-react"

interface WellnessScoreCardProps {
  waterMl: number
  waterGoalMl: number
  caloriesConsumed: number
  caloriesGoal: number
  stepsTaken: number
  stepsGoal: number
  sleepMin: number
  sleepGoalMin: number
  workoutCompleted?: boolean
}

export function WellnessScoreCard({
  waterMl,
  waterGoalMl,
  caloriesConsumed,
  caloriesGoal,
  stepsTaken,
  stepsGoal,
  sleepMin,
  sleepGoalMin,
  workoutCompleted = false,
}: WellnessScoreCardProps) {
  const breakdown = calculateWellnessScore({
    waterMl,
    waterGoalMl,
    caloriesConsumed,
    caloriesGoal,
    stepsTaken,
    stepsGoal,
    sleepMin,
    sleepGoalMin,
    workoutCompleted,
    goalsCompletedCount: 0,
    goalsTotal: 0,
  })

  const score = breakdown.total
  const tier = getScoreTier(score)
  const explanations = explainWellnessScore(breakdown)

  return (
    <Card className="relative overflow-hidden border-[hsl(var(--primary)/0.3)] bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--background-surface-2))]">
      <div className="absolute top-0 right-0 p-6 opacity-10">
        <Sparkles className="w-32 h-32 text-[hsl(var(--primary))]" />
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary)/0.15)] flex items-center justify-center text-[hsl(var(--primary))]">
              <Trophy className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-lg">Daily Wellness Score</h3>
          </div>
          <Badge className="bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.3)]">
            {tier.emoji} {tier.label}
          </Badge>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center gap-6">
          {/* Score Gauge */}
          <div className="relative flex items-center justify-center w-32 h-32 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[hsl(var(--muted))]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[hsl(var(--primary))] transition-all duration-1000 ease-out"
                strokeDasharray={`${score}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">{score}</span>
              <span className="text-[10px] uppercase font-semibold text-[hsl(var(--muted-foreground))]">out of 100</span>
            </div>
          </div>

          {/* Key Insights / Explanations */}
          <div className="flex-1 space-y-3">
            <p className="text-sm font-medium text-[hsl(var(--foreground))]">Score Guidance:</p>
            <ul className="space-y-1.5 text-xs text-[hsl(var(--muted-foreground))]">
              {explanations.map((exp, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-[hsl(var(--primary))] shrink-0 mt-0.5" />
                  <span>{exp}</span>
                </li>
              ))}
            </ul>

            <Dialog>
              <DialogTrigger asChild>
                <button className="text-xs font-semibold text-[hsl(var(--primary))] hover:underline mt-2">
                  View Exact Calculation
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Wellness Score Calculation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-sm text-muted-foreground">
                    Your score is a weighted average of your daily health habits, up to a maximum of 100 points.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Hydration (Max 30pts)</span>
                        <span className="font-bold text-primary">+{breakdown.hydration}</span>
                      </div>
                      <Progress value={(breakdown.hydration / 30) * 100} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Activity / Steps (Max 20pts)</span>
                        <span className="font-bold text-primary">+{breakdown.activity}</span>
                      </div>
                      <Progress value={(breakdown.activity / 20) * 100} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Nutrition (Max 15pts)</span>
                        <span className="font-bold text-primary">+{breakdown.nutrition}</span>
                      </div>
                      <Progress value={(breakdown.nutrition / 15) * 100} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Sleep (Max 15pts)</span>
                        <span className="font-bold text-primary">+{breakdown.sleep}</span>
                      </div>
                      <Progress value={(breakdown.sleep / 15) * 100} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Workout Completed (Max 15pts)</span>
                        <span className="font-bold text-primary">+{breakdown.workout}</span>
                      </div>
                      <Progress value={(breakdown.workout / 15) * 100} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Goals Met (Max 5pts)</span>
                        <span className="font-bold text-primary">+{breakdown.goals}</span>
                      </div>
                      <Progress value={(breakdown.goals / 5) * 100} className="h-2" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex justify-between items-center">
                    <span className="font-bold text-lg">Total Score</span>
                    <span className="font-bold text-2xl text-primary">{score} / 100</span>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </Card>
  )
}
