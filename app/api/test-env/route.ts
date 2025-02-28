import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    isConfigured: !!process.env.NEXT_PUBLIC_API_BASE_URL,
    timestamp: new Date().toISOString(),
  })
}

