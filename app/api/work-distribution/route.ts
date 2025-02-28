import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { startOfDay, endOfDay } from "date-fns"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fromDate = searchParams.get("from")
  const toDate = searchParams.get("to")

  if (!fromDate || !toDate) {
    return NextResponse.json({ error: "Missing date range parameters" }, { status: 400 })
  }

  try {
    const result = await sql`
      SELECT 
        type,
        SUM(hours) as total_hours
      FROM 
        assignments
      WHERE 
        status = 'Finalizat'
        AND completion_date >= ${startOfDay(new Date(fromDate)).toISOString()}
        AND completion_date <= ${endOfDay(new Date(toDate)).toISOString()}
      GROUP BY 
        type
    `

    const formattedResult = result.reduce(
      (acc, { type, total_hours }) => {
        acc[type.toLowerCase()] = Number.parseInt(total_hours)
        return acc
      },
      { deschidere: 0, interventie: 0, optimizare: 0 },
    )

    return NextResponse.json(formattedResult)
  } catch (error) {
    console.error("Error fetching work distribution:", error)
    return NextResponse.json({ error: "An error occurred while fetching data" }, { status: 500 })
  }
}

