import { View, Text, Pressable } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useSupabase } from "@/hooks/use-supabase"

export default function MoreScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const supabase = useSupabase()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.replace("/(auth)/login" as any)
  }

  const menuItems = [
    { label: "📊  Analytics", route: "/analytics" },
    { label: "📈  Progress Logs", route: "/progress" },
    { label: "🎯  Goals", route: "/goals" },
    { label: "🏆  Achievements", route: "/achievements" },
    { label: "🌙  Sleep & Recovery", route: "/sleep" },
  ]

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="px-6 pt-6">
        <Text className="text-3xl font-bold text-foreground">More</Text>
        <Text className="text-muted-foreground mt-1">Sleep, Goals & Settings</Text>

        <View className="mt-8 space-y-2 gap-2">
          {menuItems.map((item) => (
            <Pressable
              key={item.route}
              onPress={() => router.push(item.route as any)}
              className="bg-surface border border-border p-4 rounded-xl active:opacity-70"
            >
              <Text className="text-foreground font-medium text-base">{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          className="mt-8 bg-red-500/10 border border-red-500/20 p-4 rounded-xl items-center"
          onPress={handleSignOut}
        >
          <Text className="text-red-400 font-semibold">Sign Out</Text>
        </Pressable>
      </View>
    </View>
  )
}

