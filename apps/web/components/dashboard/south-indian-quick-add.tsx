"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Utensils, Plus } from "lucide-react"
import { toast } from "sonner"

interface FoodItem {
  id: string
  name: string
  portion: string
  calories: number
  protein: number
  carbs: number
  fat: number
  icon: string
}

const SOUTH_INDIAN_ITEMS: FoodItem[] = [
  { id: "idli", name: "2 Idlis + Sambar", portion: "2 pcs (150g)", calories: 180, protein: 6, carbs: 36, fat: 1, icon: "🫓" },
  { id: "masala_dosa", name: "Masala Dosa", portion: "1 dosa (200g)", calories: 320, protein: 7, carbs: 48, fat: 11, icon: "🥞" },
  { id: "medu_vada", name: "Medu Vada", portion: "1 pc (60g)", calories: 190, protein: 4, carbs: 18, fat: 12, icon: "🍩" },
  { id: "ven_pongal", name: "Ven Pongal", portion: "1 bowl (200g)", calories: 280, protein: 8, carbs: 42, fat: 9, icon: "🍲" },
  { id: "curd_rice", name: "Curd Rice", portion: "1 bowl (220g)", calories: 230, protein: 6, carbs: 38, fat: 6, icon: "🍚" },
  { id: "sambar_rice", name: "Sambar Rice", portion: "1 bowl (250g)", calories: 290, protein: 9, carbs: 52, fat: 5, icon: "🍲" },
]

interface SouthIndianQuickAddProps {
  onLogFood: (food: FoodItem) => Promise<void>
}

export function SouthIndianQuickAdd({ onLogFood }: SouthIndianQuickAddProps) {
  const [loggingId, setLoggingId] = useState<string | null>(null)

  async function handleAdd(item: FoodItem) {
    setLoggingId(item.id)
    try {
      await onLogFood(item)
      toast.success(`Logged ${item.name} (${item.calories} kcal)`)
    } catch (err: any) {
      toast.error(err.message || "Failed to log food")
    } finally {
      setLoggingId(null)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--warning)/0.15)] flex items-center justify-center text-[hsl(var(--warning))]">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base">South Indian Quick-Add</CardTitle>
            <CardDescription className="text-xs">1-tap logging for popular healthy South Indian meals</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {SOUTH_INDIAN_ITEMS.map((item) => (
            <button
              key={item.id}
              disabled={loggingId !== null}
              onClick={() => handleAdd(item)}
              className="flex flex-col items-start p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background-surface))] hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--primary)/0.05)] transition-all text-left group"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xl">{item.icon}</span>
                <Plus className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] transition-colors" />
              </div>
              <span className="text-xs font-semibold text-[hsl(var(--foreground))] mt-2 line-clamp-1">
                {item.name}
              </span>
              <span className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">
                {item.calories} kcal • P:{item.protein}g
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
