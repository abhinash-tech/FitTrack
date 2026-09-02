"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"
import { BodyMeasurement } from "@fittrack/types"
import { formatMeasurementsChartData } from "@fittrack/business-logic"

export function MeasurementsChart({ data }: { data: BodyMeasurement[] }) {
  const chartData = formatMeasurementsChartData(data)
  
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Body Measurements</CardTitle></CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No measurement data logged yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Body Measurements (cm)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--background-surface))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="waist" name="Waist" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} connectNulls />
              <Line type="monotone" dataKey="chest" name="Chest" stroke="#eab308" strokeWidth={2} dot={{ r: 4 }} connectNulls />
              <Line type="monotone" dataKey="arms" name="Arms" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} connectNulls />
              <Line type="monotone" dataKey="thighs" name="Thighs" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
