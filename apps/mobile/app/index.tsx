import { Text, View, Pressable } from "react-native"
import { Link } from "expo-router"

export default function IndexPage() {
  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <View className="items-center justify-center mb-8">
        <View className="w-16 h-16 rounded-2xl bg-primary items-center justify-center mb-4 shadow-[0_0_20px_rgba(6,214,160,0.3)]">
          <Text className="text-3xl">💧</Text>
        </View>
        <Text className="text-3xl font-bold text-foreground">FitTrack</Text>
        <Text className="text-base text-muted-foreground mt-2 text-center">
          Your personal wellness companion
        </Text>
      </View>
      
      <Link href="/(auth)/login" asChild>
        <Pressable className="w-full h-14 bg-primary items-center justify-center rounded-2xl shadow-[0_0_15px_rgba(6,214,160,0.2)] active:scale-95">
          <Text className="text-primary-foreground font-semibold text-lg">Sign In</Text>
        </Pressable>
      </Link>
    </View>
  )
}
