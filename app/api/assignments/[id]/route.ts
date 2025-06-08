import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid assignment ID" }, { status: 400 })
    }

    console.log(`[DEBUG] Fetching assignment with ID: ${id}`)

    // Get the assignment with all details
    const result = await query(
      `
      SELECT 
        id,
        type,
        location,
        team_lead,
        members,
        start_date,
        due_date,
        completion_date,
        status,
        hours,
        store_number,
        county,
        city,
        magazin,
        county_code,
        start_location,
        end_location,
        km,
        driving_time,
        store_points,
        car_plate,
        created_at,
        updated_at
      FROM assignments 
      WHERE id = $1
    `,
      [id],
    )

    console.log(`[DEBUG] Query result:`, result)

    if (!result.rows || result.rows.length === 0) {
      console.log(`[DEBUG] No assignment found with ID: ${id}`)
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    const assignment = result.rows[0]
    console.log(`[DEBUG] Found assignment:`, assignment)

    // Parse members if it's a JSON string
    if (typeof assignment.members === "string") {
      try {
        assignment.members = JSON.parse(assignment.members)
        console.log(`[DEBUG] Parsed members:`, assignment.members)
      } catch (e) {
        console.error("Error parsing members JSON:", e)
        assignment.members = []
      }
    }

    // Parse store_points if it's a JSON string
    if (typeof assignment.store_points === "string") {
      try {
        assignment.store_points = JSON.parse(assignment.store_points)
        console.log(`[DEBUG] Parsed store_points:`, assignment.store_points)
      } catch (e) {
        console.error("Error parsing store_points JSON:", e)
        assignment.store_points = []
      }
    }

    console.log(`[DEBUG] Returning assignment data:`, assignment)
    return NextResponse.json(assignment)
  } catch (error) {
    console.error("Error fetching assignment:", error)
    return NextResponse.json({ error: "Failed to fetch assignment" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get the password from the request
    const { password } = await request.json()

    // Validate the password
    if (password !== process.env.PASS_DELETE) {
      return NextResponse.json({ error: "Invalid password. Deletion not authorized." }, { status: 403 })
    }

    const id = Number.parseInt(params.id)

    // Check if the assignment exists
    const assignmentCheck = await query("SELECT id FROM assignments WHERE id = $1", [id])

    if (!assignmentCheck.rows || assignmentCheck.rows.length === 0) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    // First delete related records from assignment_members
    await query("DELETE FROM assignment_members WHERE assignment_id = $1", [id])

    // Then delete work logs associated with this assignment
    await query("DELETE FROM work_logs WHERE assignment_id = $1", [id])

    // Finally delete the assignment
    await query("DELETE FROM assignments WHERE id = $1", [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting assignment:", error)
    return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 })
  }
}
