"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { OnboardingSchema, type OnboardingInput } from "@fittrack/validation"
import { submitOnboarding } from "../actions/onboarding"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/cn"
import { Activity, Target, User, Scale } from "lucide-react"

const STEPS = [
  { id: "basics", title: "The Basics", icon: User },
  { id: "metrics", title: "Body Metrics", icon: Scale },
  { id: "goals", title: "Your Goals", icon: Target },
]

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  
  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(OnboardingSchema),
    defaultValues: {
      unit_system: "metric",
      daily_water_goal_ml: 2500,
      sleep_goal_hours: 8,
      step_goal: 8000,
    },
  })

  const goalType = watch("goal_type")
  const activityLevel = watch("activity_level")

  const onSubmit = async (data: OnboardingInput) => {
    try {
      await submitOnboarding(data)
    } catch (error: any) {
      toast.error(error.message || "Failed to save profile")
    }
  }

  const handleNext = async () => {
    let fieldsToValidate: any[] = []
    if (currentStep === 0) fieldsToValidate = ["name", "age"]
    if (currentStep === 1) fieldsToValidate = ["height_cm", "weight_kg"]
    
    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  return (
    <div className="space-y-8">
      {/* Progress Tracker */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[hsl(var(--muted))] rounded-full -z-10" />
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[hsl(var(--primary))] rounded-full -z-10 transition-all duration-300"
          style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
        />
        
        {STEPS.map((step, idx) => {
          const Icon = step.icon
          const isActive = idx === currentStep
          const isPassed = idx < currentStep
          
          return (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-[hsl(var(--card))] px-2">
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                  isActive ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))]" :
                  isPassed ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" :
                  "border-[hsl(var(--muted))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))]"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-xs font-semibold hidden sm:block",
                isActive || isPassed ? "text-[hsl(var(--foreground))]" : "text-[hsl(var(--muted-foreground))]"
              )}>{step.title}</span>
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* STEP 0: Basics */}
        {currentStep === 0 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Let's get to know you</h2>
              <p className="text-[hsl(var(--muted-foreground))] mt-1">This helps us personalize your FitTrack experience.</p>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium">What should we call you?</label>
              <Input
                placeholder="e.g. Alex"
                error={errors.name?.message}
                {...register("name")}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium">How old are you?</label>
              <Input
                type="number"
                placeholder="Years"
                error={errors.age?.message}
                {...register("age", { valueAsNumber: true })}
              />
            </div>
          </div>
        )}

        {/* STEP 1: Body Metrics */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Your Metrics</h2>
              <p className="text-[hsl(var(--muted-foreground))] mt-1">We use this to calculate your baseline BMR and daily targets.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Height (cm)</label>
                <Input
                  type="number"
                  placeholder="175"
                  error={errors.height_cm?.message}
                  {...register("height_cm", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Weight (kg)</label>
                <Input
                  type="number"
                  placeholder="70"
                  error={errors.weight_kg?.message}
                  {...register("weight_kg", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <label className="text-sm font-medium">Activity Level</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "sedentary", label: "Sedentary" },
                  { id: "light", label: "Lightly Active" },
                  { id: "moderate", label: "Moderately Active" },
                  { id: "active", label: "Very Active" },
                  { id: "very_active", label: "Extra Active" }
                ].map(level => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => setValue("activity_level", level.id as any)}
                    className={cn(
                      "p-3 rounded-lg border text-sm font-medium transition-all text-center",
                      activityLevel === level.id 
                        ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]" 
                        : "border-[hsl(var(--border))] bg-transparent text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/0.3)]"
                    )}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Goals */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Your Primary Goal</h2>
              <p className="text-[hsl(var(--muted-foreground))] mt-1">What do you want to achieve?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: "lose_weight", label: "Lose Weight", icon: "📉" },
                { id: "gain_muscle", label: "Gain Muscle", icon: "💪" },
                { id: "maintain", label: "Maintain Weight", icon: "⚖️" },
                { id: "endurance", label: "Improve Endurance", icon: "🏃" },
                { id: "general_health", label: "General Health", icon: "❤️" },
              ].map(goal => (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => setValue("goal_type", goal.id as any)}
                  className={cn(
                    "p-4 rounded-xl border flex items-center gap-3 transition-all text-left",
                    goalType === goal.id 
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)]" 
                      : "border-[hsl(var(--border))] bg-transparent hover:border-[hsl(var(--primary)/0.3)]"
                  )}
                >
                  <span className="text-2xl">{goal.icon}</span>
                  <span className={cn(
                    "font-medium",
                    goalType === goal.id ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--foreground))]"
                  )}>{goal.label}</span>
                </button>
              ))}
            </div>
            {errors.goal_type && (
               <p className="text-sm text-[hsl(var(--error))] text-center mt-2">Please select a primary goal</p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-[hsl(var(--border))]">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0 || isSubmitting}
            className={currentStep === 0 ? "invisible" : ""}
          >
            Back
          </Button>
          
          {currentStep < STEPS.length - 1 ? (
            <Button type="button" onClick={handleNext}>
              Next Step
            </Button>
          ) : (
            <Button type="submit" loading={isSubmitting}>
              Complete Setup
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
