import { forceUpdateReturnTimeForIF65XOX } from "@/app/actions/force-update-return-time"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const result = await forceUpdateReturnTimeForIF65XOX()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
