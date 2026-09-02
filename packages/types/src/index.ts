/**
 * @fittrack/types
 * All shared TypeScript types — mirrors the PostgreSQL schema exactly.
 * Used by web, mobile, and all shared packages.
 */

// ─── Enum / Union Types ───────────────────────────────────────────────────────

export type GoalType =
  | "lose_weight"
  | "gain_muscle"
  | "maintain"
  | "endurance"
  | "general_health"

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active"

export type UnitSystem = "metric" | "imperial"

export type WorkoutType = "home_workout" | "walking" | "running" | "gym" | "other"

export type WorkoutCategory =
  | "full_body"
  | "beginner"
  | "abs"
  | "chest"
  | "back"
  | "arms"
  | "legs"
  | "glutes"
  | "hiit"
  | "mobility"
  | "stretching"
  | "cardio"
  | "other"

export type WorkoutIntensity = "low" | "moderate" | "high"

export type MealType = "breakfast" | "lunch" | "dinner" | "snack"

export type ExerciseDifficulty = "beginner" | "intermediate" | "advanced"

export type ExerciseEquipment =
  | "none"
  | "dumbbell"
  | "barbell"
  | "resistance_band"
  | "pull_up_bar"
  | "kettlebell"
  | "other"

export type FoodCategory =
  | "indian_breakfast"
  | "south_indian"
  | "north_indian"
  | "rice"
  | "curry"
  | "bread"
  | "snack"
  | "beverage"
  | "fruit"
  | "vegetable"
  | "protein"
  | "dairy"
  | "general"

export type FoodCuisine = "south_indian" | "north_indian" | "general" | "other"

export type FoodSourceType = "usda" | "ifct" | "manual" | "ai_generated"

export type NutritionInputMethod = "photo" | "voice" | "search" | "manual"

export type AIAnalysisStatus = "pending" | "completed" | "failed"

export type AIProvider = "gemini" | "openai" | "claude"

export type SleepQuality = 1 | 2 | 3 | 4 | 5

export type GoalTypeEnum =
  | "water"
  | "steps"
  | "weight"
  | "sleep"
  | "workout_frequency"
  | "calories"
  | "distance"
  | "custom"

export type AchievementCategory =
  | "hydration"
  | "fitness"
  | "nutrition"
  | "sleep"
  | "streak"
  | "milestone"

export type NotificationType =
  | "hydration_reminder"
  | "goal_complete"
  | "streak"
  | "achievement"
  | "insight"

// ─── Database Row Types ───────────────────────────────────────────────────────

export interface Profile {
  id: string
  name: string
  age: number | null
  height_cm: number | null
  weight_kg: number | null
  goal_type: GoalType | null
  activity_level: ActivityLevel | null
  unit_system: UnitSystem
  onboarding_done: boolean
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface HydrationGoal {
  id: string
  user_id: string
  goal_ml: number
  is_active: boolean
  created_at: string
}

export interface HydrationEntry {
  id: string
  user_id: string
  amount_ml: number
  logged_at: string
  date: string
  source: "manual" | "quick_add" | "reminder"
  note: string | null
  created_at: string
}

export interface HydrationReminder {
  id: string
  user_id: string
  enabled: boolean
  start_time: string // HH:MM
  end_time: string   // HH:MM
  interval_minutes: number
  quiet_hours_from: string | null
  quiet_hours_to: string | null
  days_of_week: number[]
  smart_mode: boolean
  updated_at: string
}

export interface Exercise {
  id: string
  name: string
  description: string | null
  category: WorkoutCategory
  difficulty: ExerciseDifficulty
  equipment: ExerciseEquipment
  target_muscles: string[]
  instructions: string[]
  default_sets: number | null
  default_reps: number | null
  default_duration_sec: number | null
  estimated_cal_per_min: number | null
  is_bodyweight: boolean
  created_at: string
}

export interface WorkoutSession {
  id: string
  user_id: string
  name: string | null
  category: WorkoutCategory | null
  type: WorkoutType
  duration_min: number
  intensity: WorkoutIntensity | null
  calories_burned: number | null
  notes: string | null
  date: string
  started_at: string | null
  ended_at: string | null
  created_at: string
}

export interface WorkoutExercise {
  id: string
  session_id: string
  exercise_id: string
  sets_completed: number | null
  reps_per_set: number[] | null
  duration_sec: number | null
  rest_sec: number | null
  weight_kg: number | null
  difficulty_felt: WorkoutIntensity | null
  notes: string | null
  order_index: number
}

export interface WalkingSession {
  id: string
  user_id: string
  distance_km: number
  duration_min: number
  avg_pace_min_km: number | null
  calories_burned: number | null
  steps: number | null
  route_geojson: Record<string, unknown> | null
  date: string
  started_at: string | null
  ended_at: string | null
  created_at: string
}

export interface RunningSession {
  id: string
  user_id: string
  distance_km: number
  duration_min: number
  avg_pace_min_km: number | null
  calories_burned: number | null
  steps: number | null
  route_geojson: Record<string, unknown> | null
  date: string
  started_at: string | null
  ended_at: string | null
  created_at: string
}

export interface FoodSource {
  id: string
  name: string
  priority_level: number
  description: string | null
}

export interface Food {
  id: string
  name: string
  category: FoodCategory | null
  cuisine: FoodCuisine
  source_id: string | null
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
  fiber_per_100g: number | null
  is_verified: boolean
  created_at: string
}

export interface FoodAlias {
  id: string
  food_id: string
  alias_name: string
  locale: string | null
  created_at: string
}

export interface FoodServing {
  id: string
  food_id: string
  serving_desc: string
  weight_g: number
  is_default: boolean
  created_at: string
}

export interface AINutritionCache {
  id: string
  raw_query: string
  resolved_food_id: string | null
  resolved_qty: number | null
  resolved_unit: string | null
  confidence: "HIGH" | "MEDIUM" | "LOW" | null
  created_at: string
}

export interface NutritionEntry {
  id: string
  user_id: string
  food_id: string | null
  meal_type: MealType
  food_name: string
  quantity: number
  unit: string
  quantity_g: number
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number | null
  source_used: string | null
  ai_confidence: "HIGH" | "MEDIUM" | "LOW" | null
  is_edited: boolean
  date: string
  logged_at: string
  created_at: string
}

export interface SleepEntry {
  id: string
  user_id: string
  bedtime: string
  wake_time: string
  duration_min: number
  quality: SleepQuality | null
  notes: string | null
  date: string
  created_at: string
}

export interface WeightEntry {
  id: string
  user_id: string
  weight_kg: number
  date: string
  notes: string | null
  created_at: string
}

export interface BodyMeasurement {
  id: string
  user_id: string
  waist_cm: number | null
  chest_cm: number | null
  arms_cm: number | null
  thighs_cm: number | null
  date: string
  created_at: string
}

export interface Goal {
  id: string
  user_id: string
  type: GoalTypeEnum
  title: string
  target_value: number
  current_value: number
  unit: string | null
  deadline: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Achievement {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  category: AchievementCategory
  condition: AchievementCondition
  points: number
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
  achievement?: Achievement
}

export interface DailyStat {
  id: string
  user_id: string
  date: string
  water_ml: number
  calories_consumed: number
  steps: number
  sleep_min: number
  workout_count: number
  walk_km: number
  run_km: number
  wellness_score: number
  hydration_streak: number
  workout_streak: number
  score_breakdown: WellnessScoreBreakdown | null
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string
  sent_at: string
  read_at: string | null
  data: Record<string, unknown> | null
}

export interface WeightEntry {
  id: string
  user_id: string
  weight_kg: number
  date: string
  notes: string | null
  created_at: string
}

export interface BodyMeasurement {
  id: string
  user_id: string
  waist_cm: number | null
  chest_cm: number | null
  arms_cm: number | null
  thighs_cm: number | null
  date: string
  created_at: string
}

// ─── AI / Nutrition Types ─────────────────────────────────────────────────────

export interface NutritionValues {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g?: number
}

export interface DetectedFood {
  name: string
  nameNormalized: string
  quantity: number
  unit: string
  confidence: "HIGH" | "MEDIUM" | "LOW"
  fallbackNutrition?: NutritionValues
  matchedFoodId?: string
}

export interface FoodAnalysisResult {
  foods: DetectedFood[]
  needsClarification?: boolean
  clarificationQuestion?: string
}

// ─── UI / Computed Types ──────────────────────────────────────────────────────

export interface WellnessScoreBreakdown {
  hydration: number
  activity: number
  workout: number
  nutrition: number
  sleep: number
  goals: number
  total: number
}

export interface WellnessScoreInput {
  waterMl: number
  waterGoalMl: number
  caloriesConsumed: number
  caloriesGoal: number
  stepsTaken: number
  stepsGoal: number
  sleepMin: number
  sleepGoalMin: number
  workoutCompleted: boolean
  goalsCompletedCount: number
  goalsTotal: number
}

export interface DailyHydrationSummary {
  totalMl: number
  goalMl: number
  remainingMl: number
  percent: number
  entries: HydrationEntry[]
}

export interface DailyNutritionSummary {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  calorieGoal: number
  meals: Record<MealType, NutritionEntry[]>
}

export interface WeeklyHydrationPoint {
  date: string
  dayLabel: string
  amountMl: number
  goalMl: number
  percent: number
}

export interface AchievementCondition {
  type: "streak" | "total" | "single" | "milestone" | "count"
  metric: string
  threshold: number
  unit?: string
}

export interface ChartDataPoint {
  date: string
  label: string
  value: number
  goal?: number
}

// ─── API Types ────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
}

// Supabase analyze-food Edge Function
export interface AnalyzeFoodRequest {
  text: string
}
