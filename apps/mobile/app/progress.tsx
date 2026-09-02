import { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useSupabase } from "@/hooks/use-supabase"
import { generateId } from "@fittrack/utils"
import { format } from "date-fns"
import { calculateWeightTrend } from "@fittrack/business-logic"
import type { WeightEntry } from "@fittrack/types"
import { ArrowLeft } from "lucide-react-native"
import * as Haptics from "expo-haptics"

export default function ProgressScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const supabase = useSupabase()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [history, setHistory] = useState<WeightEntry[]>([])
  
  // Form State
  const [weightKg, setWeightKg] = useState("")
  const [notes, setNotes] = useState("")

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("weight_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(30)

      if (error) throw error
      setHistory((data || []) as WeightEntry[])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSave = async () => {
    if (!weightKg || isNaN(parseFloat(weightKg))) {
      Alert.alert("Invalid Input", "Please enter a valid weight.")
      return
    }

    try {
      setIsSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Unauthorized")

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

      const newEntry = {
        id: generateId(),
        user_id: user.id,
        weight_kg: parseFloat(weightKg),
        date: format(new Date(), "yyyy-MM-dd"),
        notes: notes || null,
      }

      const { error } = await supabase.from("weight_entries").upsert(newEntry, { onConflict: "user_id,date" })
      if (error) throw error
      
      setWeightKg("")
      setNotes("")
      await loadData()
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save weight")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("weight_entries").delete().eq("id", id)
      if (error) throw error
      setHistory(prev => prev.filter(e => e.id !== id))
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to delete")
    }
  }

  const confirmDelete = (id: string) => {
    Alert.alert("Delete Entry", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => handleDelete(id) }
    ])
  }

  const latest = history[0]?.weight_kg || 0
  const previous = history[1]?.weight_kg || 0
  const trend = calculateWeightTrend(latest, previous)

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-6 py-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="hsl(210 40% 98%)" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground">Weight Tracker</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        {/* Metric Pill */}
        <View className="bg-surface rounded-2xl p-6 border border-border items-center justify-center flex-row mb-6 shadow-sm">
          <View className="items-center">
            <Text className="text-muted-foreground text-sm uppercase tracking-wider font-semibold mb-2">Current Weight</Text>
            <View className="flex-row items-baseline gap-1">
              <Text className="text-5xl font-bold text-foreground">{latest > 0 ? latest.toFixed(1) : "--"}</Text>
              <Text className="text-xl text-muted-foreground font-medium">kg</Text>
            </View>
            {trend.diff !== 0 && (
              <View className={`mt-3 px-3 py-1 rounded-full flex-row items-center gap-1 ${
                trend.trend === 'down' ? 'bg-green-500/10' : 'bg-red-500/10'
              }`}>
                <Text className={`font-semibold ${
                  trend.trend === 'down' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {trend.diff > 0 ? '+' : ''}{trend.diff.toFixed(1)} kg
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Input Form */}
        <View className="bg-surface border border-border p-5 rounded-2xl mb-8">
          <Text className="text-lg font-bold text-foreground mb-4">Log Today</Text>
          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-muted-foreground mb-2">Weight (kg)</Text>
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-foreground font-medium"
                placeholder="e.g. 75.5"
                placeholderTextColor="hsl(215 20% 45%)"
                keyboardType="numeric"
                value={weightKg}
                onChangeText={setWeightKg}
              />
            </View>
            <View className="mt-4">
              <Text className="text-sm font-medium text-muted-foreground mb-2">Notes (optional)</Text>
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                placeholder="How do you feel?"
                placeholderTextColor="hsl(215 20% 45%)"
                value={notes}
                onChangeText={setNotes}
              />
            </View>
            <TouchableOpacity 
              className={`mt-6 p-4 rounded-xl items-center ${isSaving || !weightKg ? 'bg-primary/50' : 'bg-primary'}`}
              disabled={isSaving || !weightKg}
              onPress={handleSave}
            >
              {isSaving ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text className="text-primary-foreground font-bold text-base">Save Entry</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* History */}
        <Text className="text-lg font-bold text-foreground mb-4">Recent History</Text>
        {isLoading ? (
          <ActivityIndicator className="mt-4" color="#00E599" />
        ) : history.length === 0 ? (
          <Text className="text-muted-foreground text-center py-8">No weight logs yet.</Text>
        ) : (
          <View className="space-y-3 gap-3 mb-12">
            {history.map((entry) => (
              <TouchableOpacity 
                key={entry.id}
                onLongPress={() => confirmDelete(entry.id)}
                delayLongPress={500}
                className="bg-surface border border-border p-4 rounded-xl flex-row justify-between items-center"
              >
                <View>
                  <Text className="text-foreground font-bold text-lg">{entry.weight_kg.toFixed(1)} kg</Text>
                  <Text className="text-muted-foreground text-xs mt-1">
                    {format(new Date(entry.date), "MMM d, yyyy")}
                  </Text>
                  {entry.notes && (
                    <Text className="text-muted-foreground text-sm mt-2">{entry.notes}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
