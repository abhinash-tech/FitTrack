import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getActiveGoals } from "@fittrack/supabase"
import { CreateGoalModal } from "@/components/goals/create-goal-modal"
import { GoalCard } from "@/components/goals/goal-card"

export const metadata = {
  title: "Goals",
}

export default async function GoalsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/login")
  }

  const activeGoals = await getActiveGoals(supabase, user.id)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Track your progress towards your personal targets.
          </p>
        </div>
        <CreateGoalModal />
      </div>

      {activeGoals.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <h3 className="text-lg font-semibold mb-2">No active goals</h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-sm mb-4">
            You don't have any active goals right now. Create one to start tracking your progress!
          </p>
          <CreateGoalModal />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  )
}
