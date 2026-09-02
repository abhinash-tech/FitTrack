/**
 * Web app Supabase browser client (singleton)
 * Use this in all "use client" components and client-side hooks
 */

import { createBrowserClient } from "@supabase/ssr"

function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Singleton instance
let client: ReturnType<typeof createClient> | undefined

export function getSupabaseBrowserClient() {
  if (!client) {
    client = createClient()
  }
  return client
}
