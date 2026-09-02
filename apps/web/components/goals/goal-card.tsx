"use client"

import { useState } from "react"
import { Trash2, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import type { Goal } from "@fittrack/types"
import { updateGoal, removeGoal } from "@/app/actions/goals"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

export function GoalCard({ goal }: { goal: Goal }) {
  const [newValue, setNewValue] = useState(goal.current_value.toString())
  const [isUpdating, setIsUpdating] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const progressPercentage = Math.min(Math.round((goal.current_value / goal.target_value) * 100), 100)

  const handleUpdate = async () => {
    const val = parseFloat(newValue)
    if (isNaN(val)) return

    setIsUpdating(true)
    const result = await updateGoal(goal.id, val)
    setIsUpdating(false)

    if (!result.success) {
      toast.error(result.error)
    } else {
      toast.success("Goal progress updated!")
    }
  }

  const handleRemove = async () => {
    setIsRemoving(true)
    const result = await removeGoal(goal.id)
    setIsRemoving(false)

    if (!result.success) {
      toast.error(result.error)
    } else {
      toast.success("Goal removed")
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-lg font-bold line-clamp-1" title={goal.title}>
          {goal.title}
        </CardTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--error))]"
          onClick={handleRemove}
          loading={isRemoving}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[hsl(var(--muted-foreground))]">Progress</span>
          <span className="font-medium">
            {goal.current_value} / {goal.target_value} {goal.unit}
          </span>
        </div>
        
        <Progress value={progressPercentage} className="h-2" />
        
        <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
          <span>{progressPercentage}% completed</span>
          {goal.deadline && (
            <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-4 border-t border-[hsl(var(--border))]">
        <div className="flex items-center w-full gap-2">
          <Input 
            type="number" 
            step="any"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="h-8"
          />
          <Button size="sm" onClick={handleUpdate} loading={isUpdating}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Update
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
