"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { GoalSchema, type GoalInput } from "@fittrack/validation"
import { createGoal } from "@/app/actions/goals"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

const goalTypes = [
  { value: "water", label: "Water" },
  { value: "steps", label: "Steps" },
  { value: "weight", label: "Weight" },
  { value: "sleep", label: "Sleep" },
  { value: "workout_frequency", label: "Workout Frequency" },
  { value: "calories", label: "Calories" },
  { value: "distance", label: "Distance" },
  { value: "custom", label: "Custom" },
]

export function CreateGoalModal() {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GoalInput>({
    resolver: zodResolver(GoalSchema),
    defaultValues: {
      type: "custom",
      title: "",
      target_value: 0,
      unit: "",
      deadline: "",
    },
  })

  const onSubmit = async (data: GoalInput) => {
    // deadline string may be empty if optional
    if (data.deadline === "") data.deadline = null

    const result = await createGoal(data)
    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success("Goal created successfully!")
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Goal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Goal</DialogTitle>
          <DialogDescription>
            Set a new target to track your progress.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Goal Type</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {goalTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && <p className="mt-1.5 text-xs text-[hsl(var(--error))]">{errors.type.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              placeholder="E.g., Drink 2L of water daily"
              error={errors.title?.message}
              {...register("title")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Target Value</Label>
              <Input
                type="number"
                step="any"
                placeholder="0"
                error={errors.target_value?.message}
                {...register("target_value", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>Unit (Optional)</Label>
              <Input
                placeholder="E.g., kg, ml, steps"
                error={errors.unit?.message}
                {...register("unit")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Deadline (Optional)</Label>
            <Input
              type="date"
              error={errors.deadline?.message}
              {...register("deadline")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Create Goal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
