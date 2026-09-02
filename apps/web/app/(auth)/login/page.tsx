import type { Metadata } from "next"
import { Suspense } from "react"
import { LoginForm } from "./login-form"

export const metadata: Metadata = { title: "Sign In" }

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Sign in to your FitTrack account
        </p>
      </div>
      <Suspense fallback={<div className="h-40 animate-pulse bg-[hsl(var(--muted))] rounded-xl" />}>
        <LoginForm />
      </Suspense>
      <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
        Don&apos;t have an account?{" "}
        <a href="/signup" className="text-[hsl(var(--primary))] font-medium hover:underline">
          Create one
        </a>
      </p>
    </div>
  )
}
