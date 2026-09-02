import type { Metadata } from "next"
import { SignUpForm } from "./signup-form"

export const metadata: Metadata = { title: "Create Account" }

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Start your wellness journey</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Create your free FitTrack account
        </p>
      </div>
      <SignUpForm />
      <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
        Already have an account?{" "}
        <a href="/login" className="text-[hsl(var(--primary))] font-medium hover:underline">
          Sign in
        </a>
      </p>
    </div>
  )
}
