"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"

interface CheckResult {
  name: string
  status: "success" | "error" | "warning"
  message: string
  details?: string
}

export default function DiagnosticsPage() {
  const [checks, setChecks] = useState<CheckResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const runDiagnostics = async () => {
      const results: CheckResult[] = []

      // Check database configuration
      try {
        const response = await fetch("/api/test-db-config")
        const data = await response.json()
        if (data.success) {
          results.push({
            name: "Database Configuration",
            status: "success",
            message: "Database connection successful",
            details: `Current Database: ${data.currentDatabase}, Current Schema: ${data.currentSchema}`,
          })
        } else {
          results.push({
            name: "Database Configuration",
            status: "error",
            message: "Database connection failed",
            details: data.error,
          })
        }

        // Check individual environment variables
        Object.entries(data.config).forEach(([key, value]) => {
          results.push({
            name: `Environment Variable: ${key}`,
            status: value === "Set" ? "success" : "error",
            message: value === "Set" ? `${key} is set` : `${key} is not set`,
          })
        })
      } catch (error) {
        results.push({
          name: "Database Configuration",
          status: "error",
          message: "Failed to test database configuration",
          details: error instanceof Error ? error.message : "Unknown error",
        })
      }

      // Check assignments fetch
      try {
        const response = await fetch("/api/assignments")
        const assignments = await response.json()
        const assignmentTypes = Object.keys(assignments)
        const totalAssignments = assignmentTypes.reduce((total, type) => total + assignments[type].length, 0)
        results.push({
          name: "Assignment Data Fetch",
          status: totalAssignments > 0 ? "success" : "warning",
          message:
            totalAssignments > 0
              ? `Successfully fetched ${totalAssignments} assignments`
              : "No assignments found in the database",
          details: `Assignment types: ${assignmentTypes.join(", ")}, Total assignments: ${totalAssignments}`,
        })
      } catch (error) {
        results.push({
          name: "Assignment Data Fetch",
          status: "error",
          message: "Failed to fetch assignment data",
          details: error instanceof Error ? error.message : "Unknown error",
        })
      }

      // Check API routes
      const apiRoutes = ["/api/assignments", "/api/users", "/api/sync-statuses", "/api/check-user-statuses"]

      for (const route of apiRoutes) {
        try {
          const response = await fetch(route)
          results.push({
            name: `API Route: ${route}`,
            status: response.ok ? "success" : "error",
            message: response.ok ? "Route accessible" : "Route not accessible",
            details: response.ok ? `Status: ${response.status}` : `Status: ${response.status}`,
          })
        } catch (error) {
          results.push({
            name: `API Route: ${route}`,
            status: "error",
            message: "Failed to access route",
            details: error instanceof Error ? error.message : "Unknown error",
          })
        }
      }

      // Check Node.js version
      const nodeVersion = process.version
      results.push({
        name: "Node.js Version",
        status: "success",
        message: `Current Node.js version: ${nodeVersion}`,
        details: "Ensure this matches the version set in your Vercel project settings",
      })

      setChecks(results)
      setIsLoading(false)
    }

    runDiagnostics()
  }, [])

  const getStatusIcon = (status: CheckResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: CheckResult["status"]) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Success
          </Badge>
        )
      case "error":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Error
          </Badge>
        )
      case "warning":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Warning
          </Badge>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            <p className="text-center mt-4">Running diagnostics...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const hasErrors = checks.some((check) => check.status === "error")

  return (
    <div className="container mx-auto py-6">
      {hasErrors && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Deployment Issues Detected</AlertTitle>
          <AlertDescription>Some checks have failed. Please review the diagnostics below.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Project Diagnostics</CardTitle>
          <CardDescription>Checking project configuration and dependencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {checks.map((check, index) => (
              <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(check.status)}
                    <h3 className="font-medium">{check.name}</h3>
                  </div>
                  {getStatusBadge(check.status)}
                </div>
                <p className="text-sm text-muted-foreground ml-7">{check.message}</p>
                {check.details && (
                  <p className="text-sm text-muted-foreground ml-7 mt-1 font-mono bg-muted p-2 rounded">
                    {check.details}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

