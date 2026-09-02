"use client"

import { useState } from "react"
import { WeightEntry, BodyMeasurement } from "@fittrack/types"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { deleteWeightEntryAction, deleteMeasurementEntryAction } from "@/app/actions/progress"
import { Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Props {
  weightEntries: WeightEntry[]
  measurements: BodyMeasurement[]
}

export function ProgressHistoryList({ weightEntries, measurements }: Props) {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteWeight = async (id: string) => {
    if (confirm("Delete this weight entry?")) {
      setIsDeleting(true)
      const { success } = await deleteWeightEntryAction(id)
      setIsDeleting(false)
      if (success) toast({ title: "Deleted", variant: "success" })
      else toast({ title: "Error deleting", variant: "error" })
    }
  }

  const handleDeleteMeasurement = async (id: string) => {
    if (confirm("Delete these measurements?")) {
      setIsDeleting(true)
      const { success } = await deleteMeasurementEntryAction(id)
      setIsDeleting(false)
      if (success) toast({ title: "Deleted", variant: "success" })
      else toast({ title: "Error deleting", variant: "error" })
    }
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">History Log</h3>
      <Tabs defaultValue="weight">
        <TabsList className="mb-4">
          <TabsTrigger value="weight">Weight</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="weight">
          {weightEntries.length === 0 ? (
            <p className="text-muted-foreground text-sm">No weight history.</p>
          ) : (
            <div className="space-y-3">
              {weightEntries.map(entry => (
                <div key={entry.id} className="flex justify-between items-center p-3 border border-border rounded-lg">
                  <div>
                    <div className="font-semibold">{entry.weight_kg} kg</div>
                    <div className="text-xs text-muted-foreground">{format(new Date(entry.date), "MMM d, yyyy")}</div>
                    {entry.notes && <div className="text-sm mt-1">{entry.notes}</div>}
                  </div>
                  <button 
                    onClick={() => handleDeleteWeight(entry.id)}
                    disabled={isDeleting}
                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="measurements">
          {measurements.length === 0 ? (
            <p className="text-muted-foreground text-sm">No measurement history.</p>
          ) : (
            <div className="space-y-3">
              {measurements.map(entry => (
                <div key={entry.id} className="flex justify-between items-center p-3 border border-border rounded-lg">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">{format(new Date(entry.date), "MMM d, yyyy")}</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      {entry.waist_cm && <div><span className="text-muted-foreground">Waist:</span> {entry.waist_cm}cm</div>}
                      {entry.chest_cm && <div><span className="text-muted-foreground">Chest:</span> {entry.chest_cm}cm</div>}
                      {entry.arms_cm && <div><span className="text-muted-foreground">Arms:</span> {entry.arms_cm}cm</div>}
                      {entry.thighs_cm && <div><span className="text-muted-foreground">Thighs:</span> {entry.thighs_cm}cm</div>}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteMeasurement(entry.id)}
                    disabled={isDeleting}
                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
