import { useState } from "react"
import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { formatWater } from "@fittrack/utils"

export default function HydrationScreen() {
  const insets = useSafeAreaInsets()
  const [waterMl, setWaterMl] = useState(1500)
  const targetMl = 2500
  const [customInput, setCustomInput] = useState("")

  const percent = Math.min(100, Math.round((waterMl / targetMl) * 100))

  function handleLogWater(amount: number) {
    setWaterMl((prev) => prev + amount)
    Alert.alert("Logged 💧", `Successfully added ${amount} ml!`)
  }

  function handleLogCustom() {
    const val = parseInt(customInput, 10)
    if (isNaN(val) || val <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid water amount in ml.")
      return
    }
    handleLogWater(val)
    setCustomInput("")
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}>
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Hydration Tracker 💧</Text>
          <Text className="text-sm text-muted-foreground mt-1">Stay consistent with your daily goal</Text>
        </View>

        {/* Big Circular/Bar Goal Container */}
        <View className="p-6 rounded-2xl bg-card border border-border items-center mb-6 shadow-sm">
          <Text className="text-xs uppercase font-semibold text-muted-foreground mb-1">Total Intake Today</Text>
          <Text className="text-4xl font-extrabold text-foreground mb-1">{formatWater(waterMl)}</Text>
          <Text className="text-xs font-semibold text-primary mb-4">Goal: {formatWater(targetMl)} ({percent}%)</Text>

          <View className="h-4 w-full bg-muted rounded-full overflow-hidden">
            <View className="h-full bg-primary" style={{ width: `${percent}%` }} />
          </View>
        </View>

        {/* Container Presets */}
        <Text className="text-sm font-semibold text-foreground mb-3">Quick Presets</Text>
        <View className="flex-row gap-3 mb-6">
          {[
            { label: "Glass", size: 250, icon: "🥛" },
            { label: "Bottle", size: 500, icon: "🍼" },
            { label: "Shaker", size: 750, icon: "🥤" },
          ].map((preset) => (
            <Pressable
              key={preset.size}
              onPress={() => handleLogWater(preset.size)}
              className="flex-1 p-4 bg-card border border-border rounded-xl items-center active:scale-95 shadow-sm"
            >
              <Text className="text-2xl mb-1">{preset.icon}</Text>
              <Text className="text-xs font-semibold text-foreground">{preset.label}</Text>
              <Text className="text-[10px] text-muted-foreground mt-0.5">+{preset.size} ml</Text>
            </Pressable>
          ))}
        </View>

        {/* Custom Input */}
        <Text className="text-sm font-semibold text-foreground mb-2">Custom Volume</Text>
        <View className="flex-row gap-3 mb-6">
          <TextInput
            className="flex-1 h-12 bg-input border border-border rounded-xl px-4 text-foreground text-sm"
            placeholder="Amount in ml (e.g. 350)"
            placeholderTextColor="hsl(215, 20%, 45%)"
            keyboardType="number-pad"
            value={customInput}
            onChangeText={setCustomInput}
          />
          <Pressable
            onPress={handleLogCustom}
            className="px-6 h-12 bg-primary items-center justify-center rounded-xl active:scale-95"
          >
            <Text className="text-primary-foreground font-semibold text-sm">Add</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  )
}
