"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"

// Declare window.google type
declare global {
  interface Window {
    google: any
  }
}

interface GoogleMapRouteProps {
  origin: string
  destination: string
  waypoints?: string[]
  onRouteCalculated?: (distance: number, duration: number) => void
}

const GoogleMapRoute = ({ origin, destination, waypoints = [], onRouteCalculated }: GoogleMapRouteProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const scriptLoadedRef = useRef(false)

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      return new Promise<void>((resolve, reject) => {
        // Check if API key exists
        if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API) {
          reject(new Error("Google Maps API key is not configured"))
          return
        }

        // Check if script already exists
        if (window.google && window.google.maps) {
          resolve()
          return
        }

        // Check if script is already being loaded
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
        if (existingScript) {
          existingScript.addEventListener("load", () => resolve())
          existingScript.addEventListener("error", () => reject(new Error("Failed to load Google Maps")))
          return
        }

        // Create and load script
        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API}&libraries=places`
        script.async = true
        script.defer = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error("Failed to load Google Maps"))
        document.head.appendChild(script)
      })
    }

    if (!scriptLoadedRef.current) {
      scriptLoadedRef.current = true
      loadGoogleMapsScript()
        .then(() => {
          setIsLoading(false)
        })
        .catch((err) => {
          console.error("Error loading Google Maps:", err)
          setError(err.message || "Failed to load Google Maps")
          setIsLoading(false)
        })
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || isLoading || !window.google) return

    try {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: 7,
        center: { lat: 45.9432, lng: 24.9668 }, // Center of Romania
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      })

      const renderer = new window.google.maps.DirectionsRenderer({
        map: mapInstance,
        suppressMarkers: false,
      })

      setMap(mapInstance)
      setDirectionsRenderer(renderer)
    } catch (err) {
      console.error("Error initializing map:", err)
      setError("Failed to initialize map")
    }
  }, [isLoading])

  // Calculate route
  useEffect(() => {
    if (!map || !directionsRenderer || !origin || !destination || !window.google) return

    const directionsService = new window.google.maps.DirectionsService()

    // Prepare waypoints
    const waypointObjects = waypoints.map((wp) => ({
      location: wp,
      stopover: true,
    }))

    // Request directions
    const request = {
      origin,
      destination,
      waypoints: waypointObjects,
      travelMode: window.google.maps.TravelMode.DRIVING,
      optimizeWaypoints: true,
    }

    directionsService.route(request, (result: any, status: any) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(result)

        // Calculate total distance and duration
        let totalDistance = 0
        let totalDuration = 0

        const route = result.routes[0]
        if (route && route.legs) {
          for (const leg of route.legs) {
            totalDistance += leg.distance.value // in meters
            totalDuration += leg.duration.value // in seconds
          }
        }

        // Convert to km and minutes
        const distanceKm = totalDistance / 1000
        const durationMin = totalDuration / 60

        if (onRouteCalculated) {
          onRouteCalculated(distanceKm, durationMin)
        }
      } else {
        console.error("Directions request failed:", status)
        setError(`Failed to calculate route: ${status}`)
      }
    })
  }, [map, directionsRenderer, origin, destination, waypoints, onRouteCalculated])

  if (error) {
    return (
      <Card className="p-4">
        <div className="text-red-500 text-sm space-y-2">
          <div className="font-medium">Google Maps Error</div>
          <div>{error}</div>
          {error.includes("API key") && (
            <div className="text-xs text-gray-600 mt-2">
              Please check that NEXT_PUBLIC_GOOGLE_MAPS_API is set in your environment variables.
            </div>
          )}
          {error.includes("ApiProjectMapError") && (
            <div className="text-xs text-gray-600 mt-2">
              This error typically occurs when:
              <ul className="list-disc ml-4 mt-1">
                <li>The API key is invalid or restricted</li>
                <li>The current domain is not authorized in Google Cloud Console</li>
                <li>The Maps JavaScript API is not enabled for your project</li>
              </ul>
            </div>
          )}
        </div>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center h-96">
          <div className="text-sm text-gray-500">Loading map...</div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <div ref={mapRef} className="w-full h-96" />
    </Card>
  )
}

export default GoogleMapRoute
