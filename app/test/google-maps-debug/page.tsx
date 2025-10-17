"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"

export default function GoogleMapsDebugPage() {
  const [apiKey, setApiKey] = useState<string>("")
  const [apiKeyExists, setApiKeyExists] = useState<boolean>(false)
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false)
  const [scriptError, setScriptError] = useState<string>("")
  const [currentDomain, setCurrentDomain] = useState<string>("")

  useEffect(() => {
    // Check if API key exists
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API
    setApiKeyExists(!!key)
    if (key) {
      // Show masked version
      setApiKey(`${key.substring(0, 8)}...${key.substring(key.length - 4)}`)
    }

    // Get current domain
    setCurrentDomain(window.location.hostname)

    // Try to load Google Maps
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}`
    script.async = true
    script.defer = true

    script.onload = () => {
      setScriptLoaded(true)
    }

    script.onerror = () => {
      setScriptError("Failed to load Google Maps script")
    }

    // Listen for Google Maps errors
    window.addEventListener("error", (event) => {
      if (event.message && event.message.includes("Google Maps")) {
        setScriptError(event.message)
      }
    })

    document.head.appendChild(script)

    return () => {
      script.remove()
    }
  }, [])

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Google Maps API Diagnostics</CardTitle>
          <CardDescription>This page helps diagnose issues with Google Maps API configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* API Key Check */}
          <div className="flex items-start space-x-3">
            {apiKeyExists ? (
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="font-medium">API Key Configuration</div>
              <div className="text-sm text-muted-foreground">
                {apiKeyExists ? (
                  <div>
                    <div>API Key is set: {apiKey}</div>
                    <div className="text-xs text-gray-500 mt-1">Environment variable: NEXT_PUBLIC_GOOGLE_MAPS_API</div>
                  </div>
                ) : (
                  <div className="text-red-600">
                    API Key is not set. Please add NEXT_PUBLIC_GOOGLE_MAPS_API to your environment variables.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Domain Check */}
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="flex-1">
              <div className="font-medium">Current Domain</div>
              <div className="text-sm text-muted-foreground">
                <div>
                  Your app is running on: <code className="bg-gray-100 px-1 rounded">{currentDomain}</code>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Make sure this domain is authorized in your Google Cloud Console under "API restrictions" → "HTTP
                  referrers"
                </div>
              </div>
            </div>
          </div>

          {/* Script Loading Check */}
          <div className="flex items-start space-x-3">
            {scriptLoaded ? (
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            ) : scriptError ? (
              <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
            ) : (
              <div className="h-5 w-5 mt-0.5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            )}
            <div className="flex-1">
              <div className="font-medium">Google Maps Script Loading</div>
              <div className="text-sm text-muted-foreground">
                {scriptLoaded ? (
                  <div className="text-green-600">Google Maps API loaded successfully!</div>
                ) : scriptError ? (
                  <div className="text-red-600">{scriptError}</div>
                ) : (
                  <div>Loading Google Maps API...</div>
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>How to fix ApiProjectMapError</AlertTitle>
            <AlertDescription className="space-y-2 text-sm">
              <div>If you're seeing ApiProjectMapError, follow these steps:</div>
              <ol className="list-decimal ml-4 space-y-1">
                <li>
                  Go to{" "}
                  <a
                    href="https://console.cloud.google.com/google/maps-apis/credentials"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Google Cloud Console
                  </a>
                </li>
                <li>Select your project</li>
                <li>Click on your API key</li>
                <li>Under "API restrictions", make sure "Maps JavaScript API" is enabled</li>
                <li>
                  Under "Website restrictions", add your domains:
                  <ul className="list-disc ml-4 mt-1">
                    <li>
                      <code className="bg-gray-100 px-1 rounded">{currentDomain}/*</code>
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 rounded">localhost/*</code> (for local development)
                    </li>
                    <li>
                      <code className="bg-gray-100 px-1 rounded">*.vercel.app/*</code> (if using Vercel)
                    </li>
                  </ul>
                </li>
                <li>Click "Save"</li>
                <li>Wait a few minutes for changes to propagate</li>
              </ol>
            </AlertDescription>
          </Alert>

          {/* Environment Variables */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Environment Variables</AlertTitle>
            <AlertDescription className="space-y-2 text-sm">
              <div>
                Make sure you have set the following in your{" "}
                <code className="bg-gray-100 px-1 rounded">.env.local</code> file:
              </div>
              <pre className="bg-gray-100 p-2 rounded text-xs">NEXT_PUBLIC_GOOGLE_MAPS_API=your_api_key_here</pre>
              <div className="text-xs text-gray-500">
                Note: The variable must start with NEXT_PUBLIC_ to be accessible in the browser
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
