/**
 * Progress & Body Metrics Business Logic
 */

import { WeightEntry, BodyMeasurement } from "@fittrack/types"
import { format, parseISO } from "date-fns"

export interface BMICategory {
  category: string
  colorClass: string
  textColor: string
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  if (!weightKg || !heightCm || heightCm <= 0) return 0
  const heightM = heightCm / 100
  return weightKg / (heightM * heightM)
}

export function getBMICategory(bmi: number): BMICategory {
  if (bmi === 0) return { category: "Unknown", colorClass: "bg-gray-500", textColor: "text-gray-500" }
  if (bmi < 18.5) return { category: "Underweight", colorClass: "bg-blue-400", textColor: "text-blue-400" }
  if (bmi >= 18.5 && bmi < 25) return { category: "Normal", colorClass: "bg-green-500", textColor: "text-green-500" }
  if (bmi >= 25 && bmi < 30) return { category: "Overweight", colorClass: "bg-amber-500", textColor: "text-amber-500" }
  return { category: "Obese", colorClass: "bg-red-500", textColor: "text-red-500" }
}

export function calculateWeightTrend(currentWeight: number, previousWeight: number) {
  if (!previousWeight) return { diff: 0, trend: "neutral" as const, percentage: 0 }
  
  const diff = currentWeight - previousWeight
  const percentage = (diff / previousWeight) * 100
  
  let trend: "up" | "down" | "neutral" = "neutral"
  if (diff > 0.1) trend = "up"
  if (diff < -0.1) trend = "down"
  
  return { diff, trend, percentage }
}

export function formatWeightChartData(entries: WeightEntry[]) {
  // Sort entries ascending for the chart
  const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  return sorted.map(entry => ({
    date: entry.date,
    displayDate: format(parseISO(entry.date), "MMM d"),
    weight: entry.weight_kg
  }))
}

export function formatMeasurementsChartData(entries: BodyMeasurement[]) {
  const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  return sorted.map(entry => ({
    date: entry.date,
    displayDate: format(parseISO(entry.date), "MMM d"),
    waist: entry.waist_cm || null,
    chest: entry.chest_cm || null,
    arms: entry.arms_cm || null,
    thighs: entry.thighs_cm || null,
  }))
}
