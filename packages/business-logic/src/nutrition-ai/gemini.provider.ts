import { AIProvider, FoodAnalysisResult, NutritionValues } from "@fittrack/types"
import { NutritionAIProvider, FOOD_PARSING_SYSTEM_PROMPT } from "./provider.interface"

export class GeminiNutritionProvider implements NutritionAIProvider {
  readonly provider: AIProvider = "gemini"
  readonly model: string = "gemini-2.5-flash"
  private apiKey: string

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("Gemini API Key is required")
    }
    this.apiKey = apiKey
  }

  async parseFoodText(text: string): Promise<FoodAnalysisResult> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: FOOD_PARSING_SYSTEM_PROMPT }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text }]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1 // Low temperature for deterministic parsing
        }
      })
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Gemini API Error: ${err}`)
    }

    const data = await response.json()
    const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!textOutput) {
      throw new Error("Invalid response format from Gemini")
    }

    return JSON.parse(textOutput) as FoodAnalysisResult
  }

  async estimateFallbackNutrition(foodName: string, quantity: number, unit: string): Promise<NutritionValues> {
    const prompt = `Estimate the nutrition for: ${quantity} ${unit} of ${foodName}.
    Return ONLY valid JSON in this exact format:
    {
      "calories": 0,
      "protein_g": 0,
      "carbs_g": 0,
      "fat_g": 0,
      "fiber_g": 0
    }`

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      })
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Gemini API Error: ${err}`)
    }

    const data = await response.json()
    const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!textOutput) {
      throw new Error("Invalid response format from Gemini")
    }

    return JSON.parse(textOutput) as NutritionValues
  }
}
