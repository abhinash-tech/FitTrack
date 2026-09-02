"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { WeightEntryInput, BodyMeasurementInput } from "@fittrack/validation"
import { generateId } from "@fittrack/utils"
import { upsertWeightEntry, insertBodyMeasurement } from "@fittrack/supabase"

export async function logWeightEntry(
  data: WeightEntryInput
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const entry = await upsertWeightEntry(supabase, {
      id: generateId(),
      user_id: user.id,
      weight_kg: data.weight_kg,
      date: data.date,
      notes: data.notes ?? null,
    })

    if (!entry) throw new Error("Failed to save weight")

    revalidatePath("/progress")
    revalidatePath("/dashboard")
    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.message ?? "Failed to log weight" }
  }
}

export async function logBodyMeasurement(
  data: BodyMeasurementInput
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const entry = await insertBodyMeasurement(supabase, {
      id: generateId(),
      user_id: user.id,
      waist_cm: data.waist_cm ?? null,
      chest_cm: data.chest_cm ?? null,
      arms_cm: data.arms_cm ?? null,
      thighs_cm: data.thighs_cm ?? null,
      date: data.date,
    })

    if (!entry) throw new Error("Failed to save measurements")

    revalidatePath("/progress")
    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.message ?? "Failed to log measurements" }
  }
}

export async function deleteWeightEntryAction(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.from("weight_entries").delete().eq("id", id)
    if (error) throw error
    revalidatePath("/progress")
    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.message ?? "Failed to delete" }
  }
}

export async function deleteMeasurementEntryAction(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.from("body_measurements").delete().eq("id", id)
    if (error) throw error
    revalidatePath("/progress")
    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.message ?? "Failed to delete" }
  }
}
