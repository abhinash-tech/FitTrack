"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts"

interface HydrationChartProps {
  weeklyData: { day: string; amountMl: number; goalMl: number }[]
}

export function HydrationChart({ weeklyData }: HydrationChartProps) {
  const averageMl = Math.round(
    weeklyData.reduce((acc, curr) => acc + curr.amountMl, 0) / (weeklyData.length || 1)
  )
  const goalMl = weeklyData[0]?.goalMl || 2500

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Hydration Analytics</CardTitle>
            <CardDescription className="text-xs">
              Weekly intake vs 7-day average ({averageMl} ml/day)
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 32% 17%)" vertical={false} />
              <XAxis
                dataKey="day"
                stroke="hsl(215 20% 45%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(215 20% 45%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val / 1000}L`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222 44% 11%)",
                  borderColor: "hsl(217 32% 17%)",
                  borderRadius: "0.75rem",
                  color: "hsl(210 40% 98%)",
                }}
                formatter={(value: any) => [`${value} ml`, "Intake"]}
              />
              <ReferenceLine
                y={goalMl}
                stroke="hsl(162 97% 43%)"
                strokeDasharray="4 4"
                label={{
                  value: "Target",
                  fill: "hsl(162 97% 43%)",
                  fontSize: 10,
                  position: "right",
                }}
              />
              <Bar
                dataKey="amountMl"
                fill="hsl(162 97% 43%)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
