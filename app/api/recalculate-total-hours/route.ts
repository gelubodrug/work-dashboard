import { NextResponse } from "next/server"
import { recalculateAllUsersTotalHours } from "@/app/actions"

export async function POST() {
  try {
    await recalculateAllUsersTotalHours()
    return NextResponse.json({ message: "All users' total hours have been recalculated successfully" })
  } catch (error) {
    console.error("Error in recalculate-total-hours API route:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}

