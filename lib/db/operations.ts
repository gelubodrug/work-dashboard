import { sql } from "@/lib/db"
import type { Assignment, User, WorkLog } from "./types"
import { z } from "zod"

const AssignmentSchema = z.object({
  id: z.number(),
  type: z.string(),
  start_date: z.string().nullable(),
  due_date: z.string(),
  completion_date: z.string().nullable(),
  location: z.string(),
  team_lead: z.string(),
  members: z.array(z.string()),
  status: z.string(),
  hours: z.number(),
})

export async function getAssignments(): Promise<Assignment[]> {
  const result = await sql`SELECT * FROM assignments`
  return z.array(AssignmentSchema).parse(result)
}

export async function setAssignments(assignments: Assignment[]): Promise<void> {
  try {
    // Delete all existing assignments
    await sql`DELETE FROM assignments`

    // Insert new assignments one by one
    for (const assignment of assignments) {
      await sql`
        INSERT INTO assignments (
          id, type, start_date, due_date, completion_date, 
          location, team_lead, members, status, hours
        ) 
        VALUES (
          ${assignment.id}, ${assignment.type}, ${assignment.start_date}, 
          ${assignment.due_date}, ${assignment.completion_date}, ${assignment.location}, 
          ${assignment.team_lead}, ${JSON.stringify(assignment.members)}, 
          ${assignment.status}, ${assignment.hours}
        )
      `
    }
  } catch (error) {
    console.error("Error setting assignments:", error)
    throw new Error(`Failed to set assignments: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function updateAssignment(assignment: Assignment): Promise<Assignment> {
  try {
    const result = await sql`
      UPDATE assignments
      SET
        type = ${assignment.type},
        start_date = ${assignment.start_date},
        due_date = ${assignment.due_date},
        completion_date = ${assignment.completion_date},
        location = ${assignment.location},
        team_lead = ${assignment.team_lead},
        members = ${JSON.stringify(assignment.members)},
        status = ${assignment.status},
        hours = ${assignment.hours}
      WHERE id = ${assignment.id}
      RETURNING *
    `

    if (!result || result.length === 0) {
      throw new Error(`No assignment found with ID: ${assignment.id}`)
    }

    return result[0] as Assignment
  } catch (error) {
    console.error("Error updating assignment:", error)
    throw new Error(`Failed to update assignment: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function getUsers(): Promise<User[]> {
  try {
    const result = await sql`SELECT * FROM users`
    return result.map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      status: row.status,
      total_hours: row.total_hours,
      current_assignment: row.current_assignment,
    }))
  } catch (error) {
    console.error("Error fetching users:", error)
    throw new Error(`Failed to fetch users: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function setUsers(users: User[]): Promise<void> {
  try {
    // Delete all existing users
    await sql`DELETE FROM users`

    // Insert new users one by one
    for (const user of users) {
      await sql`
        INSERT INTO users (
          id, name, email, role, status, 
          total_hours, current_assignment
        ) 
        VALUES (
          ${user.id}, ${user.name}, ${user.email}, 
          ${user.role}, ${user.status}, ${user.total_hours}, 
          ${user.current_assignment}
        )
      `
    }
  } catch (error) {
    console.error("Error setting users:", error)
    throw new Error(`Failed to set users: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function updateUser(user: User): Promise<User> {
  try {
    const result = await sql`
      UPDATE users
      SET
        name = ${user.name},
        email = ${user.email},
        role = ${user.role},
        status = ${user.status},
        total_hours = ${user.total_hours},
        current_assignment = ${user.current_assignment}
      WHERE id = ${user.id}
      RETURNING *
    `

    if (!result || result.length === 0) {
      throw new Error(`No user found with ID: ${user.id}`)
    }

    return result[0] as User
  } catch (error) {
    console.error("Error updating user:", error)
    throw new Error(`Failed to update user: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function createUser(user: Partial<Omit<User, "id">>): Promise<User> {
  try {
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

    return result[0] as User
  } catch (error) {
    console.error("Error creating user:", error)
    throw new Error(`Failed to create user: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function deleteUser(userId: number): Promise<void> {
  try {
    await sql`DELETE FROM users WHERE id = ${userId}`
  } catch (error) {
    console.error("Error deleting user:", error)
    throw new Error(`Failed to delete user: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function createWorkLog(workLog: Omit<WorkLog, "id" | "created_at" | "updated_at">): Promise<WorkLog> {
  const result = await sql`
    INSERT INTO work_logs (user_id, assignment_id, work_date, hours, description)
    VALUES (${workLog.user_id}, ${workLog.assignment_id}, ${workLog.work_date}, ${workLog.hours}, ${workLog.description})
    RETURNING *
  `
  return result[0]
}

export async function getWorkLogsByUser(userId: number, startDate: string, endDate: string): Promise<WorkLog[]> {
  const result = await sql`
    SELECT * FROM work_logs
    WHERE user_id = ${userId}
      AND work_date >= ${startDate}
      AND work_date <= ${endDate}
    ORDER BY work_date ASC
  `
  return result
}

export async function getTotalHoursByUser(userId: number, startDate: string, endDate: string): Promise<number> {
  const result = await sql`
    SELECT SUM(hours) as total_hours
    FROM work_logs
    WHERE user_id = ${userId}
      AND work_date >= ${startDate}
      AND work_date <= ${endDate}
  `
  return result[0].total_hours || 0
}

export async function getHoursByType(
  startDate: string,
  endDate: string,
): Promise<{
  deschideri: number
  interventii: number
  optimizari: number
}> {
  try {
    const result = await sql`
      SELECT 
        a.type,
        SUM(wl.hours) as total_hours
      FROM work_logs wl
      JOIN assignments a ON wl.assignment_id = a.id
      WHERE wl.work_date >= ${startDate}
      AND wl.work_date <= ${endDate}
      AND a.status = 'Finalizat'
      GROUP BY a.type
    `

    const hoursByType = {
      deschideri: 0,
      interventii: 0,
      optimizari: 0,
    }

    result.forEach((row) => {
      const type = row.type.toLowerCase()
      if (type in hoursByType) {
        hoursByType[type as keyof typeof hoursByType] = Number(row.total_hours) || 0
      }
    })

    return hoursByType
  } catch (error) {
    console.error("Error getting hours by type:", error)
    throw new Error(`Failed to get hours by type: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function getTotalHoursForPeriod(startDate: string, endDate: string): Promise<number> {
  try {
    const result = await sql`
      SELECT SUM(hours) as total_hours
      FROM work_logs
      WHERE work_date >= ${startDate}
      AND work_date <= ${endDate}
    `
    return Number(result[0]?.total_hours) || 0
  } catch (error) {
    console.error("Error getting total hours:", error)
    throw new Error(`Failed to get total hours: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function getWorkDistribution(startDate: Date, endDate: Date) {
  const result = await sql`
    SELECT 
      type,
      SUM(hours) as total_hours
    FROM 
      assignments
    WHERE 
      status = 'Finalizat'
      AND completion_date >= ${startDate.toISOString()}
      AND completion_date <= ${endDate.toISOString()}
    GROUP BY 
      type
  `

  const distribution = {
    deschidere: 0,
    interventie: 0,
    optimizare: 0,
  }

  result.forEach((row: { type: keyof typeof distribution; total_hours: number }) => {
    distribution[row.type.toLowerCase() as keyof typeof distribution] = Number(row.total_hours)
  })

  return distribution
}

