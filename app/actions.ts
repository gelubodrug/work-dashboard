import { sql } from "@/lib/db"
import type { User, Assignment, WorkLog } from "@/lib/db/types"
import { updateTeamStatus } from "@/lib/utils/user-status"
import { differenceInHours, parseISO, addHours } from "date-fns"

export async function fetchAssignments() {
  try {
    const assignments = await sql`SELECT * FROM assignments`
    return assignments
  } catch (error) {
    console.error("Error fetching assignments:", error)
    throw new Error(`Failed to fetch assignments: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
  }
}

export async function updateAssignments(assignments: Assignment[]) {
  try {
    const updatedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        const updatedAssignment = await sql`UPDATE assignments SET 
        type = ${assignment.type}, 
        start_date = ${assignment.start_date}, 
        due_date = ${assignment.due_date}, 
        completion_date = ${assignment.completion_date}, 
        location = ${assignment.location}, 
        team_lead = ${assignment.team_lead}, 
        members = ${JSON.stringify(assignment.members)}, 
        status = ${assignment.status}, 
        hours = ${assignment.hours} 
        WHERE id = ${assignment.id} RETURNING *`
        return updatedAssignment[0]
      }),
    )
    return updatedAssignments
  } catch (error) {
    console.error("Error updating assignments:", error)
    throw new Error(`Failed to update assignments: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
  }
}

// Replace the createAssignment function with this updated version
export const createAssignment = async (assignment: Omit<Assignment, "id">): Promise<Assignment> => {
  try {
    console.log("Creating assignment with data:", JSON.stringify(assignment, null, 2))

    const result = await sql`
      INSERT INTO assignments (
        type, location, due_date, team_lead, members, status, hours, start_date, completion_date
      ) VALUES (
        ${assignment.type},
        ${assignment.location},
        ${assignment.due_date},
        ${assignment.team_lead},
        ${JSON.stringify(assignment.members)}::jsonb,
        ${assignment.status},
        ${assignment.hours || 0},
        ${assignment.start_date || null},
        ${assignment.completion_date || null}
      )
      RETURNING *
    `

    console.log("Assignment created successfully:", JSON.stringify(result[0], null, 2))
    return result[0]
  } catch (error) {
    console.error("Detailed error in createAssignment:", error)
    throw new Error(`Failed to create assignment: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
  }
}

export async function updateAssignment(assignment: Assignment): Promise<Assignment> {
  try {
    console.log("Updating assignment:", JSON.stringify(assignment, null, 2))
    // Ensure we're using the correct status based on dates
    let status = assignment.status
    if (assignment.completion_date) {
      status = "Finalizat"
    } else if (assignment.start_date) {
      const startDate = addHours(new Date(assignment.start_date), 2) // Adjust for Romania time (UTC+2)
      const now = addHours(new Date(), 2) // Adjust current time for Romania
      if (startDate <= now) {
        status = "In Deplasare"
      } else {
        status = "Asigned"
      }
    } else {
      status = "Asigned"
    }

    const updatedAssignment = await sql`
      UPDATE assignments SET 
        type = ${assignment.type}, 
        start_date = ${assignment.start_date}, 
        due_date = ${assignment.due_date}, 
        completion_date = ${assignment.completion_date}, 
        location = ${assignment.location}, 
        team_lead = ${assignment.team_lead}, 
        members = ${JSON.stringify(assignment.members)}::jsonb, 
        status = ${status}, 
        hours = ${assignment.hours} 
      WHERE id = ${assignment.id} 
      RETURNING *
    `

    console.log("SQL query result:", JSON.stringify(updatedAssignment, null, 2))

    if (!updatedAssignment || updatedAssignment.length === 0) {
      throw new Error(`No assignment found with ID: ${assignment.id}`)
    }

    // Update team members' status based on the new assignment status
    await updateTeamStatus(assignment.team_lead, assignment.members || [], assignment.type, status, assignment.location)

    // If the assignment is marked as 'Finalizat', create work log entries
    if (status === "Finalizat" && assignment.start_date && assignment.completion_date) {
      const hours = differenceInHours(new Date(assignment.completion_date), new Date(assignment.start_date))

      // Create work log for team lead
      await createWorkLog({
        user_id: await getUserIdByName(assignment.team_lead),
        assignment_id: assignment.id,
        work_date: assignment.completion_date,
        hours: hours,
        description: `Completed ${assignment.type} assignment in ${assignment.location}`,
      })

      // Create work logs for team members
      for (const member of assignment.members || []) {
        await createWorkLog({
          user_id: await getUserIdByName(member),
          assignment_id: assignment.id,
          work_date: assignment.completion_date,
          hours: hours,
          description: `Completed ${assignment.type} assignment in ${assignment.location}`,
        })
      }
    }

    // Update total hours for all team members
    const teamMembers = [assignment.team_lead, ...(assignment.members || [])]
    for (const member of teamMembers) {
      const user = await sql`SELECT id FROM users WHERE name = ${member}`
      if (user && user.length > 0) {
        await updateUserTotalHours(user[0].id)
      }
    }

    console.log("Assignment updated successfully:", JSON.stringify(updatedAssignment[0], null, 2))
    return updatedAssignment[0]
  } catch (error) {
    console.error("Error updating assignment:", error)
    throw new Error(`Failed to update assignment: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
  }
}

export async function deleteAssignment(id: number): Promise<void> {
  try {
    await sql`DELETE FROM assignments WHERE id = ${id}`
  } catch (error) {
    console.error("Error deleting assignment:", error)
    throw new Error(`Failed to delete assignment: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
  }
}

export async function fetchUsers() {
  try {
    const users = await sql`SELECT * FROM users`
    return users
  } catch (error) {
    console.error("Error fetching users:", error)
    throw new Error(`Failed to fetch users: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
  }
}

export async function updateUsers(users: User[]) {
  try {
    const updatedUsers = await Promise.all(
      users.map(async (user) => {
        const updatedUser = await sql`UPDATE users SET 
        name = ${user.name}, 
        email = ${user.email}, 
        role = ${user.role}, 
        status = ${user.status}, 
        total_hours = ${user.total_hours}, 
        current_assignment = ${user.current_assignment} 
        WHERE id = ${user.id} RETURNING *`
        return updatedUser[0]
      }),
    )
    return updatedUsers
  } catch (error) {
    console.error("Error updating users:", error)
    throw new Error(`Failed to update users: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
  }
}

export async function createUser(user: Partial<Omit<User, "id">>): Promise<User> {
  try {
    console.log("Creating new user:", user)
    const result = await sql`
      INSERT INTO users (
        name, email, role, status, 
        total_hours, current_assignment
      )
      VALUES (
        ${user.name || null}, 
        ${user.email || null}, 
        ${user.role || null},
        'Liber',
        0,
        null
      )
      RETURNING *
    `

    if (!result || result.length === 0) {
      throw new Error("No rows returned after insert")
    }

    const newUser = result[0] as User
    console.log("New user created successfully:", newUser)
    return newUser
  } catch (error) {
    console.error("Error in createUser:", error)
    throw new Error(`Failed to create user: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
  }
}

export async function updateUser(user: User): Promise<User> {
  try {
    const updatedUser = await sql`UPDATE users SET 
      name = ${user.name}, 
      email = ${user.email}, 
      role = ${user.role}, 
      status = ${user.status}, 
      total_hours = ${user.total_hours}, 
      current_assignment = ${user.current_assignment} 
      WHERE id = ${user.id} RETURNING *`
    return updatedUser[0]
  } catch (error) {
    console.error("Error updating user:", error)
    throw new Error(`Failed to update user: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
  }
}

export async function deleteUser(userId: number): Promise<void> {
  try {
    await sql`DELETE FROM users WHERE id = ${userId}`
  } catch (error) {
    console.error("Error deleting user:", error)
    throw new Error(`Failed to delete user: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
  }
}

export async function updateUserTotalHours(userId: number): Promise<void> {
  try {
    const user = await sql`SELECT name FROM users WHERE id = ${userId}`
    if (!user || user.length === 0) {
      throw new Error(`User not found with ID: ${userId}`)
    }

    const assignments = await sql`
      SELECT * FROM assignments 
      WHERE (team_lead = ${user[0].name}
      OR members::jsonb @> to_jsonb(${user[0].name}::text))
      AND status = 'Finalizat'
    `

    let totalHours = 0
    for (const assignment of assignments) {
      if (assignment.start_date && assignment.completion_date) {
        const startDate = parseISO(assignment.start_date)
        const endDate = parseISO(assignment.completion_date)
        totalHours += differenceInHours(endDate, startDate)
      }
    }

    await sql`
      UPDATE users 
      SET total_hours = ${totalHours}
      WHERE id = ${userId}
    `

    console.log(`Updated total hours for user ${user[0].name}: ${totalHours}`)
  } catch (error) {
    console.error("Error updating user total hours:", error)
    throw new Error(
      `Failed to update user total hours: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
    )
  }
}

export async function resetAllUsersTotalHours(): Promise<void> {
  try {
    await sql`UPDATE users SET total_hours = 0`
    console.log("All users' total hours have been reset to 0")
  } catch (error) {
    console.error("Error resetting all users' total hours:", error)
    throw new Error(
      `Failed to reset all users' total hours: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
    )
  }
}

export async function recalculateAllUsersTotalHours(): Promise<void> {
  try {
    const users = await sql`SELECT id FROM users`

    for (const user of users) {
      await updateUserTotalHours(user.id)
    }

    console.log("All users' total hours have been recalculated")
  } catch (error) {
    console.error("Error recalculating all users' total hours:", error)
    throw new Error(
      `Failed to recalculate all users' total hours: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
    )
  }
}

async function createWorkLog(workLog: Omit<WorkLog, "id" | "created_at" | "updated_at">): Promise<WorkLog> {
  try {
    const result = await sql`
      INSERT INTO work_logs (user_id, assignment_id, work_date, hours, description)
      VALUES (${workLog.user_id}, ${workLog.assignment_id}, ${workLog.work_date}, ${workLog.hours}, ${workLog.description})
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error creating work log:", error)
    throw new Error(`Failed to create work log: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
  }
}

async function getUserIdByName(name: string): Promise<number> {
  try {
    const result = await sql`SELECT id FROM users WHERE name = ${name}`
    if (result && result.length > 0) {
      return result[0].id
    }
    throw new Error(`User not found with name: ${name}`)
  } catch (error) {
    console.error("Error getting user ID by name:", error)
    throw new Error(`Failed to get user ID: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
  }
}

