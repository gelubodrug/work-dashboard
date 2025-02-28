import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    vercelUrl: process.env.VERCEL_URL || "Not set",
    environment: process.env.VERCEL_ENV || "development",
    fullUrl: `https://${process.env.VERCEL_URL || "localhost:3000"}`,
  })
}

