import { useState, useEffect } from "react"
import { View, Text, ScrollView, ActivityIndicator, Pressable } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useSupabase } from "@/hooks/use-supabase"
import { ArrowLeft, TrendingUp } from "lucide-react-native"
import { format, parseISO } from "date-fns"
import type { DailyStat } from "@fittrack/types"

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const supabase = useSupabase()

  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<DailyStat[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from("daily_stats")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false })
          .limit(7) // Last 7 days for mobile simplicity

        if (error) throw error
        if (data) {
          // Sort ascending for chart left-to-right chronological order
          setStats((data as DailyStat[]).sort((a, b) => a.date.localeCompare(b.date)))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Helper to render simple flex-based bar chart
  const renderBarChart = (
    data: DailyStat[], 
    dataKey: keyof DailyStat, 
    color: string, 
    title: string,
    maxValueFallback: number
  ) => {
    // Find max value for scaling
    const maxValue = Math.max(...data.map(d => Number(d[dataKey]) || 0), maxValueFallback)

    return (
      <View className="p-4 rounded-2xl bg-surface border border-border mb-6">
        <Text className="text-foreground font-bold text-base mb-4">{title}</Text>
        <View className="flex-row items-end justify-between h-40 pt-4">
          {data.length === 0 && (
            <Text className="text-muted-foreground self-center">No data</Text>
          )}
          {data.map((item, idx) => {
            const val = Number(item[dataKey]) || 0
            const heightPct = maxValue > 0 ? (val / maxValue) * 100 : 0
            return (
              <View key={idx} className="items-center flex-1">
                <Text className="text-[10px] text-muted-foreground mb-1">{val > 0 ? val : ""}</Text>
                <View className="w-8 bg-muted rounded-t-md overflow-hidden justify-end h-full">
                  <View 
                    style={{ height: `${heightPct}%`, backgroundColor: color }} 
                    className="w-full rounded-t-md"
                  />
                </View>
                <Text className="text-[10px] text-muted-foreground mt-2 font-medium">
                  {format(parseISO(item.date), "EEE")}
                </Text>
              </View>
            )
          })}
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-4 pt-2 border-b border-border">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-surface">
          <ArrowLeft size={24} color="hsl(210 40% 98%)" />
        </Pressable>
        <Text className="text-xl font-bold text-foreground">Analytics</Text>
        <View className="w-10" />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="hsl(162, 97%, 43%)" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 py-6">
          <View className="mb-6 flex-row items-center gap-2">
            <TrendingUp size={20} color="hsl(210 40% 98%)" />
            <Text className="text-foreground font-semibold">Last 7 Days Trends</Text>
          </View>

          {renderBarChart(stats, "wellness_score", "hsl(162, 97%, 43%)", "Wellness Score", 100)}
          {renderBarChart(stats, "water_ml", "#3b82f6", "Hydration (ml)", 2500)}
          {renderBarChart(stats, "calories_consumed", "#f59e0b", "Calories", 2000)}
          {renderBarChart(stats, "sleep_min", "#8b5cf6", "Sleep (min)", 480)}
          
          <View className="h-12" />
        </ScrollView>
      )}
    </View>
  )
}
