import { Metadata } from "next"
import { FoodLoggerForm } from "@/components/nutrition/food-logger-form"

export const metadata: Metadata = {
  title: "Nutrition | FitTrack",
  description: "Track your meals and calories.",
}

export default function NutritionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nutrition</h1>
        <p className="text-muted-foreground">
          Log your meals and track your macros.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <FoodLoggerForm />
        </div>
        
        <div className="space-y-6">
          {/* We will add Daily Nutrition Summary and Macro rings here later */}
          <div className="p-6 border rounded-xl bg-surface">
            <h3 className="font-medium mb-4">Daily Summary Placeholder</h3>
            <p className="text-sm text-muted-foreground">Macro tracking rings will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
