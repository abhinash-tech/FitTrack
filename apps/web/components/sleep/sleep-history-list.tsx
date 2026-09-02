"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { deleteSleepEntry } from "@/app/actions/sleep"
import { getSleepQualityInfo, formatSleepDurationLabel } from "@fittrack/business-logic"
import type { SleepEntry } from "@fittrack/types"
import { formatTime, formatDateLabel } from "@fittrack/utils"
import { Trash2, Moon, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/cn"

interface SleepHistoryListProps {
  entries: SleepEntry[]
}

export function SleepHistoryList({ entries }: SleepHistoryListProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const { success, error } = await deleteSleepEntry(id)
    setDeletingId(null)
    if (success) {
      toast({ title: "Entry deleted", variant: "success" })
      router.refresh()
    } else {
      toast({ title: "Failed to delete", description: error ?? "", variant: "error" })
    }
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Moon className="h-5 w-5 text-[hsl(var(--secondary))]" />
            Sleep History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
            <Moon className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No sleep entries yet.</p>
            <p className="text-xs mt-1">Log your first night's sleep above.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Moon className="h-5 w-5 text-[hsl(var(--secondary))]" />
          Sleep History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-4">
        {entries.map((entry) => {
          const qualityInfo = entry.quality ? getSleepQualityInfo(entry.quality) : null
          const isDeleting = deletingId === entry.id
          return (
            <div
              key={entry.id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background-surface)/0.5)] hover:bg-[hsl(var(--muted)/0.5)] transition-colors"
            >
              {/* Left: date + times */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[hsl(var(--secondary)/0.1)] flex items-center justify-center shrink-0">
                  <span className="text-base">{qualityInfo?.emoji ?? "😴"}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                      {formatDateLabel(entry.date)}
                    </p>
                    <span className="text-xs font-bold text-[hsl(var(--secondary))] shrink-0">
                      {formatSleepDurationLabel(entry.duration_min ?? 0)}
                    </span>
                  </div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {formatTime(entry.bedtime)} → {formatTime(entry.wake_time)}
                  </p>
                  {entry.notes && (
                    <p className="text-xs text-[hsl(var(--muted-foreground))] italic truncate max-w-[200px] mt-0.5">
                      {entry.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: quality + delete */}
              <div className="flex items-center gap-2 shrink-0">
                {qualityInfo && (
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] py-0.5 px-2", qualityInfo.colorClass)}
                  >
                    {qualityInfo.label}
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 hover:border-red-500/50 hover:text-red-400"
                  onClick={() => handleDelete(entry.id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
