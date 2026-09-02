"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Moon } from "lucide-react"

interface SleepSummaryCardProps {
  sleepHours: number
  sleepTargetHours: number
  qualityRating?: number // 1-5
}

export function SleepSummaryCard({
  sleepHours,
  sleepTargetHours,
  qualityRating = 4,
}: SleepSummaryCardProps) {
  const percent = Math.min(100, Math.round((sleepHours / sleepTargetHours) * 100))

  const getQualityBadge = () => {
    if (sleepHours >= 7 && sleepHours <= 9) return { label: "Optimal Sleep", variant: "success" as const }
    if (sleepHours >= 6) return { label: "Fair Rest", variant: "warning" as const }
    return { label: "Sleep Deficit", variant: "destructive" as const }
  }

  const badge = getQualityBadge()

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--secondary)/0.15)] flex items-center justify-center text-[hsl(var(--secondary))]">
              <Moon className="w-4 h-4" />
            </div>
            <CardTitle className="text-base">Sleep & Recovery</CardTitle>
          </div>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-3xl font-bold text-[hsl(var(--foreground))]">{sleepHours}</span>
            <span className="text-sm font-medium text-[hsl(var(--muted-foreground))] ml-1">/ {sleepTargetHours} hrs</span>
          </div>
          <span className="text-xs font-semibold text-[hsl(var(--secondary))]">{percent}% of target</span>
        </div>

        <Progress value={percent} variant="secondary" className="h-2.5" />
      </CardContent>
    </Card>
  )
}
