"use server"

import { GeminiNutritionProvider } from "@fittrack/business-logic"
import { FoodAnalysisResult, NutritionValues } from "@fittrack/types"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function parseFoodInput(text: string): Promise<{ data: FoodAnalysisResult | null, error: string | null }> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { data: null, error: "Unauthorized" }
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return { data: null, error: "AI provider is not configured." }
    }

    const provider = new GeminiNutritionProvider(apiKey)
    
    // 1. Check AI Cache (Simplified version - in a real app, you'd query ai_nutrition_cache here)

    // 2. Parse using Gemini
    const result = await provider.parseFoodText(text)

    if (result.needsClarification) {
      return { data: result, error: null }
    }

    // 3. Resolve against local DB
    for (const food of result.foods) {
      // Clean up the search term (replace underscores with spaces for DB search)
      const searchTerm = food.nameNormalized.replace(/_/g, " ").toLowerCase()

      // Try to find the food in the database
      // Using an exact or ilike match on foods.name or food_aliases
      const { data: dbFood } = await supabase
        .from('foods')
        .select(`
          id, 
          name, 
          calories_per_100g, 
          protein_per_100g, 
          carbs_per_100g, 
          fat_per_100g, 
          fiber_per_100g,
          food_servings (
            serving_desc,
            weight_g
          )
        `)
        .ilike('name', `%${searchTerm}%`)
        .limit(1)
        .single()

      if (dbFood) {
        // We found a match!
        food.matchedFoodId = dbFood.id
        
        // Find the matching serving size
        const serving = dbFood.food_servings?.find((s: any) => 
          s.serving_desc.toLowerCase() === food.unit.toLowerCase()
        ) || dbFood.food_servings?.[0] // Fallback to first serving if specific unit not found

        const weightGrams = serving ? serving.weight_g : 100 // Default to 100g if no serving found
        const totalGrams = weightGrams * food.quantity
        const multiplier = totalGrams / 100

        // Calculate deterministic nutrition based on Priority 1/2 DB Data
        food.fallbackNutrition = {
          calories: Math.round(dbFood.calories_per_100g * multiplier),
          protein_g: Number((dbFood.protein_per_100g * multiplier).toFixed(1)),
          carbs_g: Number((dbFood.carbs_per_100g * multiplier).toFixed(1)),
          fat_g: Number((dbFood.fat_per_100g * multiplier).toFixed(1)),
          fiber_g: dbFood.fiber_per_100g ? Number((dbFood.fiber_per_100g * multiplier).toFixed(1)) : 0
        }
        
        // Upgrade confidence if we found a DB match
        food.confidence = "HIGH"
      } else {
        // Priority 4: No DB Match, request fallback estimate from AI
        try {
          const estimate = await provider.estimateFallbackNutrition(food.name, food.quantity, food.unit)
          food.fallbackNutrition = estimate
          // Lower confidence since it's an AI hallucination/estimate
          food.confidence = "LOW"
        } catch (e) {
          console.error("Fallback estimate failed for", food.name)
        }
      }
    }
    
    return { data: result, error: null }
  } catch (error: any) {
    console.error("Failed to parse food input:", error)
    return { data: null, error: error.message || "Failed to analyze food" }
  }
}

export async function logNutritionEntries(foods: any[], mealType: string): Promise<{ success: boolean, error: string | null }> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    const entries = foods.map(food => ({
      user_id: user.id,
      food_id: food.matchedFoodId || null,
      meal_type: mealType,
      food_name: food.name,
      quantity: food.quantity,
      unit: food.unit,
      quantity_g: food.fallbackNutrition ? (food.quantity * 100) : 0, // Roughly estimating back if we didn't store grams explicitly
      calories: food.fallbackNutrition?.calories || 0,
      protein_g: food.fallbackNutrition?.protein_g || 0,
      carbs_g: food.fallbackNutrition?.carbs_g || 0,
      fat_g: food.fallbackNutrition?.fat_g || 0,
      fiber_g: food.fallbackNutrition?.fiber_g || 0,
      source_used: food.confidence === "LOW" ? "AI_ESTIMATE" : "DB_MATCH",
      ai_confidence: food.confidence,
      is_edited: false
    }))

    const { error } = await supabase.from('nutrition_entries').insert(entries)

    if (error) {
      throw error
    }

    return { success: true, error: null }
  } catch (error: any) {
    console.error("Failed to log nutrition entries:", error)
    return { success: false, error: error.message || "Failed to log entries" }
  }
}
