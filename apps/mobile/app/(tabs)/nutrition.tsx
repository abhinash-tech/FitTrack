import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useSupabase } from "@/hooks/use-supabase"

export default function NutritionScreen() {
  const insets = useSafeAreaInsets()
  const supabase = useSupabase()
  
  const [input, setInput] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)
  
  const handleAnalyze = async () => {
    if (!input.trim()) return
    setIsAnalyzing(true)
    setResult(null)
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: { text: input }
      })
      
      if (error) throw error
      setResult(data.data)
    } catch (err: any) {
      Alert.alert("Analysis Failed", err.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleConfirm = async () => {
    if (!result) return
    setIsAnalyzing(true) // Reuse state for loading
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not logged in")

      const entries = result.foods.map((food: any) => ({
        user_id: user.id,
        food_id: food.matchedFoodId || null,
        meal_type: 'lunch', // Defaulting for MVP
        food_name: food.name,
        quantity: food.quantity,
        unit: food.unit,
        quantity_g: food.fallbackNutrition ? (food.quantity * 100) : 0,
        calories: food.fallbackNutrition?.calories || 0,
        protein_g: food.fallbackNutrition?.protein_g || 0,
        carbs_g: food.fallbackNutrition?.carbs_g || 0,
        fat_g: food.fallbackNutrition?.fat_g || 0,
        fiber_g: food.fallbackNutrition?.fiber_g || 0,
        source_used: food.confidence === "LOW" ? "AI_ESTIMATE" : "DB_MATCH",
        ai_confidence: food.confidence,
      }))

      const { error } = await supabase.from('nutrition_entries').insert(entries)
      if (error) throw error
      
      Alert.alert("Success", "Meal logged successfully!")
      setResult(null)
      setInput("")
    } catch (err: any) {
      Alert.alert("Failed to log", err.message)
    } finally {
      setIsAnalyzing(false)
    }
  }
  
  return (
    <ScrollView className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="px-6 pt-6 pb-20">
        <Text className="text-3xl font-bold text-foreground">Nutrition</Text>
        <Text className="text-muted-foreground mt-1">Smart Food Logger</Text>
        
        <View className="mt-8 bg-surface rounded-2xl p-4 border border-border">
          <Text className="text-foreground font-medium mb-2">What did you eat?</Text>
          <TextInput
            className="bg-background text-foreground rounded-xl p-4 h-24 border border-border"
            placeholder="e.g. 2 idlis with sambar..."
            placeholderTextColor="#64748B"
            multiline
            value={input}
            onChangeText={setInput}
            editable={!result}
          />
          
          {!result ? (
            <TouchableOpacity 
              className="mt-4 bg-primary p-4 rounded-xl items-center flex-row justify-center"
              onPress={handleAnalyze}
              disabled={isAnalyzing || !input.trim()}
            >
              {isAnalyzing ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-primary-foreground font-semibold text-lg">Analyze Meal</Text>
              )}
            </TouchableOpacity>
          ) : null}
        </View>

        {result && (
          <View className="mt-6 bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-foreground font-semibold mb-4">Analysis Result</Text>
            
            {result.needsClarification && (
              <View className="bg-amber-500/20 p-3 rounded-lg mb-4">
                <Text className="text-amber-500 font-medium">{result.clarificationQuestion}</Text>
              </View>
            )}

            {result.foods?.map((food: any, idx: number) => (
              <View key={idx} className="bg-background p-3 rounded-xl border border-border mb-3">
                <View className="flex-row justify-between items-center mb-2">
                  <View>
                    <Text className="text-foreground font-medium">{food.name}</Text>
                    <Text className="text-muted-foreground text-sm">{food.quantity} {food.unit}</Text>
                  </View>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 999,
                      backgroundColor: food.confidence === 'HIGH' ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: food.confidence === 'HIGH' ? '#22C55E' : '#F59E0B',
                      }}
                    >
                      {food.confidence} Match
                    </Text>
                  </View>
                </View>
                {food.fallbackNutrition && (
                  <View className="flex-row gap-3 pt-2 border-t border-border/50">
                    <Text className="text-primary font-medium text-xs">{food.fallbackNutrition.calories} kcal</Text>
                    <Text className="text-muted-foreground text-xs">{food.fallbackNutrition.protein_g}g P</Text>
                    <Text className="text-muted-foreground text-xs">{food.fallbackNutrition.carbs_g}g C</Text>
                    <Text className="text-muted-foreground text-xs">{food.fallbackNutrition.fat_g}g F</Text>
                  </View>
                )}
              </View>
            ))}

            <View className="flex-row mt-4 gap-3">
              <TouchableOpacity 
                className="flex-1 border border-border p-3 rounded-xl items-center"
                onPress={() => setResult(null)}
              >
                <Text className="text-foreground font-medium">Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 bg-primary p-3 rounded-xl items-center flex-row justify-center"
                onPress={handleConfirm}
                disabled={result.needsClarification || isAnalyzing}
              >
                {isAnalyzing ? <ActivityIndicator color="white" /> : <Text className="text-primary-foreground font-medium">Confirm</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  )
}
