import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary))] flex items-center justify-center shadow-[0_0_20px_var(--primary-glow)]">
            <span className="text-xl">💧</span>
          </div>
          <span className="text-2xl font-bold tracking-tight">FitTrack</span>
        </div>
        {children}
      </div>
    </div>
  )
}
