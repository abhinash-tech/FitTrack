"use client"

import { useState } from "react"
import { parseFoodInput, logNutritionEntries } from "@/app/actions/nutrition"
import { FoodAnalysisResult, DetectedFood, MealType } from "@fittrack/types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, Check, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export function FoodLoggerForm() {
  const [input, setInput] = useState("")
  const [mealType, setMealType] = useState<MealType>("lunch")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isLogging, setIsLogging] = useState(false)
  const [result, setResult] = useState<FoodAnalysisResult | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleAnalyze = async () => {
    if (!input.trim()) return

    setIsAnalyzing(true)
    setResult(null)

    const { data, error } = await parseFoodInput(input)
    
    setIsAnalyzing(false)

    if (error) {
      toast({ title: "Analysis Failed", description: error, variant: "error" })
      return
    }

    if (data) {
      setResult(data)
    }
  }

  const handleConfirm = async () => {
    if (!result || result.needsClarification) return
    setIsLogging(true)
    
    const { success, error } = await logNutritionEntries(result.foods, mealType)
    
    setIsLogging(false)

    if (success) {
      toast({ title: "Logged successfully", description: "Your meal has been recorded.", variant: "success" })
      setResult(null)
      setInput("")
      router.refresh()
    } else {
      toast({ title: "Failed to log", description: error || "Unknown error occurred", variant: "error" })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Smart Food Logger
        </CardTitle>
        <CardDescription>
          Tell us what you ate naturally (e.g., "2 idlis with sambar and 1 cup filter coffee for breakfast")
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Meal Type</Label>
          <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
            <SelectTrigger>
              <SelectValue placeholder="Select meal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="breakfast">Breakfast</SelectItem>
              <SelectItem value="lunch">Lunch</SelectItem>
              <SelectItem value="snack">Snack</SelectItem>
              <SelectItem value="dinner">Dinner</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>What did you eat?</Label>
          <Textarea 
            placeholder="I had..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            disabled={!!result}
          />
        </div>

        {result && (
          <div className="mt-6 space-y-4 p-4 border rounded-lg bg-surface/50">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Analysis Result</h4>
            
            {result.needsClarification && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-500 text-sm flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Needs Clarification</p>
                  <p>{result.clarificationQuestion}</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {result.foods.map((food, i) => (
                <div key={i} className="flex flex-col gap-2 p-3 bg-background rounded-md border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{food.name}</p>
                      <p className="text-sm text-muted-foreground">{food.quantity} {food.unit}</p>
                    </div>
                    <Badge variant={food.confidence === "HIGH" ? "success" : food.confidence === "MEDIUM" ? "warning" : "destructive"}>
                      {food.confidence} Match
                    </Badge>
                  </div>
                  
                  {food.fallbackNutrition && (
                    <div className="flex gap-4 text-xs font-medium text-muted-foreground pt-2 border-t border-border/50">
                      <span className="text-primary">{food.fallbackNutrition.calories} kcal</span>
                      <span>{food.fallbackNutrition.protein_g}g P</span>
                      <span>{food.fallbackNutrition.carbs_g}g C</span>
                      <span>{food.fallbackNutrition.fat_g}g F</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {result ? (
          <>
            <Button variant="outline" onClick={() => setResult(null)} disabled={isLogging}>Edit Input</Button>
            <Button onClick={handleConfirm} disabled={result.needsClarification || isLogging}>
              {isLogging ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
              Confirm & Log
            </Button>
          </>
        ) : (
          <Button onClick={handleAnalyze} disabled={!input.trim() || isAnalyzing}>
            {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Analyze
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
