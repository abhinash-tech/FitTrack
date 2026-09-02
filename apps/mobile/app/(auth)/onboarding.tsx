import { useState } from "react"
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { supabase } from "../../lib/supabase"
// In a real app we'd share the exact calculation logic from `@fittrack/utils` here,
// but for mobile we can call a Supabase edge function or calculate it directly.
// For now, we'll implement a lightweight version of the profile update directly.

const STEPS = [
  { id: "basics", title: "The Basics" },
  { id: "metrics", title: "Body Metrics" },
  { id: "goals", title: "Your Goals" },
]

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)

  // Form State
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [heightCm, setHeightCm] = useState("")
  const [weightKg, setWeightKg] = useState("")
  const [activityLevel, setActivityLevel] = useState("moderate")
  const [goalType, setGoalType] = useState("general_health")

  async function handleComplete() {
    if (!name || !age || !heightCm || !weightKg || !goalType || !activityLevel) {
      Alert.alert("Missing Fields", "Please complete all fields.")
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not logged in")

      // Update Profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name,
          age: parseInt(age, 10),
          height_cm: parseFloat(heightCm),
          weight_kg: parseFloat(weightKg),
          goal_type: goalType,
          activity_level: activityLevel,
          onboarding_done: true,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id)

      if (profileError) throw profileError

      // Note: Ideally we calculate BMR and insert into `goals` table here just like the web app.
      // For cross-platform consistency, this logic should ideally live in a Supabase Edge Function
      // called via `supabase.functions.invoke('onboarding', { body: ... })`.
      // For now, we rely on the profile update and defaults will fallback in the UI.

      router.replace("/(tabs)")
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save profile")
    } finally {
      setLoading(false)
    }
  }

  function handleNext() {
    if (currentStep === 0 && (!name || !age)) {
      Alert.alert("Required", "Please enter your name and age.")
      return
    }
    if (currentStep === 1 && (!heightCm || !weightKg)) {
      Alert.alert("Required", "Please enter your height and weight.")
      return
    }
    setCurrentStep((p) => Math.min(p + 1, STEPS.length - 1))
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
        <View className="flex-row justify-between items-center mb-8">
          {STEPS.map((step, idx) => {
            const isActive = idx === currentStep
            const isPassed = idx < currentStep
            return (
              <View key={step.id} className="flex-1 items-center">
                <View 
                  className={`w-10 h-10 rounded-full items-center justify-center border-2 ${
                    isActive ? "border-primary bg-[hsl(162,97%,43%,0.2)]" : 
                    isPassed ? "border-primary bg-primary" : "border-border bg-card"
                  }`}
                >
                  <Text className={`font-bold ${isActive ? "text-primary" : isPassed ? "text-primary-foreground" : "text-muted-foreground"}`}>
                    {idx + 1}
                  </Text>
                </View>
                <Text className={`text-xs mt-2 font-medium ${isActive || isPassed ? "text-foreground" : "text-muted-foreground"}`}>
                  {step.title}
                </Text>
              </View>
            )
          })}
        </View>

        {currentStep === 0 && (
          <View className="space-y-4 gap-4 animate-fade-in">
            <View>
              <Text className="text-sm font-medium text-foreground mb-1.5 ml-1">What should we call you?</Text>
              <TextInput
                className="w-full h-12 bg-input border border-border rounded-xl px-4 text-foreground"
                placeholder="e.g. Alex"
                placeholderTextColor="hsl(215, 20%, 45%)"
                value={name}
                onChangeText={setName}
              />
            </View>
            <View>
              <Text className="text-sm font-medium text-foreground mb-1.5 ml-1">How old are you?</Text>
              <TextInput
                className="w-full h-12 bg-input border border-border rounded-xl px-4 text-foreground"
                placeholder="Years"
                placeholderTextColor="hsl(215, 20%, 45%)"
                keyboardType="number-pad"
                value={age}
                onChangeText={setAge}
              />
            </View>
          </View>
        )}

        {currentStep === 1 && (
          <View className="space-y-4 gap-4 animate-fade-in">
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-sm font-medium text-foreground mb-1.5 ml-1">Height (cm)</Text>
                <TextInput
                  className="w-full h-12 bg-input border border-border rounded-xl px-4 text-foreground"
                  placeholder="175"
                  placeholderTextColor="hsl(215, 20%, 45%)"
                  keyboardType="decimal-pad"
                  value={heightCm}
                  onChangeText={setHeightCm}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-foreground mb-1.5 ml-1">Weight (kg)</Text>
                <TextInput
                  className="w-full h-12 bg-input border border-border rounded-xl px-4 text-foreground"
                  placeholder="70"
                  placeholderTextColor="hsl(215, 20%, 45%)"
                  keyboardType="decimal-pad"
                  value={weightKg}
                  onChangeText={setWeightKg}
                />
              </View>
            </View>
            <View>
              <Text className="text-sm font-medium text-foreground mb-2 ml-1 mt-2">Activity Level</Text>
              <View className="flex-row flex-wrap gap-2">
                {[
                  { id: "sedentary", label: "Sedentary" },
                  { id: "light", label: "Light" },
                  { id: "moderate", label: "Moderate" },
                  { id: "active", label: "Active" },
                  { id: "very_active", label: "Very Active" }
                ].map(level => (
                  <Pressable
                    key={level.id}
                    onPress={() => setActivityLevel(level.id)}
                    className={`px-4 py-2.5 rounded-lg border ${
                      activityLevel === level.id ? "border-primary bg-[hsl(162,97%,43%,0.15)]" : "border-border bg-card"
                    }`}
                  >
                    <Text className={`font-medium ${activityLevel === level.id ? "text-primary" : "text-muted-foreground"}`}>
                      {level.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        )}

        {currentStep === 2 && (
          <View className="space-y-4 gap-3 animate-fade-in">
            <Text className="text-sm font-medium text-foreground mb-1.5 ml-1">What is your primary goal?</Text>
            {[
              { id: "lose_weight", label: "Lose Weight", icon: "📉" },
              { id: "gain_muscle", label: "Gain Muscle", icon: "💪" },
              { id: "maintain", label: "Maintain Weight", icon: "⚖️" },
              { id: "endurance", label: "Improve Endurance", icon: "🏃" },
              { id: "general_health", label: "General Health", icon: "❤️" },
            ].map(goal => (
              <Pressable
                key={goal.id}
                onPress={() => setGoalType(goal.id)}
                className={`flex-row items-center gap-4 p-4 rounded-xl border ${
                  goalType === goal.id ? "border-primary bg-[hsl(162,97%,43%,0.15)]" : "border-border bg-card"
                }`}
              >
                <Text className="text-2xl">{goal.icon}</Text>
                <Text className={`font-medium text-base ${goalType === goal.id ? "text-primary" : "text-foreground"}`}>
                  {goal.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <View className="flex-row justify-between mt-10">
          <Pressable 
            onPress={() => setCurrentStep(p => Math.max(p - 1, 0))}
            className={`px-6 py-3 rounded-xl ${currentStep === 0 ? "opacity-0" : "opacity-100"}`}
            disabled={currentStep === 0 || loading}
          >
            <Text className="text-foreground font-medium">Back</Text>
          </Pressable>

          {currentStep < STEPS.length - 1 ? (
            <Pressable 
              onPress={handleNext}
              className="px-8 py-3 bg-card border border-border rounded-xl active:scale-95"
            >
              <Text className="text-foreground font-medium">Next</Text>
            </Pressable>
          ) : (
            <Pressable 
              onPress={handleComplete}
              disabled={loading}
              className="px-8 py-3 bg-primary rounded-xl active:scale-95 items-center justify-center"
            >
              {loading ? <ActivityIndicator color="hsl(222, 47%, 7%)" /> : <Text className="text-primary-foreground font-semibold">Complete Setup</Text>}
            </Pressable>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
