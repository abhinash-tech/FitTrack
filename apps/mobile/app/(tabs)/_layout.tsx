import { Tabs } from "expo-router"
import { Platform } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
// We'll use simple text/icons for now, or Lucide icons if installed.
// Assuming lucide-react-native is not explicitly in package.json yet, we'll use a placeholder or install it.

export default function TabLayout() {
  const insets = useSafeAreaInsets()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "hsl(222, 44%, 11%)", // surface color
          borderTopColor: "hsl(217, 32%, 17%)", // border color
          height: Platform.OS === "ios" ? 85 : 65 + insets.bottom,
          paddingBottom: Platform.OS === "ios" ? 25 : insets.bottom + 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: "hsl(162, 97%, 43%)", // primary color
        tabBarInactiveTintColor: "hsl(215, 20%, 45%)", // muted-foreground
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabBarIcon name="Home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="hydration"
        options={{
          title: "Water",
          tabBarIcon: ({ color }) => <TabBarIcon name="Water" color={color} />,
        }}
      />
      <Tabs.Screen
        name="fitness"
        options={{
          title: "Fitness",
          tabBarIcon: ({ color }) => <TabBarIcon name="Fitness" color={color} />,
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: "Food",
          tabBarIcon: ({ color }) => <TabBarIcon name="Food" color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color }) => <TabBarIcon name="More" color={color} />,
        }}
      />
    </Tabs>
  )
}

import { Text } from "react-native"

// Temporary icon placeholder until we install a proper icon pack for react-native
function TabBarIcon({ name, color }: { name: string; color: any }) {
  // Map names to emojis for a quick fallback
  const emojiMap: Record<string, string> = {
    Home: "📊",
    Water: "💧",
    Fitness: "🏃",
    Food: "🥗",
    More: "⋯",
  }
  return (
    <Text style={{ fontSize: 20, color: color as string }}>{emojiMap[name]}</Text>
  )
}
