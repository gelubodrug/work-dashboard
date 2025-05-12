import { createVehiclePresenceIndexes } from "@/app/actions/db-migrations"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const result = await createVehiclePresenceIndexes()

    if (result.success) {
      return NextResponse.json({ success: true, message: result.message })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
