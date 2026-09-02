import { useState } from "react"
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native"
import { Link, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { supabase } from "../../lib/supabase"

export default function SignUpScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSignUp() {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.")
      return
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.")
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    setLoading(false)
    if (error) {
      Alert.alert("Sign Up Failed", error.message)
    } else {
      Alert.alert("Success", "Account created successfully!")
      router.replace("/(auth)/onboarding")
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <ScrollView 
        contentContainerStyle={{ paddingTop: insets.top + 20, paddingHorizontal: 24, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-8">
          <Text className="text-3xl font-bold text-foreground text-center">Start your journey</Text>
          <Text className="text-base text-muted-foreground mt-2 text-center">Create your free FitTrack account</Text>
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
              placeholder="Min 8 characters"
              placeholderTextColor="hsl(215, 20%, 45%)"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-foreground mb-1.5 ml-1">Confirm Password</Text>
            <TextInput
              className="w-full h-12 bg-input border border-border rounded-xl px-4 text-foreground"
              placeholder="Repeat your password"
              placeholderTextColor="hsl(215, 20%, 45%)"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <Pressable 
            onPress={handleSignUp}
            disabled={loading}
            className="w-full h-12 mt-4 bg-primary items-center justify-center rounded-xl shadow-[0_0_12px_rgba(6,214,160,0.2)] active:scale-95 opacity-100 disabled:opacity-50"
          >
            {loading ? (
              <ActivityIndicator color="hsl(222, 47%, 7%)" />
            ) : (
              <Text className="text-primary-foreground font-semibold text-base">Create Account</Text>
            )}
          </Pressable>
        </View>

        <View className="flex-row justify-center mt-6">
          <Text className="text-muted-foreground">Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text className="text-primary font-semibold">Sign In</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
