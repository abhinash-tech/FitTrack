import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/cn"

const progressVariants = cva("h-full w-full flex-1 transition-all duration-500 ease-out rounded-full", {
  variants: {
    variant: {
      default: "bg-[hsl(var(--primary))]",
      success: "bg-[hsl(var(--success))]",
      warning: "bg-[hsl(var(--warning))]",
      error: "bg-[hsl(var(--error))]",
      secondary: "bg-[hsl(var(--secondary))]",
    },
  },
  defaultVariants: { variant: "default" },
})

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(progressVariants({ variant }))}
      style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
