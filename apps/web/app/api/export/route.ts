import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(req: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: stats, error } = await supabase
      .from("daily_stats")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })

    if (error) {
      throw error
    }

    if (!stats || stats.length === 0) {
      return new NextResponse("No data available to export.", { status: 404 })
    }

    // Convert to CSV
    // Extract headers dynamically from the first row
    const headers = Object.keys(stats[0]).filter(k => k !== "user_id")
    
    let csv = headers.join(",") + "\n"

    stats.forEach((row) => {
      const values = headers.map(header => {
        const val = row[header]
        // Escape quotes and format correctly
        if (val === null || val === undefined) return ""
        if (typeof val === "object") return `"${JSON.stringify(val).replace(/"/g, '""')}"`
        return `"${String(val).replace(/"/g, '""')}"`
      })
      csv += values.join(",") + "\n"
    })

    const headersList = new Headers()
    headersList.set("Content-Type", "text/csv")
    headersList.set("Content-Disposition", `attachment; filename="fittrack-export-${new Date().toISOString().split('T')[0]}.csv"`)

    return new NextResponse(csv, {
      status: 200,
      headers: headersList,
    })

  } catch (err: any) {
    console.error("Export Error:", err)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}
