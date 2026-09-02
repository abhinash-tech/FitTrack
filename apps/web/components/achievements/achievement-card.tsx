import { getAchievementDisplay } from "@fittrack/business-logic"
import type { Achievement } from "@fittrack/types"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/cn"
import { Lock } from "lucide-react"

interface AchievementCardProps {
  achievement: Achievement
  isUnlocked: boolean
}

export function AchievementCard({ achievement, isUnlocked }: AchievementCardProps) {
  const display = getAchievementDisplay(achievement.slug)

  return (
    <Card className={cn("overflow-hidden transition-all duration-200", 
      !isUnlocked && "opacity-60 grayscale bg-[hsl(var(--muted)/0.5)]"
    )}>
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="text-5xl">
            {display.emoji}
          </div>
          {!isUnlocked && (
            <div className="absolute -bottom-2 -right-2 bg-[hsl(var(--background))] p-1 rounded-full border shadow-sm">
              <Lock className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            </div>
          )}
        </div>
        
        <h3 className="font-bold text-lg mb-1">{display.title}</h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {display.subtitle}
        </p>
        
        {isUnlocked && (
          <div className="mt-4 text-xs font-medium bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] px-2.5 py-1 rounded-full">
            Unlocked
          </div>
        )}
      </CardContent>
    </Card>
  )
}
