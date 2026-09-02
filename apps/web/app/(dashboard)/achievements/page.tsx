import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getAllAchievements, getUserAchievements } from "@fittrack/supabase"
import { AchievementCard } from "@/components/achievements/achievement-card"

export const metadata = {
  title: "Achievements",
}

export default async function AchievementsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/login")
  }

  const [allAchievements, userAchievements] = await Promise.all([
    getAllAchievements(supabase),
    getUserAchievements(supabase, user.id)
  ])

  const unlockedIds = new Set(userAchievements.map(ua => ua.achievement_id))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Unlock achievements by hitting your goals and keeping your streaks alive.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {allAchievements.map((achievement) => (
          <AchievementCard 
            key={achievement.id} 
            achievement={achievement} 
            isUnlocked={unlockedIds.has(achievement.id)} 
          />
        ))}
      </div>
    </div>
  )
}
