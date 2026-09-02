import type { Metadata } from "next"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OnboardingWizard } from "./wizard"

export const metadata: Metadata = {
  title: "Welcome to FitTrack",
}

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if already onboarded
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_done")
    .eq("id", user.id)
    .single()

  if (profile?.onboarding_done) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <OnboardingWizard />
        </div>
      </div>
    </div>
  )
}
