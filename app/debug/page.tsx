import { headers } from "next/headers"
import { sql } from "@vercel/postgres"

async function checkDatabaseConnection() {
  try {
    await sql`SELECT NOW()`
    return { status: "connected", error: null }
  } catch (error) {
    return { status: "error", error: error instanceof Error ? error.message : "Unknown error" }
  }
}

async function checkApiHealth() {
  try {
    const response = await fetch(`${process.env.VERCEL_URL}/api/health`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
    const data = await response.json()
    return { status: "ok", data }
  } catch (error) {
    return { status: "error", error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export default async function DebugPage() {
  const headersList = headers()
  const domain = headersList.get("host") || "Unknown"
  const dbStatus = await checkDatabaseConnection()
  const apiStatus = await checkApiHealth()

  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    HAS_DATABASE_URL: !!process.env.DATABASE_URL,
    HAS_POSTGRES_URL: !!process.env.POSTGRES_URL,
    HAS_POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
  }

  const buildInfo = {
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Debug Information</h1>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Environment Status</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          <pre className="whitespace-pre-wrap">{JSON.stringify(envVars, null, 2)}</pre>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Build Information</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          <pre className="whitespace-pre-wrap">{JSON.stringify(buildInfo, null, 2)}</pre>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Database Status</h2>
        <div className={`p-4 rounded-lg ${dbStatus.status === "connected" ? "bg-green-100" : "bg-red-100"}`}>
          <p>Status: {dbStatus.status}</p>
          {dbStatus.error && <p className="text-red-600">Error: {dbStatus.error}</p>}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">API Health Check</h2>
        <div className={`p-4 rounded-lg ${apiStatus.status === "ok" ? "bg-green-100" : "bg-red-100"}`}>
          <pre className="whitespace-pre-wrap">{JSON.stringify(apiStatus, null, 2)}</pre>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Request Information</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p>Domain: {domain}</p>
          <p>User Agent: {headersList.get("user-agent")}</p>
        </div>
      </section>
    </div>
  )
}

