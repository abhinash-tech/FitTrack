import { GoogleGenerativeAI } from "@google/generative-ai"

export interface CoachContext {
  userName: string
  goals: { title: string; type: string }[]
  todayScore: number
  hydrationStreak: number
  workoutStreak: number
  sleepHours: number
  calories: number
}

export class GeminiCoachProvider {
  private genAI: GoogleGenerativeAI

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  async generateDailyTip(context: CoachContext): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const prompt = `You are a friendly, encouraging health and fitness coach for an app called FitTrack.
Write a single, short, personalized coaching tip (max 2 sentences) for the user. Include exactly 1 relevant emoji at the start.

User Context:
- Name: ${context.userName}
- Goals: ${context.goals.map(g => g.title).join(", ") || "General Wellness"}
- Today's Wellness Score: ${context.todayScore}/100
- Hydration Streak: ${context.hydrationStreak} days
- Workout Streak: ${context.workoutStreak} days
- Sleep Last Night: ${context.sleepHours} hours
- Calories Today: ${context.calories}

Make it actionable, uplifting, and highly tailored to their current streaks or score. Do not sound like a robot.`

    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text().trim()
      return text
    } catch (error) {
      console.error("AI Coach Error:", error)
      return "💡 Keep up the great work! Consistency is the key to achieving your wellness goals."
    }
  }
}
