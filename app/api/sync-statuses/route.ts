import { NextResponse } from "next/server"
import { syncUserStatuses } from "@/lib/utils/user-status"

export async function POST() {
  try {
    await syncUserStatuses()
    return NextResponse.json({ success: true, message: "User statuses synchronized successfully" })
  } catch (error) {
    console.error("Error synchronizing user statuses:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}

