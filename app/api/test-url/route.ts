import { NextResponse } from "next/server"
import { getBaseUrl } from "@/lib/utils/get-base-url"

export async function GET() {
  const baseUrl = getBaseUrl()

  return NextResponse.json({
    baseUrl,
    vercelUrl: process.env.VERCEL_URL || "Not set",
    environment: process.env.NODE_ENV,
    vercelEnvironment: process.env.VERCEL_ENV || "development",
  })
}

