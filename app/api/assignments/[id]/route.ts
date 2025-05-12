import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get the password from the request
    const { password } = await request.json()

    // Validate the password
    if (password !== process.env.PASS_DELETE) {
      return NextResponse.json({ error: "Invalid password. Deletion not authorized." }, { status: 403 })
    }

    const id = Number.parseInt(params.id)

    // Check if the assignment exists
    const assignmentCheck = await query("SELECT id FROM assignments WHERE id = $1", [id])

    if (!assignmentCheck || assignmentCheck.length === 0) {
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
