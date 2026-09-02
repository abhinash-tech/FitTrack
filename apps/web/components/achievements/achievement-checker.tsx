"use client"

import { useEffect } from "react"
import { checkAndAwardAchievementsAction } from "@/app/actions/achievements"
import { useToast } from "@/components/ui/use-toast"
import { getAchievementDisplay } from "@fittrack/business-logic"

export function AchievementChecker() {
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true
    const check = async () => {
      const { success, unlocked } = await checkAndAwardAchievementsAction()
      if (success && unlocked && unlocked.length > 0 && mounted) {
        unlocked.forEach(slug => {
          const display = getAchievementDisplay(slug)
          toast({
            title: "🏆 Achievement Unlocked!",
            description: `${display.emoji} ${display.title}`,
            variant: "success",
          })
        })
      }
    }
    
    // Slight delay to not block initial render
    const t = setTimeout(check, 2000)
    return () => {
      mounted = false
      clearTimeout(t)
    }
  }, [toast])

  return null
}
