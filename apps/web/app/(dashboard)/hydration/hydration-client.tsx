"use client"

import { useState } from "react"
import { HydrationQuickCard } from "@/components/dashboard/hydration-quick-card"
import { HydrationChart } from "@/components/hydration/hydration-chart"
import { HydrationLogList, type HydrationLogItem } from "@/components/hydration/hydration-log-list"
import { ReminderSettingsCard } from "@/components/hydration/reminder-settings-card"
import { getSupabaseBrowserClient } from "@/lib/supabase/browser"
import { generateId } from "@fittrack/utils"

interface HydrationClientProps {
  userId: string
  today: string
  targetMl: number
  initialEntries: any[]
  initialReminderSettings?: any
}

export function HydrationClient({
  userId,
  today,
  targetMl,
  initialEntries,
  initialReminderSettings,
}: HydrationClientProps) {
  const [entries, setEntries] = useState<HydrationLogItem[]>(
    initialEntries.map((e) => ({
      id: e.id,
      amountMl: e.amount_ml,
      created_at: e.created_at,
      source: e.source,
      note: e.note,
    }))
  )

  const supabase = getSupabaseBrowserClient()

  const currentMl = entries.reduce((acc, curr) => acc + curr.amountMl, 0)

  const handleLogWater = async (amountMl: number) => {
    const newEntry: HydrationLogItem = {
      id: generateId(),
      amountMl,
      created_at: new Date().toISOString(),
      source: "quick_add",
    }

    setEntries((prev) => [newEntry, ...prev])

    const { error } = await supabase.from("hydration_entries").insert({
      id: newEntry.id,
      user_id: userId,
      amount_ml: amountMl,
      date: today,
      source: "quick_add",
    })

    if (error) {
      setEntries((prev) => prev.filter((e) => e.id !== newEntry.id))
      throw error
    }
  }

  const handleDeleteLog = async (id: string) => {
    const originalEntries = [...entries]
    setEntries((prev) => prev.filter((e) => e.id !== id))

    const { error } = await supabase.from("hydration_entries").delete().eq("id", id)

    if (error) {
      setEntries(originalEntries)
      throw error
    }
  }

  const handleSaveReminderSettings = async (settings: any) => {
    const { error } = await supabase.from("hydration_reminders").upsert({
      user_id: userId,
      enabled: settings.enabled,
      start_time: settings.startTime,
      end_time: settings.endTime,
      interval_minutes: settings.intervalMinutes,
      smart_mode: settings.smartMode,
      updated_at: new Date().toISOString(),
    })

    if (error) throw error
  }

  // Mock weekly data for analytical visualization
  const weeklyData = [
    { day: "Mon", amountMl: 2100, goalMl: targetMl },
    { day: "Tue", amountMl: 2500, goalMl: targetMl },
    { day: "Wed", amountMl: 1800, goalMl: targetMl },
    { day: "Thu", amountMl: 2750, goalMl: targetMl },
    { day: "Fri", amountMl: 2300, goalMl: targetMl },
    { day: "Sat", amountMl: 2900, goalMl: targetMl },
    { day: "Today", amountMl: currentMl, goalMl: targetMl },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Hydration Tracker 💧</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Log water, view historical trends, and configure smart drink reminders.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <HydrationQuickCard
            currentMl={currentMl}
            targetMl={targetMl}
            streakDays={3}
            onLogWater={handleLogWater}
          />
          <HydrationChart weeklyData={weeklyData} />
          <HydrationLogList logs={entries} onDeleteLog={handleDeleteLog} />
        </div>

        <div className="space-y-6">
          <ReminderSettingsCard
            initialSettings={initialReminderSettings}
            onSave={handleSaveReminderSettings}
          />
        </div>
      </div>
    </div>
  )
}
