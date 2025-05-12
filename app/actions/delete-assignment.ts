"use server"

import { revalidatePath } from "next/cache"
import { query } from "@/lib/db"

export async function deleteAssignment(id: number, password: string) {
  // Validate the password against the environment variable
  if (password !== process.env.PASS_DELETE) {
    return {
      success: false,
      error: "Invalid password. Deletion not authorized.",
    }
  }

  try {
    // Check if the assignment exists
    const assignmentCheck = await query("SELECT id FROM assignments WHERE id = $1", [id])

    if (!assignmentCheck || assignmentCheck.length === 0) {
      return {
        success: false,
        error: "Assignment not found",
      }
    }

    // First, get the assignment details to update user statuses
    const assignmentResult = await query(`SELECT team_lead, members FROM assignments WHERE id = $1`, [id])

    const rows = assignmentResult.rows

    if (rows.length > 0) {
      const assignment = rows[0]
      const teamLead = assignment.team_lead
      const members = Array.isArray(assignment.members)
        ? assignment.members
        : typeof assignment.members === "string"
          ? JSON.parse(assignment.members)
          : []

      // Function to update user status to "Liber"
      const updateStatusToLiber = async (userName: string) => {
        await query(`UPDATE users SET status = 'Liber', current_assignment = NULL WHERE name = $1`, [userName])
        console.log(`[DEBUG] Updated status to 'Liber' for user: ${userName}`)
      }

      // Update team lead status
      if (teamLead) {
        await updateStatusToLiber(teamLead)
      }

      // Update team members' statuses
      for (const member of members) {
        if (member) {
          await updateStatusToLiber(member)
        }
      }
    }

    // Then, delete the work logs associated with the assignment
    await query("DELETE FROM work_logs WHERE assignment_id = $1", [id])

    // Then delete the assignment itself
    await query("DELETE FROM assignments WHERE id = $1", [id])

    revalidatePath("/assignments")
    return {
      success: true,
      message: "Assignment and related work logs successfully deleted",
    }
  } catch (error) {
    console.error("Error deleting assignment:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}
