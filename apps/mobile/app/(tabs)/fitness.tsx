import { useState } from "react"
import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function FitnessScreen() {
  const insets = useSafeAreaInsets()

  const [category, setCategory] = useState("full_body")
  const [exerciseName, setExerciseName] = useState("")
  const [duration, setDuration] = useState("30")
  const [calories, setCalories] = useState("200")
  const [workouts, setWorkouts] = useState([
    { id: "1", name: "Morning Jog", duration: 25, calories: 180, category: "cardio" },
    { id: "2", name: "Core & Abs Workout", duration: 15, calories: 90, category: "abs" },
  ])

  function handleLogWorkout() {
    if (!exerciseName.trim()) {
      Alert.alert("Missing Name", "Please enter an exercise or workout name.")
      return
    }

    const newWorkout = {
      id: Date.now().toString(),
      name: exerciseName.trim(),
      duration: parseInt(duration, 10) || 30,
      calories: parseInt(calories, 10) || 150,
      category,
    }

    setWorkouts([newWorkout, ...workouts])
    setExerciseName("")
    Alert.alert("Logged 🏋️", `Logged ${newWorkout.name}!`)
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}>
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Fitness & Activity 🏋️</Text>
          <Text className="text-sm text-muted-foreground mt-1">Track your workouts and daily movement</Text>
        </View>

        {/* Quick Log Form */}
        <View className="p-5 rounded-2xl bg-card border border-border mb-6">
          <Text className="text-base font-semibold text-foreground mb-3">Log Workout Session</Text>

          {/* Category Badges */}
          <Text className="text-xs font-medium text-muted-foreground mb-2">Category</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {[
              { id: "full_body", label: "Full Body 🏋️" },
              { id: "cardio", label: "Cardio 🏃" },
              { id: "abs", label: "Abs 🍫" },
              { id: "legs", label: "Legs 🦵" },
            ].map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => setCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg border ${
                  category === cat.id ? "border-primary bg-[hsl(162,97%,43%,0.15)]" : "border-border bg-surface"
                }`}
              >
                <Text className={`text-xs font-semibold ${category === cat.id ? "text-primary" : "text-muted-foreground"}`}>
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Exercise Name */}
          <Text className="text-xs font-medium text-muted-foreground mb-1">Exercise Name</Text>
          <TextInput
            className="w-full h-11 bg-input border border-border rounded-xl px-4 text-foreground text-sm mb-3"
            placeholder="e.g. Bodyweight Circuit"
            placeholderTextColor="hsl(215, 20%, 45%)"
            value={exerciseName}
            onChangeText={setExerciseName}
          />

          {/* Duration & Calories Inputs */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-xs font-medium text-muted-foreground mb-1">Duration (mins)</Text>
              <TextInput
                className="w-full h-11 bg-input border border-border rounded-xl px-4 text-foreground text-sm"
                keyboardType="number-pad"
                value={duration}
                onChangeText={setDuration}
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-medium text-muted-foreground mb-1">Burn (kcal)</Text>
              <TextInput
                className="w-full h-11 bg-input border border-border rounded-xl px-4 text-foreground text-sm"
                keyboardType="number-pad"
                value={calories}
                onChangeText={setCalories}
              />
            </View>
          </View>

          <Pressable
            onPress={handleLogWorkout}
            className="w-full h-12 bg-primary items-center justify-center rounded-xl active:scale-95"
          >
            <Text className="text-primary-foreground font-semibold text-sm">+ Log Session</Text>
          </Pressable>
        </View>

        {/* Today's Log History */}
        <Text className="text-sm font-semibold text-foreground mb-3">Today's Sessions</Text>
        <View className="space-y-2 gap-2">
          {workouts.map((item) => (
            <View key={item.id} className="p-4 rounded-xl bg-card border border-border flex-row justify-between items-center">
              <View>
                <Text className="text-sm font-semibold text-foreground">{item.name}</Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  {item.duration} mins • {item.calories} kcal burned
                </Text>
              </View>
              <View className="px-2.5 py-1 rounded-md bg-surface border border-border">
                <Text className="text-[10px] font-semibold text-primary uppercase">{item.category}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}
