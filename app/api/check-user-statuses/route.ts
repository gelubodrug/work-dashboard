import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const users = await sql`
      SELECT name, status, current_assignment 
      FROM users 
      WHERE status != 'Liber' OR current_assignment IS NOT NULL
    `

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error checking user statuses:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}

