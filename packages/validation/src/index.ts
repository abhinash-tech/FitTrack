/**
 * @fittrack/validation
 * Zod schemas for all entities — shared between web forms, mobile forms, and Edge Functions.
 */

import { z } from "zod"

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const SignUpSchema = z
  .object({
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const ResetPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
})

// ─── Profile / Onboarding ─────────────────────────────────────────────────────

export const GoalTypeSchema = z.enum([
  "lose_weight",
  "gain_muscle",
  "maintain",
  "endurance",
  "general_health",
])

export const ActivityLevelSchema = z.enum([
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
])

export const ProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  age: z.number().int().min(13).max(120).optional().nullable(),
  height_cm: z.number().min(100).max(280).optional().nullable(),
  weight_kg: z.number().min(20).max(600).optional().nullable(),
  goal_type: GoalTypeSchema.optional().nullable(),
  activity_level: ActivityLevelSchema.optional().nullable(),
  unit_system: z.enum(["metric", "imperial"]).default("metric"),
})

export const OnboardingSchema = ProfileSchema.extend({
  daily_water_goal_ml: z.number().int().min(500).max(10000).default(2500),
  sleep_goal_hours: z.number().min(4).max(12).default(8),
  step_goal: z.number().int().min(1000).max(50000).default(8000),
  calorie_goal: z.number().int().min(800).max(10000).optional(),
})

// ─── Hydration ────────────────────────────────────────────────────────────────

export const HydrationEntrySchema = z.object({
  amount_ml: z
    .number()
    .int("Amount must be a whole number")
    .min(1, "Must be at least 1 ml")
    .max(5000, "Cannot exceed 5000 ml per entry"),
  note: z.string().max(200).optional(),
  source: z.enum(["manual", "quick_add", "reminder"]).default("manual"),
  date: z.string().date().optional(),
})

export const HydrationGoalSchema = z.object({
  goal_ml: z.number().int().min(500, "Goal must be at least 500 ml").max(10000),
})

export const HydrationReminderSchema = z.object({
  enabled: z.boolean(),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM format"),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM format"),
  interval_minutes: z.number().int().min(15, "Minimum 15 minutes").max(480),
  days_of_week: z.array(z.number().int().min(1).max(7)).min(1, "Select at least one day"),
  quiet_hours_from: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  quiet_hours_to: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  smart_mode: z.boolean().default(true),
})

// ─── Workout ──────────────────────────────────────────────────────────────────

export const WorkoutCategorySchema = z.enum([
  "full_body", "beginner", "abs", "chest", "back", "arms",
  "legs", "glutes", "hiit", "mobility", "stretching", "cardio", "other",
])

export const WorkoutTypeSchema = z.enum([
  "home_workout", "walking", "running", "gym", "other",
])

export const WorkoutIntensitySchema = z.enum(["low", "moderate", "high"])

export const WorkoutSessionSchema = z.object({
  name: z.string().max(100).optional(),
  category: WorkoutCategorySchema.optional(),
  type: WorkoutTypeSchema,
  duration_min: z.number().int().min(1, "Duration must be at least 1 minute").max(600),
  intensity: WorkoutIntensitySchema.optional(),
  calories_burned: z.number().int().min(0).max(5000).optional().nullable(),
  notes: z.string().max(500).optional(),
  date: z.string().date(),
})

export const WorkoutExerciseSchema = z.object({
  exercise_id: z.string().uuid(),
  sets_completed: z.number().int().min(0).optional(),
  reps_per_set: z.array(z.number().int().min(0)).optional(),
  duration_sec: z.number().int().min(0).optional(),
  rest_sec: z.number().int().min(0).max(600).optional(),
  weight_kg: z.number().min(0).max(1000).optional().nullable(),
  order_index: z.number().int().min(0),
})

// ─── Walking / Running ────────────────────────────────────────────────────────

export const WalkingSessionSchema = z.object({
  distance_km: z.number().min(0.01).max(500),
  duration_min: z.number().int().min(1).max(1440),
  calories_burned: z.number().int().min(0).max(5000).optional().nullable(),
  steps: z.number().int().min(0).max(100000).optional().nullable(),
  date: z.string().date(),
})

export const RunningSessionSchema = WalkingSessionSchema

// ─── Nutrition ────────────────────────────────────────────────────────────────

export const MealTypeSchema = z.enum(["breakfast", "lunch", "dinner", "snack"])

export const NutritionEntrySchema = z.object({
  meal_type: MealTypeSchema,
  food_name: z.string().min(1, "Food name required").max(200),
  food_id: z.string().uuid().optional().nullable(),
  quantity: z.number().positive(),
  unit: z.string().min(1).max(50),
  quantity_g: z.number().min(0.1).max(5000),
  calories: z.number().min(0).max(10000),
  protein_g: z.number().min(0).max(1000).default(0),
  carbs_g: z.number().min(0).max(1000).default(0),
  fat_g: z.number().min(0).max(1000).default(0),
  fiber_g: z.number().min(0).max(500).optional().nullable(),
  source_used: z.string().optional().nullable(),
  ai_confidence: z.enum(["HIGH", "MEDIUM", "LOW"]).optional().nullable(),
  is_edited: z.boolean().default(false),
  date: z.string().date(),
})

// ─── Sleep ────────────────────────────────────────────────────────────────────

export const SleepEntrySchema = z
  .object({
    bedtime: z.string().datetime("Invalid bedtime"),
    wake_time: z.string().datetime("Invalid wake time"),
    quality: z.number().int().min(1).max(5).optional().nullable(),
    notes: z.string().max(300).optional(),
    date: z.string().date(),
  })
  .refine((d) => new Date(d.wake_time) > new Date(d.bedtime), {
    message: "Wake time must be after bedtime",
    path: ["wake_time"],
  })

// ─── Weight & Body ────────────────────────────────────────────────────────────

export const WeightEntrySchema = z.object({
  weight_kg: z.number().min(20, "Weight too low").max(600, "Weight too high").multipleOf(0.1),
  date: z.string().date(),
  notes: z.string().max(200).optional(),
})

export const BodyMeasurementSchema = z.object({
  waist_cm: z.number().min(30).max(300).optional().nullable(),
  chest_cm: z.number().min(30).max(300).optional().nullable(),
  arms_cm: z.number().min(10).max(100).optional().nullable(),
  thighs_cm: z.number().min(20).max(200).optional().nullable(),
  date: z.string().date(),
})

// ─── Goals ────────────────────────────────────────────────────────────────────

export const GoalTypeEnumSchema = z.enum([
  "water", "steps", "weight", "sleep", "workout_frequency",
  "calories", "distance", "custom",
])

export const GoalSchema = z.object({
  type: GoalTypeEnumSchema,
  title: z.string().min(1).max(100),
  target_value: z.number().positive("Target must be positive"),
  unit: z.string().max(20).optional(),
  deadline: z.string().date().optional().nullable(),
})

// ─── AI Food Analysis ─────────────────────────────────────────────────────────

export const AnalyzeFoodSchema = z.object({
  text: z.string().min(1),
})

export const ConfirmFoodAnalysisSchema = z.object({
  analysis_id: z.string().uuid().optional(),
  confirmed_foods: z.array(
    z.object({
      name: z.string(),
      quantity: z.number().positive(),
      unit: z.string(),
      quantity_g: z.number().positive(),
      meal_type: MealTypeSchema,
      calories: z.number().min(0),
      protein_g: z.number().min(0),
      carbs_g: z.number().min(0),
      fat_g: z.number().min(0),
      fiber_g: z.number().min(0).optional(),
    })
  ),
})

// ─── Exported Type Aliases ────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof LoginSchema>
export type SignUpInput = z.infer<typeof SignUpSchema>
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>
export type ProfileInput = z.infer<typeof ProfileSchema>
export type OnboardingInput = z.infer<typeof OnboardingSchema>
export type HydrationEntryInput = z.infer<typeof HydrationEntrySchema>
export type HydrationGoalInput = z.infer<typeof HydrationGoalSchema>
export type HydrationReminderInput = z.infer<typeof HydrationReminderSchema>
export type WorkoutSessionInput = z.infer<typeof WorkoutSessionSchema>
export type NutritionEntryInput = z.infer<typeof NutritionEntrySchema>
export type SleepEntryInput = z.infer<typeof SleepEntrySchema>
export type WeightEntryInput = z.infer<typeof WeightEntrySchema>
export type BodyMeasurementInput = z.infer<typeof BodyMeasurementSchema>
export type GoalInput = z.infer<typeof GoalSchema>
export type AnalyzeFoodInput = z.infer<typeof AnalyzeFoodSchema>
export type ConfirmFoodAnalysisInput = z.infer<typeof ConfirmFoodAnalysisSchema>
