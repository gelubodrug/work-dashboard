import { NextResponse } from "next/server"

export async function GET() {
  const config = {
    vercelUrl: process.env.VERCEL_URL,
    publicVercelUrl: process.env.NEXT_PUBLIC_VERCEL_URL,
    environment: process.env.VERCEL_ENV || "development",
    baseUrl: `https://${process.env.VERCEL_URL || "localhost:3000"}`,
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json({
    status: "ok",
    config,
    checks: {
      hasVercelUrl: !!process.env.VERCEL_URL,
      hasPublicVercelUrl: !!process.env.NEXT_PUBLIC_VERCEL_URL,
      isProduction: process.env.VERCEL_ENV === "production",
    },
  })
}

