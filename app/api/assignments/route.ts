import { NextResponse } from "next/server"
import { getAssignments } from "@/app/actions/assignments"

export async function GET(request: Request) {
  try {
    console.log("🚗 [API-ASSIGNMENTS] API route handler called")

    // Get query parameters
    const url = new URL(request.url)
    const tab = url.searchParams.get("tab")

    // Set options based on the tab
    const options = {
      skipGpsProcessing: tab === "completed", // Skip GPS processing for completed assignments
      onlyCompleted: tab === "completed", // Only get completed assignments for completed tab
    }

    // Call the server action to get assignments with the appropriate options
    console.log(`🚗 [API-ASSIGNMENTS] Calling getAssignments server action for tab: ${tab || "all"}`)
    const assignments = await getAssignments(undefined, undefined, options)

    console.log(`🚗 [API-ASSIGNMENTS] Returning ${assignments.length} assignments from API`)

    // Return the assignments as JSON
    return NextResponse.json(assignments)
  } catch (error) {
    console.error("🚗 [API-ASSIGNMENTS] Error fetching assignments:", error)
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 })
  }
}
