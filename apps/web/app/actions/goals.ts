"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { generateId } from "@fittrack/utils"
import { insertGoal, deactivateGoal, updateGoalProgress } from "@fittrack/supabase"
import { GoalInput } from "@fittrack/validation"

export async function createGoal(data: GoalInput): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const entry = await insertGoal(supabase, {
      id: generateId(),
      user_id: user.id,
      type: data.type,
      title: data.title,
      target_value: data.target_value,
      unit: data.unit ?? null,
      deadline: data.deadline ?? null,
      is_active: true,
    })

    if (!entry) throw new Error("Failed to create goal")

    revalidatePath("/goals")
    revalidatePath("/dashboard")
    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.message ?? "Failed to create goal" }
  }
}

export async function updateGoal(id: string, currentValue: number): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const success = await updateGoalProgress(supabase, id, user.id, currentValue)
    if (!success) throw new Error("Failed to update goal")

    revalidatePath("/goals")
    revalidatePath("/dashboard")
    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.message ?? "Failed to update goal" }
  }
}

export async function removeGoal(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // Hard delete or deactivate depending on business logic, we'll deactivate for history
    const success = await deactivateGoal(supabase, id, user.id)
    if (!success) throw new Error("Failed to remove goal")

    revalidatePath("/goals")
    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.message ?? "Failed to remove goal" }
  }
}
