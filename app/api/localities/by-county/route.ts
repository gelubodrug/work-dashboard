import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

// Create a reusable SQL client
const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const county = searchParams.get("county")

    if (!county) {
      return NextResponse.json(
        {
          success: false,
          error: "County parameter is required",
        },
        { status: 400 },
      )
    }

    console.log(`[LOCALITIES] Fetching localities for county: ${county}`)

    // Check if the localities table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'localitati'
      ) as exists
    `

    const tableExists = tableCheck[0]?.exists

    if (!tableExists) {
      return NextResponse.json({
        success: false,
        error: "Localities table does not exist",
        localities: [],
      })
    }

    // Fetch localities for the specified county using ILIKE for case-insensitive matching
    const localities = await sql`
      SELECT nume FROM localitati 
      WHERE LOWER(judet) = LOWER(${county})
      ORDER BY nume ASC
    `

    // If no localities found with exact match, try a more flexible search
    if (localities.length === 0) {
      // Try to find counties that contain the search term
      const suggestedCounties = await sql`
        SELECT DISTINCT judet FROM localitati 
        WHERE LOWER(judet) LIKE LOWER(${"%" + county + "%"})
        ORDER BY judet ASC
        LIMIT 5
      `

      if (suggestedCounties.length > 0) {
        return NextResponse.json({
          success: false,
          error: "No localities found for the exact county name",
          suggestions: suggestedCounties.map((c) => c.judet),
          localities: [],
        })
      }
    }

    return NextResponse.json({
      success: true,
      localities: localities.map((loc) => loc.nume),
      count: localities.length,
    })
  } catch (error) {
    console.error("[LOCALITIES] Error fetching localities:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        localities: [],
      },
      { status: 500 },
    )
  }
}
