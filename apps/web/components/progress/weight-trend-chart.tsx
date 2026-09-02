"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { WeightEntry } from "@fittrack/types"
import { formatWeightChartData } from "@fittrack/business-logic"

export function WeightTrendChart({ data }: { data: WeightEntry[] }) {
  const chartData = formatWeightChartData(data)
  
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Weight Trend</CardTitle></CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No weight data logged yet.</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate min and max for Y-axis domain
  const weights = chartData.map(d => d.weight)
  const min = Math.floor(Math.min(...weights) - 2)
  const max = Math.ceil(Math.max(...weights) + 2)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weight Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(162 97% 43%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(162 97% 43%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="displayDate" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                domain={[min, max]}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--background-surface))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                itemStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Area 
                type="monotone" 
                dataKey="weight" 
                name="Weight (kg)"
                stroke="hsl(162 97% 43%)" 
                fillOpacity={1} 
                fill="url(#colorWeight)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
