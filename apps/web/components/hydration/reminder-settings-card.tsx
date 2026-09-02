"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Clock, Sparkles } from "lucide-react"
import { toast } from "sonner"

interface ReminderSettingsCardProps {
  initialSettings?: {
    enabled: boolean
    startTime: string
    endTime: string
    intervalMinutes: number
    smartMode: boolean
  }
  onSave: (settings: any) => Promise<void>
}

export function ReminderSettingsCard({
  initialSettings = {
    enabled: true,
    startTime: "08:00",
    endTime: "22:00",
    intervalMinutes: 60,
    smartMode: true,
  },
  onSave,
}: ReminderSettingsCardProps) {
  const [enabled, setEnabled] = useState(initialSettings.enabled)
  const [startTime, setStartTime] = useState(initialSettings.startTime)
  const [endTime, setEndTime] = useState(initialSettings.endTime)
  const [intervalMinutes, setIntervalMinutes] = useState(initialSettings.intervalMinutes)
  const [smartMode, setSmartMode] = useState(initialSettings.smartMode)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await onSave({
        enabled,
        startTime,
        endTime,
        intervalMinutes,
        smartMode,
      })
      toast.success("Hydration reminder schedule saved! 🔔")
    } catch (err: any) {
      toast.error(err.message || "Failed to save reminders")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary)/0.15)] flex items-center justify-center text-[hsl(var(--primary))]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base">Smart Reminders</CardTitle>
              <CardDescription className="text-xs">Configure notification schedule & quiet hours</CardDescription>
            </div>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>
      </CardHeader>

      {enabled && (
        <CardContent className="space-y-4 pt-2">
          {/* Smart Mode Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[hsl(var(--primary)/0.05)] border border-[hsl(var(--primary)/0.2)]">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[hsl(var(--primary))]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Smart Mode</span>
              </div>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                Automatically adjusts reminder frequency based on activity & weather
              </p>
            </div>
            <Switch checked={smartMode} onCheckedChange={setSmartMode} />
          </div>

          {/* Time Schedule inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Start Time</label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">End Time</label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Interval Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Interval</label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 60, 90, 120].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setIntervalMinutes(mins)}
                  className={`py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    intervalMinutes === mins
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]"
                      : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/0.3)]"
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          <Button size="sm" className="w-full mt-2" loading={saving} onClick={handleSave}>
            Save Reminder Schedule
          </Button>
        </CardContent>
      )}
    </Card>
  )
}
