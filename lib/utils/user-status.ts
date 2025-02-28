import { sql } from "@/lib/db"
import type { User } from "@/lib/db"

export async function updateUserStatusFromAssignment(
  userName: string,
  assignmentType: string,
  assignmentStatus: string,
  assignmentLocation: string,
): Promise<User | null> {
  let newStatus = "Liber"
  let currentAssignment = null

  // Only update status if the assignment is active
  if (assignmentStatus === "Asigned") {
    newStatus = "Asigned"
    currentAssignment = `${assignmentType} - ${assignmentLocation}`
  } else if (assignmentStatus === "In Deplasare") {
    newStatus = "In Deplasare"
    currentAssignment = `${assignmentType} - ${assignmentLocation}`
  }
  // When assignment is Finalizat, always set user to Liber
  // This ensures users are freed up when their assignment is completed

  console.log(`Updating status for ${userName} to ${newStatus}`)

  const result = await sql`
    UPDATE users 
    SET 
      status = ${newStatus}, 
      current_assignment = ${currentAssignment}
    WHERE name = ${userName}
    RETURNING *
  `

  if (!result || result.length === 0) {
    console.log(`No user found with name: ${userName}`)
    return null
  }

  const updatedUser = result[0] as User
  console.log(`Updated status for ${userName} to ${newStatus}`)
  return updatedUser
}

export async function updateTeamStatus(
  teamLead: string,
  members: string[],
  assignmentType: string,
  assignmentStatus: string,
  assignmentLocation: string,
): Promise<User[]> {
  const updatedUsers: User[] = []
  const allTeamMembers = [teamLead, ...members.filter((member) => member && member !== "None")]

  // Update all team members' status
  for (const member of allTeamMembers) {
    const updatedMember = await updateUserStatusFromAssignment(
      member,
      assignmentType,
      assignmentStatus,
      assignmentLocation,
    )
    if (updatedMember) {
      updatedUsers.push(updatedMember)
    }
  }

  // If the assignment is completed, ensure all team members are set to "Liber"
  if (assignmentStatus === "Finalizat") {
    for (const member of allTeamMembers) {
      await sql`
        UPDATE users 
        SET 
          status = 'Liber', 
          current_assignment = NULL
        WHERE name = ${member}
      `
    }
  }

  return updatedUsers
}

export async function syncUserStatuses(): Promise<void> {
  try {
    console.log("Starting user status synchronization")

    // First, reset all users to "Liber"
    await sql`
      UPDATE users 
      SET status = 'Liber', current_assignment = NULL
    `

    // Get all active assignments (not Finalizat)
    const assignments = await sql`
      SELECT * FROM assignments 
      WHERE status != 'Finalizat'
    `

    // Update status for all team members in active assignments
    for (const assignment of assignments) {
      const allTeamMembers = [
        assignment.team_lead,
        ...(assignment.members || []).filter((member: string) => member && member !== "None"),
      ]

      for (const member of allTeamMembers) {
        await updateUserStatusFromAssignment(member, assignment.type, assignment.status, assignment.location)
      }
    }

    console.log("User statuses synchronized successfully")
  } catch (error) {
    console.error("Error synchronizing user statuses:", error)
    throw error
  }
}

