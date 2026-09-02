import AsyncStorage from "@react-native-async-storage/async-storage"
import { createBrowserClient } from "@fittrack/supabase/src/client"
import { Platform } from "react-native"

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "placeholder_anon_key"

export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey,
  Platform.OS !== "web" ? AsyncStorage : undefined
)
