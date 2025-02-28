import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  const dbConfig = {
    DATABASE_URL: process.env.DATABASE_URL ? "Set" : "Not set",
    POSTGRES_URL: process.env.POSTGRES_URL ? "Set" : "Not set",
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ? "Set" : "Not set",
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ? "Set" : "Not set",
    POSTGRES_USER: process.env.POSTGRES_USER ? "Set" : "Not set",
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD ? "Set" : "Not set",
    POSTGRES_DATABASE: process.env.POSTGRES_DATABASE ? "Set" : "Not set",
  }

  try {
    const result = await sql`
      SELECT 
        current_database() as current_database, 
        current_schema() as current_schema,
        version() as postgres_version,
        (SELECT COUNT(*) FROM users) as user_count,
        (SELECT COUNT(*) FROM assignments) as assignment_count
    `
    return NextResponse.json({
      success: true,
      config: dbConfig,
      currentDatabase: result.rows[0].current_database,
      currentSchema: result.rows[0].current_schema,
      postgresVersion: result.rows[0].postgres_version,
      userCount: result.rows[0].user_count,
      assignmentCount: result.rows[0].assignment_count,
    })
  } catch (error) {
    console.error("Database connection error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
        config: dbConfig,
      },
      { status: 500 },
    )
  }
}

