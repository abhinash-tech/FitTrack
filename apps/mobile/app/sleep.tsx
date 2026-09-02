import { useState } from "react"
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useSupabase } from "@/hooks/use-supabase"
import {
  getSleepQualityInfo,
  buildSleepChartData,
  calculateSleepAverages,
  calculateSleepDebt,
  formatSleepDurationLabel,
} from "@fittrack/business-logic"
import { formatTime, formatDateLabel, generateId, todayDate } from "@fittrack/utils"
import type { SleepEntry } from "@fittrack/types"

const QUALITY_OPTIONS = [
  { value: 1, emoji: "😴", label: "Poor" },
  { value: 2, emoji: "😪", label: "Fair" },
  { value: 3, emoji: "😌", label: "Good" },
  { value: 4, emoji: "😊", label: "V.Good" },
  { value: 5, emoji: "🌟", label: "Great" },
]

export default function SleepScreen() {
  const insets = useSafeAreaInsets()
  const supabase = useSupabase()

  const [entries, setEntries] = useState<SleepEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [quality, setQuality] = useState(4)
  const [notes, setNotes] = useState("")

  // Simple time inputs (HH:MM) for mobile
  const [bedHour, setBedHour] = useState("23")
  const [bedMin, setBedMin] = useState("00")
  const [wakeHour, setWakeHour] = useState("07")
  const [wakeMin, setWakeMin] = useState("00")

  const today = todayDate()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yest = yesterday.toISOString().split("T")[0]

  // Derived chart + metric data
  const averages = calculateSleepAverages(entries.slice(0, 7))
  const debt = calculateSleepDebt(entries.slice(0, 7), 8)
  const chartData = buildSleepChartData(entries.slice(0, 7), 7)

  const fetchEntries = async () => {
    setIsFetching(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsFetching(false); return }

    const { data } = await supabase
      .from("sleep_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(14)

    setEntries((data ?? []) as SleepEntry[])
    setIsFetching(false)
  }

  // Fetch on mount
  useState(() => { fetchEntries() })

  const handleLogSleep = async () => {
    const bedtime = `${yest}T${bedHour.padStart(2,"0")}:${bedMin.padStart(2,"0")}:00`
    const wakeTime = `${today}T${wakeHour.padStart(2,"0")}:${wakeMin.padStart(2,"0")}:00`

    const bed = new Date(bedtime)
    const wake = new Date(wakeTime)

    if (wake <= bed) {
      Alert.alert("Invalid Times", "Wake time must be after bedtime.")
      return
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { error } = await supabase.from("sleep_entries").insert({
      id: generateId(),
      user_id: user.id,
      bedtime,
      wake_time: wakeTime,
      quality,
      notes: notes || null,
      date: today,
    })

    setLoading(false)
    if (error) {
      Alert.alert("Error", error.message)
    } else {
      Alert.alert("Logged! 🌙", `Sleep recorded.`)
      setNotes("")
      fetchEntries()
    }
  }

  const handleDelete = async (id: string) => {
    Alert.alert("Delete Entry", "Remove this sleep entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await supabase.from("sleep_entries").delete().eq("id", id)
          fetchEntries()
        },
      },
    ])
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-5 pt-6 pb-24 space-y-6">
        {/* Header */}
        <View>
          <Text className="text-3xl font-bold text-foreground">Sleep & Recovery</Text>
          <Text className="text-muted-foreground mt-1">Track your rest and recovery trends</Text>
        </View>

        {/* Metric Pills */}
        <View className="flex-row gap-3">
          <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-xs text-muted-foreground">7-Day Avg</Text>
            <Text className="text-2xl font-bold text-secondary mt-1">{averages.label}</Text>
          </View>
          <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-xs text-muted-foreground">Sleep Debt</Text>
            <Text className={`text-2xl font-bold mt-1 ${debt.isDeficit ? "text-red-400" : "text-primary"}`}>
              {debt.debtHours > 0 ? debt.label : "On track"}
            </Text>
          </View>
        </View>

        {/* 7-Day mini bars */}
        <View className="bg-surface rounded-2xl p-4 border border-border">
          <Text className="text-sm font-semibold text-foreground mb-3">7-Day Overview</Text>
          <View className="flex-row gap-1 items-end h-16">
            {chartData.map((d, i) => {
              const barH = Math.max(4, Math.min(64, Math.round((d.durationHours / 10) * 64)))
              const color = d.quality
                ? d.quality >= 4 ? "#06D6A0" : d.quality === 3 ? "#FCD34D" : "#EF4444"
                : "#374151"
              return (
                <View key={i} className="flex-1 items-center">
                  <View
                    style={{ height: barH, backgroundColor: color, borderRadius: 4, width: "75%" }}
                  />
                  <Text className="text-[9px] text-muted-foreground mt-1">{d.dayLabel}</Text>
                </View>
              )
            })}
          </View>
        </View>

        {/* Log Form */}
        <View className="bg-surface rounded-2xl p-4 border border-border space-y-4">
          <Text className="text-base font-semibold text-foreground">🌙 Log Sleep</Text>

          {/* Time Inputs */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-xs text-muted-foreground mb-1">Bedtime (prev night)</Text>
              <View className="flex-row gap-1">
                <TextInput
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-foreground text-center"
                  value={bedHour}
                  onChangeText={setBedHour}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="23"
                  placeholderTextColor="#64748B"
                />
                <Text className="text-foreground self-center">:</Text>
                <TextInput
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-foreground text-center"
                  value={bedMin}
                  onChangeText={setBedMin}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="00"
                  placeholderTextColor="#64748B"
                />
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-muted-foreground mb-1">Wake Time (today)</Text>
              <View className="flex-row gap-1">
                <TextInput
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-foreground text-center"
                  value={wakeHour}
                  onChangeText={setWakeHour}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="07"
                  placeholderTextColor="#64748B"
                />
                <Text className="text-foreground self-center">:</Text>
                <TextInput
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-foreground text-center"
                  value={wakeMin}
                  onChangeText={setWakeMin}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="00"
                  placeholderTextColor="#64748B"
                />
              </View>
            </View>
          </View>

          {/* Quality Picker */}
          <View>
            <Text className="text-xs text-muted-foreground mb-2">Sleep Quality</Text>
            <View className="flex-row gap-2">
              {QUALITY_OPTIONS.map((q) => (
                <TouchableOpacity
                  key={q.value}
                  onPress={() => setQuality(q.value)}
                  className={`flex-1 items-center py-2 rounded-xl border ${
                    quality === q.value
                      ? "border-secondary bg-secondary/20"
                      : "border-border bg-background"
                  }`}
                >
                  <Text className="text-lg">{q.emoji}</Text>
                  <Text className="text-[9px] text-muted-foreground mt-0.5">{q.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <TextInput
            className="bg-background border border-border rounded-xl px-3 py-2.5 text-foreground text-sm"
            value={notes}
            onChangeText={setNotes}
            placeholder="Notes (optional, e.g. had coffee late)"
            placeholderTextColor="#64748B"
            multiline
            numberOfLines={2}
          />

          <TouchableOpacity
            className="bg-secondary py-3.5 rounded-xl items-center"
            onPress={handleLogSleep}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">Log Sleep 🌙</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* History */}
        <View className="bg-surface rounded-2xl p-4 border border-border">
          <Text className="text-sm font-semibold text-foreground mb-3">Recent Sleep</Text>
          {isFetching ? (
            <ActivityIndicator color="#06D6A0" />
          ) : entries.length === 0 ? (
            <Text className="text-center text-muted-foreground text-sm py-4">
              No sleep entries yet. Log your first night above!
            </Text>
          ) : (
            <View className="space-y-2 gap-2">
              {entries.slice(0, 7).map((entry) => {
                const qi = entry.quality ? getSleepQualityInfo(entry.quality) : null
                return (
                  <TouchableOpacity
                    key={entry.id}
                    onLongPress={() => handleDelete(entry.id)}
                    className="flex-row items-center justify-between p-3 bg-background rounded-xl border border-border"
                  >
                    <View className="flex-row items-center gap-3">
                      <Text className="text-xl">{qi?.emoji ?? "😴"}</Text>
                      <View>
                        <Text className="text-foreground font-medium text-sm">{formatDateLabel(entry.date)}</Text>
                        <Text className="text-muted-foreground text-xs">
                          {formatTime(entry.bedtime)} → {formatTime(entry.wake_time)}
                        </Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="text-secondary font-bold text-sm">
                        {formatSleepDurationLabel(entry.duration_min ?? 0)}
                      </Text>
                      {qi && (
                        <Text className="text-xs text-muted-foreground">{qi.label}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          )}
          <Text className="text-[10px] text-muted-foreground text-center mt-3">
            Long-press an entry to delete it
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}
