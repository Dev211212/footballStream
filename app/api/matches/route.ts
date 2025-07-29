import { NextResponse } from "next/server"
import { fetchMatches } from "@/lib/api"

export async function GET() {
  try {
    const matches = await fetchMatches()
    return NextResponse.json(matches)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 })
  }
}
