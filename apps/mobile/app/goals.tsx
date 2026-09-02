import { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useSupabase } from "@/hooks/use-supabase"
import type { Goal } from "@fittrack/types"
import { ArrowLeft, Target, Plus, Trash2 } from "lucide-react-native"

export default function GoalsScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const supabase = useSupabase()

  const [isLoading, setIsLoading] = useState(true)
  const [goals, setGoals] = useState<Goal[]>([])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) throw error
      setGoals((data || []) as Goal[])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleUpdateProgress = async (id: string, currentValue: number, target: number) => {
    Alert.prompt(
      "Update Progress",
      `Current: ${currentValue} / ${target}`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Update", 
          onPress: async (val) => {
            const num = Number(val)
            if (isNaN(num)) return
            
            try {
              const { error } = await supabase.from("goals").update({ current_value: num }).eq("id", id)
              if (error) throw error
              setGoals(prev => prev.map(g => g.id === id ? { ...g, current_value: num } : g))
            } catch (err: any) {
              Alert.alert("Error", err.message)
            }
          }
        }
      ],
      "plain-text",
      currentValue.toString()
    )
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("goals").update({ is_active: false }).eq("id", id)
      if (error) throw error
      setGoals(prev => prev.filter(g => g.id !== id))
    } catch (err: any) {
      Alert.alert("Error", err.message)
    }
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="hsl(210 40% 98%)" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">My Goals</Text>
        </View>
        <TouchableOpacity className="p-2 bg-primary/20 rounded-full">
          <Plus size={20} color="hsl(162 97% 43%)" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        {isLoading ? (
          <ActivityIndicator color="#00E599" />
        ) : goals.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Target size={48} color="hsl(215 20% 45%)" />
            <Text className="text-muted-foreground text-center mt-4">No active goals found.</Text>
            <Text className="text-muted-foreground text-center text-sm">Add one from the web app to track it here!</Text>
          </View>
        ) : (
          <View className="space-y-4 gap-4 mb-12">
            {goals.map(goal => {
              const progress = Math.min((goal.current_value / goal.target_value) * 100, 100)
              
              return (
                <View key={goal.id} className="bg-surface border border-border p-5 rounded-2xl">
                  <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-1">
                      <Text className="text-foreground font-bold text-lg">{goal.title}</Text>
                      <Text className="text-muted-foreground text-xs uppercase tracking-wider">{goal.type}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDelete(goal.id)} className="p-2 bg-red-500/10 rounded-xl">
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                  
                  <View className="mb-2 flex-row justify-between items-end">
                    <Text className="text-2xl font-bold text-primary">
                      {goal.current_value} <Text className="text-sm text-muted-foreground">/ {goal.target_value} {goal.unit}</Text>
                    </Text>
                    <Text className="text-muted-foreground font-medium">{progress.toFixed(0)}%</Text>
                  </View>
                  
                  <View className="h-2 w-full bg-background rounded-full overflow-hidden mb-4">
                    <View className="h-full bg-primary" style={{ width: `${progress}%` }} />
                  </View>

                  <TouchableOpacity 
                    onPress={() => handleUpdateProgress(goal.id, goal.current_value, goal.target_value)}
                    className="w-full py-3 bg-secondary rounded-xl items-center"
                  >
                    <Text className="text-secondary-foreground font-bold">Update Progress</Text>
                  </TouchableOpacity>
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
