"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

declare global {
  interface Window {
    google: any
  }
}

interface RouteSegment {
  startStoreId: number | string
  endStoreId: number | string
  startName?: string
  endName?: string
  startAddress?: string
  endAddress?: string
  distance: number
  duration: number
  isHQ?: boolean
  startLatitude?: number
  startLongitude?: number
  endLatitude?: number
  endLongitude?: number
  polyline?: string
  isVehicle?: boolean
  heading?: number
  speed?: number
  status?: string
  ignitionState?: string
  lastUpdate?: string
  temperature?: string
  driverName?: string
}

interface GoogleMapRouteProps {
  segments: RouteSegment[]
  polyline?: string
  height?: string
  isVehicleMap?: boolean
}

// Colors for different segments
const SEGMENT_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#84cc16", // lime
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#d946ef", // fuchsia
]

export default function GoogleMapRoute({
  segments,
  polyline,
  height = "400px",
  isVehicleMap = false,
}: GoogleMapRouteProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [routesLoading, setRoutesLoading] = useState(false)
  const scriptLoadedRef = useRef(false)
  const markersRef = useRef<any[]>([])
  const directionsRenderersRef = useRef<any[]>([])

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API) {
          reject(new Error("Google Maps API key is not configured"))
          return
        }

        if (window.google && window.google.maps) {
          resolve()
          return
        }

        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
        if (existingScript) {
          existingScript.addEventListener("load", () => resolve())
          existingScript.addEventListener("error", () => reject(new Error("Failed to load Google Maps")))
          return
        }

        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API}&libraries=geometry`
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
    if (!mapRef.current || isLoading || !window.google || !segments || segments.length === 0) return

    try {
      const bounds = new window.google.maps.LatLngBounds()

      segments.forEach((segment) => {
        if (segment.startLatitude && segment.startLongitude) {
          bounds.extend(new window.google.maps.LatLng(segment.startLatitude, segment.startLongitude))
        }
        if (segment.endLatitude && segment.endLongitude) {
          bounds.extend(new window.google.maps.LatLng(segment.endLatitude, segment.endLongitude))
        }
      })

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: 7,
        center: bounds.getCenter(),
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      })

      mapInstance.fitBounds(bounds)
      setMap(mapInstance)
    } catch (err) {
      console.error("Error initializing map:", err)
      setError("Failed to initialize map")
    }
  }, [isLoading, segments])

  // Draw route segments and markers
  useEffect(() => {
    if (!map || !window.google || !segments || segments.length === 0) return

    // Clear existing markers and directions
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []
    directionsRenderersRef.current.forEach((renderer) => renderer.setMap(null))
    directionsRenderersRef.current = []

    try {
      if (isVehicleMap) {
        // For vehicle map, show each vehicle as a marker
        segments.forEach((segment) => {
          if (segment.startLatitude && segment.startLongitude) {
            const position = new window.google.maps.LatLng(segment.startLatitude, segment.startLongitude)

            const icon = {
              path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: segment.status === "online" ? "#22c55e" : "#ef4444",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              rotation: segment.heading || 0,
            }

            const marker = new window.google.maps.Marker({
              position,
              map,
              icon,
              title: segment.startName,
            })

            const infoContent = `
              <div style="padding: 8px; max-width: 250px;">
                <h3 style="margin: 0 0 8px 0; font-weight: bold;">${segment.startName}</h3>
                ${segment.driverName ? `<p style="margin: 4px 0;"><strong>Driver:</strong> ${segment.driverName}</p>` : ""}
                <p style="margin: 4px 0;"><strong>Speed:</strong> ${segment.speed || 0} km/h</p>
                <p style="margin: 4px 0;"><strong>Status:</strong> ${segment.status || "Unknown"}</p>
                <p style="margin: 4px 0;"><strong>Ignition:</strong> ${segment.ignitionState || "Unknown"}</p>
                ${segment.temperature ? `<p style="margin: 4px 0;"><strong>Temperature:</strong> ${segment.temperature}°C</p>` : ""}
              </div>
            `

            const infoWindow = new window.google.maps.InfoWindow({
              content: infoContent,
            })

            marker.addListener("click", () => {
              infoWindow.open(map, marker)
            })

            markersRef.current.push(marker)
          }
        })
      } else {
        // For route map, draw each segment individually
        const directionsService = new window.google.maps.DirectionsService()
        const bounds = new window.google.maps.LatLngBounds()

        // Build all points array
        const allPoints = []
        segments.forEach((segment, index) => {
          if (segment.startLatitude && segment.startLongitude) {
            allPoints.push({
              lat: segment.startLatitude,
              lng: segment.startLongitude,
              name: segment.startName || `Point ${index + 1}`,
              address: segment.startAddress,
              isHQ: segment.isHQ || segment.startStoreId === "HQ",
            })
          }
        })

        // Add the last endpoint
        const lastSegment = segments[segments.length - 1]
        if (lastSegment && lastSegment.endLatitude && lastSegment.endLongitude) {
          allPoints.push({
            lat: lastSegment.endLatitude,
            lng: lastSegment.endLongitude,
            name: lastSegment.endName || `Point ${allPoints.length + 1}`,
            address: lastSegment.endAddress,
            isHQ: lastSegment.isHQ || lastSegment.endStoreId === "HQ",
          })
        }

        console.log(`Drawing ${segments.length} individual route segments`)

        setRoutesLoading(true)

        // Draw each segment individually
        let completedRequests = 0
        const totalRequests = segments.length

        segments.forEach((segment, index) => {
          if (!segment.startLatitude || !segment.startLongitude || !segment.endLatitude || !segment.endLongitude) {
            completedRequests++
            if (completedRequests === totalRequests) {
              setRoutesLoading(false)
            }
            return
          }

          const origin = new window.google.maps.LatLng(segment.startLatitude, segment.startLongitude)
          const destination = new window.google.maps.LatLng(segment.endLatitude, segment.endLongitude)

          const request = {
            origin,
            destination,
            travelMode: window.google.maps.TravelMode.DRIVING,
          }

          // Use a delay to avoid hitting API rate limits
          setTimeout(
            () => {
              directionsService.route(request, (result: any, status: any) => {
                completedRequests++

                if (status === window.google.maps.DirectionsStatus.OK) {
                  // Get color for this segment
                  const segmentColor = SEGMENT_COLORS[index % SEGMENT_COLORS.length]

                  // Draw this segment with its own color
                  const directionsRenderer = new window.google.maps.DirectionsRenderer({
                    map,
                    directions: result,
                    suppressMarkers: true,
                    preserveViewport: true, // Don't auto-zoom for each segment
                    polylineOptions: {
                      strokeColor: segmentColor,
                      strokeOpacity: 0.7,
                      strokeWeight: 4,
                    },
                  })

                  directionsRenderersRef.current.push(directionsRenderer)

                  console.log(`Segment ${index + 1}: ${segment.startName} → ${segment.endName} (${segmentColor})`)
                } else {
                  console.error(`Segment ${index + 1} directions failed:`, status)

                  // Fallback: draw straight line
                  const polyline = new window.google.maps.Polyline({
                    path: [origin, destination],
                    geodesic: true,
                    strokeColor: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
                    strokeOpacity: 0.5,
                    strokeWeight: 3,
                    map,
                  })

                  markersRef.current.push(polyline)
                }

                // When all requests are complete, add markers
                if (completedRequests === totalRequests) {
                  setRoutesLoading(false)

                  // Add numbered markers for all points
                  setTimeout(() => {
                    allPoints.forEach((point, pointIndex) => {
                      const position = new window.google.maps.LatLng(point.lat, point.lng)
                      bounds.extend(position)

                      // Create a custom marker icon with background
                      const markerIcon = {
                        path: "M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z",
                        fillColor: point.isHQ ? "#3b82f6" : "#ef4444",
                        fillOpacity: 1,
                        strokeColor: "#ffffff",
                        strokeWeight: 2,
                        scale: 1,
                        labelOrigin: new window.google.maps.Point(0, -28),
                      }

                      const marker = new window.google.maps.Marker({
                        position,
                        map,
                        icon: markerIcon,
                        label: {
                          text: `${pointIndex + 1}`,
                          color: "#ffffff",
                          fontWeight: "bold",
                          fontSize: "14px",
                        },
                        title: point.name,
                        zIndex: 10000 + pointIndex,
                      })

                      const infoContent = `
                        <div style="padding: 8px; min-width: 200px;">
                          <h3 style="margin: 0 0 8px 0; font-weight: bold; color: ${point.isHQ ? "#3b82f6" : "#ef4444"}">
                            ${point.isHQ ? "🏢 " : "🏪 "}${point.name}
                          </h3>
                          ${point.address ? `<p style="margin: 4px 0; font-size: 13px;">${point.address}</p>` : ""}
                          <p style="margin: 4px 0; font-size: 12px; color: #666;">Point ${pointIndex + 1} of ${allPoints.length}</p>
                        </div>
                      `

                      const infoWindow = new window.google.maps.InfoWindow({
                        content: infoContent,
                      })

                      marker.addListener("click", () => {
                        infoWindow.open(map, marker)
                      })

                      markersRef.current.push(marker)
                    })

                    // Fit bounds to show all points
                    map.fitBounds(bounds)
                  }, 100)
                }
              })
            },
            index * 200, // Stagger requests by 200ms each
          )
        })
      }
    } catch (err) {
      console.error("Error drawing route:", err)
      setError("Failed to draw route on map")
      setRoutesLoading(false)
    }
  }, [map, segments, isVehicleMap])

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
        </div>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center" style={{ height }}>
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden relative">
      {routesLoading && (
        <div className="absolute top-2 right-2 z-10 bg-white rounded-lg shadow-lg px-3 py-2 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <span className="text-sm text-gray-600">Loading routes...</span>
        </div>
      )}
      <div ref={mapRef} className="w-full" style={{ height }} />
    </Card>
  )
}
