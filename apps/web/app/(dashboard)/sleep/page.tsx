import { Metadata } from "next"
import { getSleepDashboardData } from "@/app/actions/sleep"
import { SleepLogForm } from "@/components/sleep/sleep-log-form"
import { SleepWeeklyChart } from "@/components/sleep/sleep-weekly-chart"
import { SleepMetricsCard } from "@/components/sleep/sleep-metrics-card"
import { SleepHistoryList } from "@/components/sleep/sleep-history-list"
import { SleepInsightsCard } from "@/components/sleep/sleep-insights-card"
import {
  buildSleepChartData,
  calculateSleepAverages,
  calculateSleepDebt,
} from "@fittrack/business-logic"

export const metadata: Metadata = {
  title: "Sleep | FitTrack",
  description: "Track your sleep quality and recovery.",
}

export default async function SleepPage() {
  const { entries, sleepGoalHours } = await getSleepDashboardData()

  const last7 = entries.slice(0, 7)
  const chartData = buildSleepChartData(last7, 7)
  const averages = calculateSleepAverages(last7)
  const debt = calculateSleepDebt(last7, sleepGoalHours)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sleep & Recovery</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          Track your rest, quality, and recovery trends.
        </p>
      </div>

      {/* Metrics Summary */}
      <SleepMetricsCard averages={averages} debt={debt} targetHours={sleepGoalHours} />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Column: Form + Insights */}
        <div className="lg:col-span-2 space-y-6">
          <SleepLogForm />
          <SleepInsightsCard
            avgHours={averages.avgDurationHours}
            avgQuality={averages.avgQuality}
            targetHours={sleepGoalHours}
          />
        </div>

        {/* Right Column: Chart + History */}
        <div className="lg:col-span-3 space-y-6">
          <SleepWeeklyChart data={chartData} targetHours={sleepGoalHours} />
          <SleepHistoryList entries={entries} />
        </div>
      </div>
    </div>
  )
}
