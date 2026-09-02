"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { calculatePace, formatPace, estimateCaloriesBurned } from "@fittrack/utils"
import { Footprints, Flame, Timer, Navigation } from "lucide-react"

export function CardioCalculator() {
  const [activityType, setActivityType] = useState<"walking" | "running">("running")
  const [distanceKm, setDistanceKm] = useState<string>("5.0")
  const [durationMin, setDurationMin] = useState<string>("30")

  const dist = parseFloat(distanceKm) || 0
  const dur = parseFloat(durationMin) || 0

  const paceSec = dist > 0 && dur > 0 ? calculatePace(dist, dur) : 0
  const formattedPace = paceSec > 0 ? formatPace(paceSec) : "--:--"
  const estimatedBurn = dist > 0 && dur > 0 ? estimateCaloriesBurned(activityType, dur, 70) : 0

  return (
    <Card className="border-[hsl(var(--primary)/0.2)]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary)/0.15)] flex items-center justify-center text-[hsl(var(--primary))]">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base">Cardio & Pace Calculator</CardTitle>
            <CardDescription className="text-xs">Estimate pace & calories for outdoor runs or walks</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Activity Selector */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "running", label: "Running 🏃" },
            { id: "walking", label: "Walking 🚶" },
          ].map((act) => (
            <button
              key={act.id}
              type="button"
              onClick={() => setActivityType(act.id as any)}
              className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                activityType === act.id
                  ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]"
                  : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
              }`}
            >
              {act.label}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Distance (km)</label>
            <Input
              type="number"
              step="0.1"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Duration (mins)</label>
            <Input
              type="number"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
        </div>

        {/* Calculated Results */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-[hsl(var(--background-surface))] border border-[hsl(var(--border))]">
            <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
              <Timer className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
              <span>Calculated Pace</span>
            </div>
            <p className="text-lg font-bold text-[hsl(var(--foreground))] mt-1">{formattedPace} <span className="text-xs text-[hsl(var(--muted-foreground))]">/km</span></p>
          </div>

          <div className="p-3 rounded-xl bg-[hsl(var(--background-surface))] border border-[hsl(var(--border))]">
            <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
              <Flame className="w-3.5 h-3.5 text-[hsl(var(--warning))]" />
              <span>Estimated Burn</span>
            </div>
            <p className="text-lg font-bold text-[hsl(var(--warning))] mt-1">{estimatedBurn} <span className="text-xs text-[hsl(var(--muted-foreground))]">kcal</span></p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
