import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSleepHygieneInsights } from "@fittrack/business-logic"
import { Lightbulb } from "lucide-react"

interface SleepInsightsCardProps {
  avgHours: number
  avgQuality: number
  targetHours: number
}

export function SleepInsightsCard({ avgHours, avgQuality, targetHours }: SleepInsightsCardProps) {
  const insights = getSleepHygieneInsights(avgHours, avgQuality, targetHours)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-400" />
          Sleep Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        {insights.map((insight, i) => (
          <div
            key={i}
            className="flex gap-3 p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background-surface)/0.4)]"
          >
            <span className="text-xl shrink-0 mt-0.5">{insight.icon}</span>
            <div>
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{insight.title}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 leading-relaxed">
                {insight.tip}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
