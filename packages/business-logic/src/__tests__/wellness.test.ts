import { describe, it, expect } from "vitest"
import { calculateWellnessScore } from "../wellness-score"

describe("calculateWellnessScore", () => {
  it("should return a perfect 100 for a perfect day", () => {
    const result = calculateWellnessScore({
      waterMl: 2500,
      waterGoalMl: 2500,
      caloriesConsumed: 2000,
      caloriesGoal: 2000,
      stepsTaken: 8000,
      stepsGoal: 8000,
      sleepMin: 480, // 8 hours
      sleepGoalMin: 480,
      workoutCompleted: true,
      goalsCompletedCount: 3,
      goalsTotal: 3,
    })

    expect(result.total).toBe(100)
    expect(result.hydration).toBe(30)
    expect(result.activity).toBe(20)
    expect(result.nutrition).toBe(15)
    expect(result.sleep).toBe(15)
    expect(result.workout).toBe(15)
    expect(result.goals).toBe(5)
  })

  it("should cap points at their maximums if user exceeds goals", () => {
    const result = calculateWellnessScore({
      waterMl: 5000, // Exceeds 2500
      waterGoalMl: 2500,
      caloriesConsumed: 2000,
      caloriesGoal: 2000,
      stepsTaken: 15000, // Exceeds 8000
      stepsGoal: 8000,
      sleepMin: 600, // Exceeds 480
      sleepGoalMin: 480,
      workoutCompleted: true,
      goalsCompletedCount: 5, // Exceeds 3 somehow
      goalsTotal: 3,
    })

    // Total should still be exactly 100, not more
    expect(result.total).toBe(100)
    expect(result.hydration).toBe(30)
    expect(result.activity).toBe(20)
    expect(result.sleep).toBe(15)
    expect(result.goals).toBe(5)
  })

  it("should return correct points for a sedentary day", () => {
    const result = calculateWellnessScore({
      waterMl: 1250, // 50% = 15 pts
      waterGoalMl: 2500,
      caloriesConsumed: 2500, // 500 over goal = penalty! (usually cap at some ratio)
      caloriesGoal: 2000,
      stepsTaken: 4000, // 50% = 10 pts
      stepsGoal: 8000,
      sleepMin: 240, // 50% = 7.5 -> 8 pts
      sleepGoalMin: 480,
      workoutCompleted: false, // 0 pts
      goalsCompletedCount: 0,
      goalsTotal: 1, // 0 pts
    })

    expect(result.hydration).toBe(15)
    expect(result.activity).toBe(10)

    expect(result.workout).toBe(0)
    expect(result.goals).toBe(0)
    
    // Nutrition: 2500 vs 2000 goal
    // formatPercent(2500, 2000) = 100 (capped)
    // 100 * 0.15 = 15
    expect(result.nutrition).toBe(15)
  })

  it("handles division by zero gracefully", () => {
    const result = calculateWellnessScore({
      waterMl: 1000,
      waterGoalMl: 0,
      caloriesConsumed: 1000,
      caloriesGoal: 0,
      stepsTaken: 1000,
      stepsGoal: 0,
      sleepMin: 100,
      sleepGoalMin: 0,
      workoutCompleted: false,
      goalsCompletedCount: 0,
      goalsTotal: 0,
    })

    // formatPercent returns 0 if total is 0.
    expect(Number.isNaN(result.total)).toBe(false)
    expect(result.total).toBe(0)
    expect(result.hydration).toBe(0)
  })
})
