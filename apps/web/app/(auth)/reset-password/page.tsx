import type { Metadata } from "next"
import { ResetPasswordForm } from "./reset-password-form"

export const metadata: Metadata = { title: "Reset Password" }

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>
      <ResetPasswordForm />
      <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
        <a href="/login" className="text-[hsl(var(--primary))] font-medium hover:underline">
          Back to sign in
        </a>
      </p>
    </div>
  )
}
