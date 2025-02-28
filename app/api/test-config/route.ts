import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    // Test database connection
    const result = await sql`SELECT NOW() as current_time`

    console.log("Database query result:", JSON.stringify(result, null, 2))

    if (!result || !result.rows || result.rows.length === 0) {
      throw new Error("No rows returned from database query")
    }

    const currentTime = result.rows[0]?.current_time

    if (!currentTime) {
      throw new Error("current_time not found in query result")
    }

    // Test write operation
    const testKey = `test_${Date.now()}`
    await sql`CREATE TABLE IF NOT EXISTS test_table (key TEXT PRIMARY KEY, value TEXT)`
    await sql`INSERT INTO test_table (key, value) VALUES (${testKey}, 'test_value') ON CONFLICT (key) DO UPDATE SET value = 'test_value'`

    return NextResponse.json({
      success: true,
      message: "Neon database connection test successful",
      timestamp: currentTime,
      testKey,
      config: {
        databaseUrlSet: !!process.env.DATABASE_URL,
      },
    })
  } catch (error) {
    console.error("Neon database test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
        errorDetails: error instanceof Error ? error.stack : undefined,
        config: {
          databaseUrlSet: !!process.env.DATABASE_URL,
        },
      },
      {
        status: 500,
      },
    )
  }
}

