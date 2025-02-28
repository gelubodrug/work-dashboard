"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle } from "lucide-react"

interface ConfigData {
  checks: {
    hasVercelUrl: boolean
    hasPublicVercelUrl: boolean
  }
  config: Record<string, unknown>
}

export default function VerifyPage() {
  const [config, setConfig] = useState<ConfigData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/verify-config")
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch((err) => setError(err.message))
  }, [])

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!config) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Configuration Verification</h1>

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>VERCEL_URL</span>
                {config.checks.hasVercelUrl ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Set
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">
                    <XCircle className="w-4 h-4 mr-1" />
                    Missing
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span>NEXT_PUBLIC_VERCEL_URL</span>
                {config.checks.hasPublicVercelUrl ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Set
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">
                    <XCircle className="w-4 h-4 mr-1" />
                    Missing
                  </Badge>
                )}
              </div>
            </div>

            <div className="mt-6 bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Configuration Details</h3>
              <pre className="text-sm overflow-auto">{JSON.stringify(config.config, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

