import { NextResponse } from "next/server"
import { generateDailyCoachTipAction } from "@/app/actions/coach"

export async function GET() {
  const result = await generateDailyCoachTipAction()
  
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({ tip: result.tip })
}
