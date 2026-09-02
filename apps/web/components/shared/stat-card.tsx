import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/cn"

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  subtitle?: string
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
  className?: string
  valueClassName?: string
}

export function StatCard({
  title,
  value,
  icon,
  subtitle,
  trend,
  className,
  valueClassName,
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden relative", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
            {title}
          </p>
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center text-[hsl(var(--primary))]">
            {icon}
          </div>
        </div>
        
        <div className="mt-4 flex items-baseline gap-2">
          <h2 className={cn("text-3xl font-bold tracking-tight", valueClassName)}>
            {value}
          </h2>
          {subtitle && (
            <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
              {subtitle}
            </span>
          )}
        </div>

        {trend && (
          <p className="mt-2 text-xs font-medium">
            <span
              className={
                trend.isPositive
                  ? "text-[hsl(var(--success))]"
                  : "text-[hsl(var(--error))]"
              }
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>{" "}
            <span className="text-[hsl(var(--muted-foreground))]">
              {trend.label}
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
