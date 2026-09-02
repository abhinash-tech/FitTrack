import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
// We would ideally import GeminiProvider here, but for Deno Edge Functions, it's easier to implement directly or bundle.
// For simplicity in this demo environment, we'll inline the fetch to Gemini.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text } = await req.json()
    if (!text) throw new Error("text is required")

    // Get the JWT from the auth header
    const authHeader = req.headers.get('Authorization')!
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Verify user
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiKey) throw new Error("GEMINI_API_KEY is not set")

    // 1. Call Gemini for parsing
    const PROMPT = `You are a nutrition extraction assistant specializing in Indian cuisine.
    Extract foods, quantities, and units from the user text. Return ONLY valid JSON.
    Format: { "foods": [{ "name": "string", "nameNormalized": "string", "quantity": number, "unit": "string", "confidence": "HIGH|MEDIUM|LOW" }], "needsClarification": boolean }`
    
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: PROMPT }] },
        contents: [{ role: "user", parts: [{ text }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.1 }
      })
    })

    if (!geminiRes.ok) throw new Error("Gemini API failed")
    const geminiData = await geminiRes.json()
    const result = JSON.parse(geminiData.candidates[0].content.parts[0].text)

    if (result.needsClarification) {
      return new Response(JSON.stringify({ data: result }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // 2. Resolve against DB
    for (const food of result.foods) {
      const searchTerm = food.nameNormalized.replace(/_/g, " ").toLowerCase()
      
      const { data: dbFood } = await supabaseClient
        .from('foods')
        .select('id, name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, food_servings(serving_desc, weight_g)')
        .ilike('name', `%${searchTerm}%`)
        .limit(1)
        .single()

      if (dbFood) {
        food.matchedFoodId = dbFood.id
        const serving = dbFood.food_servings?.find((s: any) => s.serving_desc.toLowerCase() === food.unit.toLowerCase()) || dbFood.food_servings?.[0]
        const weightGrams = serving ? serving.weight_g : 100
        const mult = (weightGrams * food.quantity) / 100

        food.fallbackNutrition = {
          calories: Math.round(dbFood.calories_per_100g * mult),
          protein_g: Number((dbFood.protein_per_100g * mult).toFixed(1)),
          carbs_g: Number((dbFood.carbs_per_100g * mult).toFixed(1)),
          fat_g: Number((dbFood.fat_per_100g * mult).toFixed(1)),
          fiber_g: dbFood.fiber_per_100g ? Number((dbFood.fiber_per_100g * mult).toFixed(1)) : 0
        }
        food.confidence = "HIGH"
      } else {
        // Fallback estimate
        const estRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: `Estimate nutrition for: ${food.quantity} ${food.unit} of ${food.name}. Return ONLY JSON {calories, protein_g, carbs_g, fat_g, fiber_g}` }] }],
            generationConfig: { responseMimeType: "application/json", temperature: 0.2 }
          })
        })
        if (estRes.ok) {
          const estData = await estRes.json()
          food.fallbackNutrition = JSON.parse(estData.candidates[0].content.parts[0].text)
          food.confidence = "LOW"
        }
      }
    }

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
