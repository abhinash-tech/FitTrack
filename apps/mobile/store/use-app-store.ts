import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface AppState {
  hasSeenOnboarding: boolean
  theme: "dark" | "light" | "system"
  setHasSeenOnboarding: (value: boolean) => void
  setTheme: (theme: "dark" | "light" | "system") => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasSeenOnboarding: false,
      theme: "dark", // FitTrack defaults to dark mode
      setHasSeenOnboarding: (value) => set({ hasSeenOnboarding: value }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "fittrack-app-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
