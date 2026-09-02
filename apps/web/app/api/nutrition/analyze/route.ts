import { NextResponse } from "next/server"
import { parseFoodInput } from "@/app/actions/nutrition"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { text } = body

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const { data, error } = await parseFoodInput(text)

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to parse" }, { status: 500 })
  }
}
