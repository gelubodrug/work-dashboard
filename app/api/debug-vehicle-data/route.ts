import { debugVehicleData } from "@/app/actions/debug-vehicle-data"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const carPlate = request.nextUrl.searchParams.get("car") || "IF 65 XOX"

  try {
    const result = await debugVehicleData(carPlate)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
