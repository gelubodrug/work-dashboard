"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function EnvStatus() {
  const [status, setStatus] = useState<{
    vercelUrl?: string
    publicVercelUrl?: string
    environment?: string
    baseUrl?: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/verify-config")
      .then((res) => res.json())
      .then((data) => setStatus(data.config))
      .catch((err) => setError(err.message))
  }, [])

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!status) {
    return <div>Loading environment status...</div>
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Environment Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">VERCEL_URL</span>
            {status.vercelUrl ? (
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
            <span className="text-sm">NEXT_PUBLIC_VERCEL_URL</span>
            {status.publicVercelUrl ? (
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
          <div className="mt-4 text-xs text-muted-foreground">
            <p>Environment: {status.environment}</p>
            <p>Base URL: {status.baseUrl}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

