import { useState } from "react"
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from "react-native"
import { Link, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { supabase } from "../../lib/supabase"

export default function LoginScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your email and password.")
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)
    if (error) {
      Alert.alert("Login Failed", error.message)
    } else {
      router.replace("/(tabs)")
    }
  }

  return (
    <View className="flex-1 bg-background px-6" style={{ paddingTop: insets.top + 20 }}>
      <View className="items-center mb-8">
        <View className="w-12 h-12 rounded-xl bg-primary items-center justify-center mb-4">
          <Text className="text-2xl">💧</Text>
        </View>
        <Text className="text-3xl font-bold text-foreground">Welcome back</Text>
        <Text className="text-base text-muted-foreground mt-2">Sign in to your account</Text>
      </View>

      <View className="space-y-4 gap-4">
        <View>
          <Text className="text-sm font-medium text-foreground mb-1.5 ml-1">Email</Text>
          <TextInput
            className="w-full h-12 bg-input border border-border rounded-xl px-4 text-foreground"
            placeholder="you@example.com"
            placeholderTextColor="hsl(215, 20%, 45%)"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-foreground mb-1.5 ml-1">Password</Text>
          <TextInput
            className="w-full h-12 bg-input border border-border rounded-xl px-4 text-foreground"
            placeholder="Enter your password"
            placeholderTextColor="hsl(215, 20%, 45%)"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <Pressable 
          onPress={handleLogin}
          disabled={loading}
          className="w-full h-12 mt-4 bg-primary items-center justify-center rounded-xl shadow-[0_0_12px_rgba(6,214,160,0.2)] active:scale-95 opacity-100 disabled:opacity-50"
        >
          {loading ? (
            <ActivityIndicator color="hsl(222, 47%, 7%)" />
          ) : (
            <Text className="text-primary-foreground font-semibold text-base">Sign In</Text>
          )}
        </Pressable>
      </View>

      <View className="flex-row justify-center mt-6">
        <Text className="text-muted-foreground">Don't have an account? </Text>
        <Link href="/(auth)/signup" asChild>
          <Pressable>
            <Text className="text-primary font-semibold">Sign Up</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  )
}
