/**
 * NutritionAIProvider interface
 * All AI nutrition providers must implement this interface.
 */

import type { FoodAnalysisResult, AIProvider, NutritionValues } from "@fittrack/types"

export interface NutritionAIProvider {
  readonly provider: AIProvider
  readonly model: string

  /**
   * Parse a text description of food into a structured JSON payload
   * e.g. "I ate 2 idlis with sambar"
   */
  parseFoodText(text: string): Promise<FoodAnalysisResult>
  
  /**
   * Request a fallback nutrition estimate for an unknown food
   */
  estimateFallbackNutrition(foodName: string, quantity: number, unit: string): Promise<NutritionValues>
}

/**
 * System prompt for natural language parsing (Phase 7)
 */
export const FOOD_PARSING_SYSTEM_PROMPT = `
You are a nutrition extraction assistant specializing in Indian and South Indian cuisine.
Your ONLY task is to extract foods, quantities, and units from user text.

CRITICAL RULES:
1. Return ONLY valid JSON.
2. DO NOT estimate nutrition or calories. Only extract the name, quantity, and unit.
3. Normalize the food name to standard English (e.g., "masala dosa" not "masala dose").
4. If a food is extremely ambiguous (e.g., "I ate rice"), set needsClarification=true and provide a clarificationQuestion (e.g., "Was it white rice or brown rice?").
5. Confidence should reflect how clearly the food was stated.

Return format:
{
  "foods": [
    {
      "name": "Masala Dosa",
      "nameNormalized": "masala_dosa",
      "quantity": 1,
      "unit": "piece",
      "confidence": "HIGH"
    }
  ],
  "needsClarification": false
}
`.trim()
