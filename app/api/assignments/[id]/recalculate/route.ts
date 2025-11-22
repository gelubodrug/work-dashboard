import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const assignmentId = Number.parseInt(params.id)

    if (isNaN(assignmentId)) {
      return NextResponse.json({ error: "Invalid assignment ID" }, { status: 400 })
    }

    // Get the assignment details
    const result = await query(`SELECT id, city, county, store_points FROM assignments WHERE id = $1`, [assignmentId])

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    const assignment = result.rows[0]

    // Parse store_points if it's a JSON string
    let storePoints = []
    if (typeof assignment.store_points === "string") {
      try {
        storePoints = JSON.parse(assignment.store_points)
      } catch (e) {
        console.error("Error parsing store_points:", e)
      }
    } else if (Array.isArray(assignment.store_points)) {
      storePoints = assignment.store_points
    }

    // If we have store points, use the multi-point route calculation
    if (storePoints && storePoints.length > 0) {
      const routeResponse = await fetch(
        `${process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"}/api/calculate-multi-point-route-google`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            storeIds: storePoints,
          }),
        },
      )

      if (!routeResponse.ok) {
        throw new Error("Failed to calculate multi-point route")
      }

      const routeData = await routeResponse.json()

      // Update the assignment with the calculated distance
      await query(
        `UPDATE assignments
         SET km = $1, driving_time = $2
         WHERE id = $3`,
        [routeData.totalDistance, routeData.totalDuration, assignmentId],
      )

      return NextResponse.json({
        success: true,
        km: routeData.totalDistance,
        driving_time: routeData.totalDuration,
      })
    } else {
      // Fallback to simple city/county calculation
      if (!assignment.city || !assignment.county) {
        return NextResponse.json({ error: "City and county are required for distance calculation" }, { status: 400 })
      }

      const routeResponse = await fetch(
        `${process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"}/api/test/calculate-route?city=${encodeURIComponent(assignment.city)}&county=${encodeURIComponent(assignment.county)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (!routeResponse.ok) {
        const errorData = await routeResponse.json()
        return NextResponse.json({ error: errorData.error || "Failed to calculate distance" }, { status: 500 })
      }

      const routeData = await routeResponse.json()

      // Update the assignment with the calculated distance
      await query(
        `UPDATE assignments
         SET km = $1, driving_time = $2
         WHERE id = $3`,
        [routeData.distance, routeData.duration, assignmentId],
      )

      return NextResponse.json({
        success: true,
        km: routeData.distance,
        driving_time: routeData.duration,
      })
    }
  } catch (error) {
    console.error("Error recalculating distance:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
