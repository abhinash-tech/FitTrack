import { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useSupabase } from "@/hooks/use-supabase"
import { getAchievementDisplay } from "@fittrack/business-logic"
import type { Achievement, UserAchievement } from "@fittrack/types"
import { ArrowLeft, Trophy } from "lucide-react-native"

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const supabase = useSupabase()

  const [isLoading, setIsLoading] = useState(true)
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([])
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: all }, { data: userAchv }] = await Promise.all([
        supabase.from("achievements").select("*").order("points", { ascending: true }),
        supabase.from("user_achievements").select("*").eq("user_id", user.id)
      ])

      setAllAchievements((all || []) as Achievement[])
      setUserAchievements((userAchv || []) as UserAchievement[])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const earnedIds = new Set(userAchievements.map(ua => ua.achievement_id))

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-6 py-4 border-b border-border mb-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="hsl(210 40% 98%)" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground">Trophy Room</Text>
      </View>

      <ScrollView className="flex-1 px-6">
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-primary/20 rounded-full items-center justify-center mb-3">
            <Trophy size={40} color="hsl(162 97% 43%)" />
          </View>
          <Text className="text-2xl font-bold text-foreground">Your Achievements</Text>
          <Text className="text-muted-foreground mt-1">
            Unlocked {earnedIds.size} of {allAchievements.length}
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color="#00E599" />
        ) : (
          <View className="flex-row flex-wrap justify-between gap-y-4 mb-12">
            {allAchievements.map(achv => {
              const isUnlocked = earnedIds.has(achv.id)
              const display = getAchievementDisplay(achv.slug)
              
              return (
                <View 
                  key={achv.id} 
                  className={`w-[48%] bg-surface border rounded-2xl p-4 items-center ${
                    isUnlocked ? "border-primary/50 opacity-100" : "border-border opacity-50"
                  }`}
                >
                  <Text className="text-4xl mb-3">{isUnlocked ? display.emoji : "🔒"}</Text>
                  <Text className="text-foreground font-bold text-center mb-1 leading-tight">
                    {display.title}
                  </Text>
                  <Text className="text-muted-foreground text-xs text-center">
                    {display.subtitle}
                  </Text>
                  {isUnlocked && (
                    <View className="mt-3 bg-primary/20 px-2 py-1 rounded">
                      <Text className="text-primary text-[10px] font-bold uppercase tracking-wider">
                        Earned
                      </Text>
                    </View>
                  )}
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
