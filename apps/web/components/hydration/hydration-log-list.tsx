"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Droplets, Trash2, Clock } from "lucide-react"
import { formatTime, formatWater } from "@fittrack/utils"
import { toast } from "sonner"

export interface HydrationLogItem {
  id: string
  amountMl: number
  created_at: string
  source?: string
  note?: string
}

interface HydrationLogListProps {
  logs: HydrationLogItem[]
  onDeleteLog: (id: string, amountMl: number) => Promise<void>
}

export function HydrationLogList({ logs, onDeleteLog }: HydrationLogListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string, amountMl: number) {
    setDeletingId(id)
    try {
      await onDeleteLog(id, amountMl)
      toast.success("Hydration log removed")
    } catch (err: any) {
      toast.error(err.message || "Failed to remove log")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Today's Water Log</CardTitle>
        <CardDescription className="text-xs">Detailed timeline of logged water entries</CardDescription>
      </CardHeader>

      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-xs text-[hsl(var(--muted-foreground))]">
            No water logged yet today. Click a quick-add preset above! 💧
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background-surface))]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary)/0.15)] flex items-center justify-center text-[hsl(var(--primary))]">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                      +{formatWater(log.amountMl)}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--muted-foreground))]">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(log.created_at)}</span>
                      {log.source && <span className="capitalize">• {log.source.replace("_", " ")}</span>}
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  loading={deletingId === log.id}
                  disabled={deletingId !== null}
                  onClick={() => handleDelete(log.id, log.amountMl)}
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--error))]"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
