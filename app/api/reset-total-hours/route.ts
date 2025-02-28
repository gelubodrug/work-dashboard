import { NextResponse } from "next/server"
import { resetAllUsersTotalHours } from "@/app/actions"

export async function POST() {
  try {
    await resetAllUsersTotalHours()
    return NextResponse.json({ message: "All users' total hours have been reset successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error in reset-total-hours API route:", error)
    return NextResponse.json({ error: "Failed to reset total hours" }, { status: 500 })
  }
}

