import { Suspense } from "react"
import { cookies } from "next/headers"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getWeightHistory, getBodyMeasurements, getProfile } from "@fittrack/supabase"
import { ProgressMetricsCard } from "@/components/progress/progress-metrics-card"
import { WeightTrendChart } from "@/components/progress/weight-trend-chart"
import { MeasurementsChart } from "@/components/progress/measurements-chart"
import { ProgressHistoryList } from "@/components/progress/progress-history-list"
import { WeightLogModal } from "@/components/progress/weight-log-modal"
import { MeasurementsLogModal } from "@/components/progress/measurements-log-modal"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Progress | FitTrack",
}

export default async function ProgressPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch data
  const [weightHistory, measurementsHistory, profile] = await Promise.all([
    getWeightHistory(supabase, user.id, 90), // 90 days history for charts
    getBodyMeasurements(supabase, user.id, 90),
    getProfile(supabase, user.id),
  ])

  const latestWeight = weightHistory[0]?.weight_kg || 0
  const previousWeight = weightHistory[1]?.weight_kg || 0
  const heightCm = profile?.height_cm || 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Progress & Body</h2>
          <p className="text-muted-foreground text-sm mt-1">Track your weight and body measurements over time.</p>
        </div>
        <div className="flex gap-2">
          <WeightLogModal />
          <MeasurementsLogModal />
        </div>
      </div>

      <ProgressMetricsCard 
        latestWeight={latestWeight}
        previousWeight={previousWeight}
        heightCm={heightCm}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeightTrendChart data={weightHistory} />
        <MeasurementsChart data={measurementsHistory} />
      </div>

      <ProgressHistoryList 
        weightEntries={weightHistory}
        measurements={measurementsHistory}
      />
    </div>
  )
}
