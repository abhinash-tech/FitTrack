import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/cn"

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading this data.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-[hsl(var(--error)/0.2)] bg-[hsl(var(--error)/0.05)] p-6 text-center animate-fade-in",
        className
      )}
    >
      <AlertCircle className="h-10 w-10 text-[hsl(var(--error))] mb-4" />
      <h3 className="text-base font-semibold text-[hsl(var(--error))]">{title}</h3>
      <p className="mt-2 mb-5 text-sm text-[hsl(var(--muted-foreground))]">
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  )
}
