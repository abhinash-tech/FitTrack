import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getDailyStatsHistory } from "@fittrack/supabase"
import { AnalyticsCharts } from "@/components/analytics/analytics-charts"
import { Download } from "lucide-react"

export default async function AnalyticsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch up to 90 days of history
  const stats = await getDailyStatsHistory(supabase, user.id, 90)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            View your long-term wellness trends.
          </p>
        </div>
        
        {/* Export Button pointing to the REST API route */}
        <a 
          href="/api/export"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-md font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </a>
      </div>

      {stats.length > 0 ? (
        <AnalyticsCharts data={stats} />
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-xl border border-border mt-8">
          <p className="text-lg font-medium text-foreground">No data available yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Check back after logging your daily stats!</p>
        </div>
      )}
    </div>
  )
}
