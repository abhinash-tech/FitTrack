import { useState, useEffect } from "react"
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, Modal } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { calculateWellnessScore, explainWellnessScore, getScoreTier } from "@fittrack/business-logic"
import { formatWater } from "@fittrack/utils"
import { X, Sparkles } from "lucide-react-native"
import * as Haptics from "expo-haptics"

export default function DashboardScreen() {
  const insets = useSafeAreaInsets()

  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false)
  const [aiTip, setAiTip] = useState<string | null>(null)
  const [loadingAi, setLoadingAi] = useState(true)

  useEffect(() => {
    let mounted = true
    const fetchTip = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/ai/coach")
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()
        if (mounted && data.tip) {
          setAiTip(data.tip)
        }
      } catch (e) {
        if (mounted) setAiTip("💡 Stay hydrated and keep moving to hit your daily goals!")
      } finally {
        if (mounted) setLoadingAi(false)
      }
    }
    fetchTip()
    return () => { mounted = false }
  }, [])

  const [waterMl, setWaterMl] = useState(1250)
  const waterGoalMl = 2500
  const calories = 1450
  const calorieGoal = 2000
  const sleepHours = 7.5
  const sleepGoalHours = 8

  const breakdown = calculateWellnessScore({
    waterMl,
    waterGoalMl,
    caloriesConsumed: calories,
    caloriesGoal: calorieGoal,
    stepsTaken: 4500,
    stepsGoal: 8000,
    sleepMin: sleepHours * 60,
    sleepGoalMin: sleepGoalHours * 60,
    workoutCompleted: false,
    goalsCompletedCount: 0,
    goalsTotal: 0,
  })

  const score = breakdown.total
  const tier = getScoreTier(score)
  const explanations = explainWellnessScore(breakdown)

  function handleQuickAddWater(amount: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setWaterMl((prev) => prev + amount)
  }

  const waterPercent = Math.min(100, Math.round((waterMl / waterGoalMl) * 100))

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-foreground">Welcome Back 👋</Text>
          <Text className="text-sm text-muted-foreground mt-1">Here is your daily wellness overview</Text>
        </View>

        {/* Wellness Score Card */}
        <View className="p-5 rounded-2xl bg-card border border-border mb-6 shadow-md">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-base font-semibold text-foreground">Daily Wellness Score</Text>
            <View className="px-3 py-1 rounded-full bg-[hsl(162,97%,43%,0.15)] border border-[hsl(162,97%,43%,0.3)]">
              <Text className="text-xs font-bold text-primary">{tier.emoji} {tier.label}</Text>
            </View>
          </View>

          <View className="flex-row items-center gap-6 my-2">
            <View className="w-24 h-24 rounded-full border-4 border-primary items-center justify-center bg-[hsl(162,97%,43%,0.05)]">
              <Text className="text-3xl font-extrabold text-foreground">{score}</Text>
              <Text className="text-[10px] text-muted-foreground uppercase font-semibold">out of 100</Text>
            </View>

            <View className="flex-1 space-y-1 gap-1">
              {explanations.slice(0, 3).map((exp, idx) => (
                <Text key={idx} className="text-xs text-muted-foreground">
                  • {exp}
                </Text>
              ))}
            </View>
          </View>
          
          <Pressable onPress={() => setIsScoreModalOpen(true)} className="mt-4 py-2">
            <Text className="text-primary font-bold text-center text-sm">View Exact Calculation</Text>
          </Pressable>
        </View>

        {/* AI Coach Block */}
        <View className="p-4 rounded-2xl border border-[hsl(162,97%,43%,0.3)] bg-[hsl(162,97%,43%,0.05)] mb-6 flex-row gap-3 shadow-sm">
          <View className="mt-1">
            <Sparkles size={20} color="hsl(162,97%,43%)" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="font-bold text-primary text-sm">AI Coach</Text>
              {loadingAi && <ActivityIndicator size="small" color="hsl(162,97%,43%)" />}
            </View>
            <Text className="text-foreground font-medium text-sm leading-5">
              {loadingAi ? "Analyzing your day..." : (aiTip || "Consistency is the key. Keep moving!")}
            </Text>
          </View>
        </View>

        {/* Wellness Score Breakdown Modal */}
        <Modal visible={isScoreModalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsScoreModalOpen(false)}>
          <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
              <Text className="text-xl font-bold text-foreground">Score Calculation</Text>
              <Pressable onPress={() => setIsScoreModalOpen(false)} className="p-2 bg-surface rounded-full">
                <X size={20} color="hsl(210 40% 98%)" />
              </Pressable>
            </View>
            <ScrollView className="flex-1 px-6 pt-6">
              <Text className="text-sm text-muted-foreground mb-6">
                Your score is a weighted average of your daily health habits, up to a maximum of 100 points.
              </Text>
              
              <View className="gap-6 mb-8">
                <View>
                  <View className="flex-row justify-between items-end mb-2">
                    <Text className="text-foreground font-semibold">Hydration (Max 30pts)</Text>
                    <Text className="text-primary font-bold">+{breakdown.hydration}</Text>
                  </View>
                  <View className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <View className="h-full bg-primary" style={{ width: `${(breakdown.hydration / 30) * 100}%` }} />
                  </View>
                </View>

                <View>
                  <View className="flex-row justify-between items-end mb-2">
                    <Text className="text-foreground font-semibold">Activity (Max 20pts)</Text>
                    <Text className="text-primary font-bold">+{breakdown.activity}</Text>
                  </View>
                  <View className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <View className="h-full bg-primary" style={{ width: `${(breakdown.activity / 20) * 100}%` }} />
                  </View>
                </View>

                <View>
                  <View className="flex-row justify-between items-end mb-2">
                    <Text className="text-foreground font-semibold">Nutrition (Max 15pts)</Text>
                    <Text className="text-primary font-bold">+{breakdown.nutrition}</Text>
                  </View>
                  <View className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <View className="h-full bg-primary" style={{ width: `${(breakdown.nutrition / 15) * 100}%` }} />
                  </View>
                </View>

                <View>
                  <View className="flex-row justify-between items-end mb-2">
                    <Text className="text-foreground font-semibold">Sleep (Max 15pts)</Text>
                    <Text className="text-primary font-bold">+{breakdown.sleep}</Text>
                  </View>
                  <View className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <View className="h-full bg-primary" style={{ width: `${(breakdown.sleep / 15) * 100}%` }} />
                  </View>
                </View>

                <View>
                  <View className="flex-row justify-between items-end mb-2">
                    <Text className="text-foreground font-semibold">Workout (Max 15pts)</Text>
                    <Text className="text-primary font-bold">+{breakdown.workout}</Text>
                  </View>
                  <View className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <View className="h-full bg-primary" style={{ width: `${(breakdown.workout / 15) * 100}%` }} />
                  </View>
                </View>

                <View>
                  <View className="flex-row justify-between items-end mb-2">
                    <Text className="text-foreground font-semibold">Goals (Max 5pts)</Text>
                    <Text className="text-primary font-bold">+{breakdown.goals}</Text>
                  </View>
                  <View className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <View className="h-full bg-primary" style={{ width: `${(breakdown.goals / 5) * 100}%` }} />
                  </View>
                </View>
              </View>

              <View className="flex-row justify-between items-center py-4 border-t border-border mb-12">
                <Text className="text-xl font-bold text-foreground">Total Score</Text>
                <Text className="text-3xl font-extrabold text-primary">{score} <Text className="text-sm font-medium text-muted-foreground">/ 100</Text></Text>
              </View>
            </ScrollView>
          </View>
        </Modal>

        {/* Hydration Quick-Add Card */}
        <View className="p-5 rounded-2xl bg-card border border-border mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-semibold text-foreground">Daily Hydration 💧</Text>
            <Text className="text-sm font-semibold text-primary">{waterPercent}% Goal</Text>
          </View>

          <Text className="text-2xl font-bold text-foreground mb-3">{formatWater(waterMl)} / {formatWater(waterGoalMl)}</Text>

          {/* Progress Bar */}
          <View className="h-3 w-full bg-muted rounded-full overflow-hidden mb-5">
            <View className="h-full bg-primary" style={{ width: `${waterPercent}%` }} />
          </View>

          {/* Presets */}
          <View className="flex-row gap-3">
            {[250, 500, 750].map((amount) => (
              <Pressable
                key={amount}
                onPress={() => handleQuickAddWater(amount)}
                className="flex-1 py-3 bg-surface border border-border rounded-xl items-center active:scale-95"
              >
                <Text className="text-xs font-semibold text-foreground">+{amount} ml</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* South Indian Quick-Add */}
        <View className="p-5 rounded-2xl bg-card border border-border mb-6">
          <Text className="text-base font-semibold text-foreground mb-3">South Indian Quick-Add 🥗</Text>
          <View className="flex-row flex-wrap gap-2">
            {[
              { name: "2 Idlis + Sambar", cal: 180 },
              { name: "Masala Dosa", cal: 320 },
              { name: "Ven Pongal", cal: 280 },
              { name: "Curd Rice", cal: 230 }
            ].map((item, idx) => (
              <Pressable
                key={idx}
                onPress={() => Alert.alert("Logged", `Logged ${item.name} (${item.cal} kcal)`)}
                className="px-3.5 py-2 bg-surface border border-border rounded-lg active:scale-95"
              >
                <Text className="text-xs font-medium text-foreground">{item.name} ({item.cal} kcal)</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
