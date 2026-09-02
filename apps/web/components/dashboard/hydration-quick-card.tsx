"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Droplets, Plus, GlassWater, Flame } from "lucide-react"
import { formatWater } from "@fittrack/utils"
import { toast } from "sonner"

interface HydrationQuickCardProps {
  currentMl: number
  targetMl: number
  streakDays: number
  onLogWater: (amountMl: number) => Promise<void>
}

export function HydrationQuickCard({
  currentMl,
  targetMl,
  streakDays,
  onLogWater,
}: HydrationQuickCardProps) {
  const [logging, setLogging] = useState<number | null>(null)
  const percent = Math.min(100, Math.round((currentMl / targetMl) * 100))

  async function handleQuickAdd(amount: number) {
    setLogging(amount)
    try {
      await onLogWater(amount)
      toast.success(`Logged ${amount} ml of water! 💧`)
    } catch (err: any) {
      toast.error(err.message || "Failed to log water")
    } finally {
      setLogging(null)
    }
  }

  return (
    <Card className="relative overflow-hidden border-[hsl(var(--primary)/0.2)]">
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary)/0.15)] flex items-center justify-center text-[hsl(var(--primary))] shadow-[0_0_12px_var(--primary-glow)]">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Daily Hydration</h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Target: {formatWater(targetMl)}</p>
            </div>
          </div>

          {streakDays > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[hsl(var(--warning)/0.15)] border border-[hsl(var(--warning)/0.3)] text-[hsl(var(--warning))] text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{streakDays} Day Streak</span>
            </div>
          )}
        </div>

        {/* Progress Display */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
              {formatWater(currentMl)}
            </span>
            <span className="text-sm font-semibold text-[hsl(var(--primary))]">
              {percent}% Goal
            </span>
          </div>
          <Progress value={percent} className="h-3" />
        </div>

        {/* Quick Add Presets */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {[
            { amount: 250, label: "Glass", size: "250 ml", icon: GlassWater },
            { amount: 500, label: "Bottle", size: "500 ml", icon: Droplets },
            { amount: 750, label: "Shaker", size: "750 ml", icon: GlassWater },
          ].map((preset) => {
            const Icon = preset.icon
            const isSelected = logging === preset.amount
            return (
              <Button
                key={preset.amount}
                variant="outline"
                loading={isSelected}
                disabled={logging !== null}
                onClick={() => handleQuickAdd(preset.amount)}
                className="flex flex-col items-center justify-center h-20 p-2 rounded-xl border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--primary)/0.05)] transition-all group"
              >
                <Icon className="w-5 h-5 text-[hsl(var(--primary))] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold mt-1">{preset.label}</span>
                <span className="text-[10px] text-[hsl(var(--muted-foreground))]">+{preset.size}</span>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
