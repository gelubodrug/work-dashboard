"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

interface ErrorComponentProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorComponent({ error, reset }: ErrorComponentProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Unhandled error:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-muted-foreground mb-4">{error.message || "An unexpected error occurred. Please try again."}</p>
      {error.digest && <p className="text-sm text-muted-foreground mb-4">Error ID: {error.digest}</p>}
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}

