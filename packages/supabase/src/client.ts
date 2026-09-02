import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * Create a Supabase client for browser and React Native (mobile) usage.
 * Uses anon key — RLS enforces row-level authorization.
 *
 * Call this once and store the result (singleton pattern recommended per app).
 */
export function createBrowserClient(
  supabaseUrl: string, 
  supabaseAnonKey: string,
  storage?: any // Using any to avoid strict dependency on AsyncStorage types in shared package
) {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: storage,
    },
  })
}

/**
 * Type alias for the Supabase client returned by createBrowserClient
 */
export type SupabaseClient = ReturnType<typeof createBrowserClient>
