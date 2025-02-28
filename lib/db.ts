import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import type { Assignment, User } from "./types"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

const sql = neon(process.env.DATABASE_URL)
export const db = drizzle(sql)

export async function getAssignments(): Promise<Assignment[]> {
  try {
    const result = await db.execute("SELECT * FROM assignments")
    return result.rows as Assignment[]
  } catch (error) {
    console.error("Error fetching assignments:", error)
    throw new Error(`Failed to fetch assignments: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function setAssignments(assignments: Assignment[]): Promise<void> {
  try {
    await db.execute("DELETE FROM assignments")

    for (const assignment of assignments) {
      await db.execute(
        `
        INSERT INTO assignments (
          id, type, start_date, due_date, completion_date, 
          location, team_lead, members, status, hours
        ) 
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        )
      `,
        [
          assignment.id,
          assignment.type,
          assignment.start_date,
          assignment.due_date,
          assignment.completion_date,
          assignment.location,
          assignment.team_lead,
          JSON.stringify(assignment.members),
          assignment.status,
          assignment.hours,
        ],
      )
    }
  } catch (error) {
    console.error("Error setting assignments:", error)
    throw new Error(`Failed to set assignments: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function getUsers(): Promise<User[]> {
  try {
    const result = await db.execute("SELECT * FROM users")
    return result.rows as User[]
  } catch (error) {
    console.error("Error fetching users:", error)
    throw new Error(`Failed to fetch users: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function setUsers(users: User[]): Promise<void> {
  try {
    await db.execute("DELETE FROM users")

    for (const user of users) {
      await db.execute(
        `
        INSERT INTO users (
          id, name, email, role, status, 
          total_hours, current_assignment
        ) 
        VALUES (
          $1, $2, $3, $4, $5, $6, $7
        )
      `,
        [user.id, user.name, user.email, user.role, user.status, user.total_hours, user.current_assignment],
      )
    }
  } catch (error) {
    console.error("Error setting users:", error)
    throw new Error(`Failed to set users: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function initializeDefaultUsers(): Promise<void> {
  try {
    const defaultUsers: User[] = [
      {
        id: 1,
        name: null,
        email: null,
        role: null,
        status: "",
        total_hours: 0,
        current_assignment: null,
      },
      // Add more default users if needed
    ]
    await setUsers(defaultUsers)
    console.log("Default users initialized successfully")
  } catch (error) {
    console.error("Error initializing default users:", error)
    throw new Error(`Failed to initialize default users: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export { sql }

