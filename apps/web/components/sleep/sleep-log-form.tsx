"use client"

import { useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SleepEntrySchema, SleepEntryInput } from "@fittrack/validation"
import { logSleepEntry } from "@/app/actions/sleep"
import { formatSleepDurationLabel } from "@fittrack/business-logic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Moon, Clock, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/cn"
import { differenceInMinutes, parseISO } from "date-fns"

const QUALITY_OPTIONS = [
  { value: 1, emoji: "😴", label: "Poor" },
  { value: 2, emoji: "😪", label: "Fair" },
  { value: 3, emoji: "😌", label: "Good" },
  { value: 4, emoji: "😊", label: "Very Good" },
  { value: 5, emoji: "🌟", label: "Excellent" },
]

export function SleepLogForm() {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedQuality, setSelectedQuality] = useState<number>(4)

  // Get today and yesterday for defaults
  const today = new Date()
  const defaultWake = `${today.toISOString().split("T")[0]}T07:30`
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const defaultBed = `${yesterday.toISOString().split("T")[0]}T23:00`

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SleepEntryInput>({
    resolver: zodResolver(SleepEntrySchema),
    defaultValues: {
      bedtime: defaultBed,
      wake_time: defaultWake,
      quality: 4,
      date: today.toISOString().split("T")[0],
    },
  })

  const bedtime = watch("bedtime")
  const wakeTime = watch("wake_time")

  // Live duration calculation
  const liveDuration = useMemo(() => {
    if (!bedtime || !wakeTime) return null
    try {
      const diff = differenceInMinutes(parseISO(wakeTime), parseISO(bedtime))
      if (diff <= 0) return null
      return formatSleepDurationLabel(diff)
    } catch {
      return null
    }
  }, [bedtime, wakeTime])

  const onSubmit = async (data: SleepEntryInput) => {
    setIsSubmitting(true)
    const result = await logSleepEntry({ ...data, quality: selectedQuality })
    setIsSubmitting(false)

    if (result.success) {
      toast({ title: "Sleep logged! 🌙", description: `${liveDuration ?? ""} recorded.`, variant: "success" })
      router.refresh()
    } else {
      toast({ title: "Failed to log sleep", description: result.error ?? "Unknown error", variant: "error" })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Moon className="h-5 w-5 text-[hsl(var(--secondary))]" />
          Log Sleep
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && <p className="text-xs text-red-400">{errors.date.message}</p>}
          </div>

          {/* Bedtime + Wake Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="bedtime">Bedtime</Label>
              <Input id="bedtime" type="datetime-local" {...register("bedtime")} />
              {errors.bedtime && <p className="text-xs text-red-400">{errors.bedtime.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wake_time">Wake Time</Label>
              <Input id="wake_time" type="datetime-local" {...register("wake_time")} />
              {errors.wake_time && <p className="text-xs text-red-400">{errors.wake_time.message}</p>}
            </div>
          </div>

          {/* Live Duration */}
          {liveDuration && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[hsl(var(--secondary)/0.1)] border border-[hsl(var(--secondary)/0.2)]">
              <Clock className="h-4 w-4 text-[hsl(var(--secondary))]" />
              <span className="text-sm font-semibold text-[hsl(var(--secondary))]">
                {liveDuration} of sleep
              </span>
            </div>
          )}

          {/* Quality Selector */}
          <div className="space-y-2">
            <Label>Sleep Quality</Label>
            <div className="flex gap-2">
              {QUALITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedQuality(opt.value)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all duration-150 text-xs font-medium",
                    selectedQuality === opt.value
                      ? "border-[hsl(var(--secondary))] bg-[hsl(var(--secondary)/0.1)] text-[hsl(var(--foreground))]"
                      : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--secondary)/0.4)]"
                  )}
                >
                  <span className="text-lg">{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="e.g. Had tea at 10 PM, woke up once..."
              rows={2}
              {...register("notes")}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging...</>
            ) : (
              "Log Sleep 🌙"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
