"use client"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SleepChartPoint } from "@fittrack/business-logic"
import { formatSleepDurationLabel } from "@fittrack/business-logic"
import { BarChart3 } from "lucide-react"

interface SleepWeeklyChartProps {
  data: SleepChartPoint[]
  targetHours: number
}

function getBarColor(point: SleepChartPoint): string {
  if (!point.quality) return "hsl(217, 32%, 25%)"
  if (point.quality >= 4) return "hsl(162, 97%, 43%)"
  if (point.quality === 3) return "hsl(45, 100%, 51%)"
  return "hsl(0, 75%, 55%)"
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const d: SleepChartPoint = payload[0]?.payload
  return (
    <div className="bg-[hsl(222,44%,11%)] border border-[hsl(217,32%,17%)] rounded-lg p-3 text-xs space-y-1 shadow-xl">
      <p className="font-semibold text-[hsl(210,40%,98%)]">{label}</p>
      <p className="text-[hsl(215,20%,65%)]">
        Duration: <span className="text-[hsl(210,40%,98%)] font-medium">{formatSleepDurationLabel(d.durationMinutes)}</span>
      </p>
      {d.quality && (
        <p className="text-[hsl(215,20%,65%)]">
          Quality: <span className="text-[hsl(210,40%,98%)] font-medium">{d.qualityInfo?.emoji} {d.qualityInfo?.label}</span>
        </p>
      )}
      {d.notes && <p className="text-[hsl(215,20%,55%)] italic max-w-[180px]">{d.notes}</p>}
    </div>
  )
}

export function SleepWeeklyChart({ data, targetHours }: SleepWeeklyChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-5 w-5 text-[hsl(var(--secondary))]" />
          7-Day Sleep History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barCategoryGap="30%">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(217, 32%, 17%)"
              vertical={false}
            />
            <XAxis
              dataKey="dayLabel"
              tick={{ fill: "hsl(215, 20%, 45%)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, Math.max(targetHours + 2, 10)]}
              tick={{ fill: "hsl(215, 20%, 45%)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}h`}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(217,32%,14%)" }} />
            <ReferenceLine
              y={targetHours}
              stroke="hsl(239, 84%, 67%)"
              strokeDasharray="5 3"
              label={{
                value: `Goal ${targetHours}h`,
                position: "insideTopRight",
                fill: "hsl(239, 84%, 67%)",
                fontSize: 10,
              }}
            />
            <Bar dataKey="durationHours" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {data.map((entry, idx) => (
                <Cell key={idx} fill={getBarColor(entry)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {/* Legend */}
        <div className="flex gap-4 mt-3 justify-center text-xs text-[hsl(215,20%,45%)]">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[hsl(162,97%,43%)]" />Good/Excellent</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[hsl(45,100%,51%)]" />Fair</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[hsl(0,75%,55%)]" />Poor</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[hsl(217,32%,25%)]" />No data</span>
        </div>
      </CardContent>
    </Card>
  )
}
