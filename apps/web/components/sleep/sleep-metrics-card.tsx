import { Moon, Star, TrendingDown, TrendingUp, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { SleepAverages, SleepDebtResult } from "@fittrack/business-logic"
import { cn } from "@/lib/cn"

interface SleepMetricsCardProps {
  averages: SleepAverages
  debt: SleepDebtResult
  targetHours: number
}

export function SleepMetricsCard({ averages, debt, targetHours }: SleepMetricsCardProps) {
  const metrics = [
    {
      icon: Moon,
      label: "7-Day Avg Sleep",
      value: averages.label,
      sub: `Goal: ${targetHours}h`,
      iconColor: "text-[hsl(var(--secondary))]",
      bgColor: "bg-[hsl(var(--secondary)/0.1)]",
    },
    {
      icon: Star,
      label: "Sleep Quality",
      value: averages.avgQuality > 0 ? `${averages.avgQuality.toFixed(1)} / 5.0` : "—",
      sub: averages.avgQuality >= 4 ? "Very Good" : averages.avgQuality >= 3 ? "Fair" : "Needs Work",
      iconColor: "text-amber-400",
      bgColor: "bg-amber-400/10",
    },
    {
      icon: debt.isDeficit ? TrendingDown : TrendingUp,
      label: "Sleep Debt",
      value: debt.debtHours > 0 ? debt.label : "On target!",
      sub: `${(debt.weeklyActualMinutes / 60).toFixed(1)}h actual vs ${(debt.weeklyTargetMinutes / 60).toFixed(0)}h target`,
      iconColor: debt.isDeficit ? "text-red-400" : "text-[hsl(var(--primary))]",
      bgColor: debt.isDeficit ? "bg-red-400/10" : "bg-[hsl(var(--primary)/0.1)]",
    },
    {
      icon: Clock,
      label: "Sessions Logged",
      value: `${averages.entryCount}`,
      sub: "past 7 days",
      iconColor: "text-[hsl(var(--primary))]",
      bgColor: "bg-[hsl(var(--primary)/0.1)]",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map((m, i) => {
        const Icon = m.icon
        return (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", m.bgColor)}>
                  <Icon className={cn("w-4 h-4", m.iconColor)} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{m.label}</p>
                  <p className="text-xl font-bold text-[hsl(var(--foreground))] leading-tight">{m.value}</p>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">{m.sub}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
