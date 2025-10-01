"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Plus,
  Search,
  RefreshCw,
  MapPin,
  Clock,
  AlertCircle,
  Filter,
  CheckCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Car,
  Users,
  Route,
  PlayCircle,
  StopCircle,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { format, parseISO, differenceInHours, formatDistanceToNow } from "date-fns"
import { TeamMemberAvatars } from "@/components/team-member-avatars"
import { AssignmentKmCell } from "@/components/assignment-km-cell"
import { GPSTimestamps } from "@/components/gps-timestamps"
import { ConfirmFinalizeDialog } from "@/components/confirm-finalize-dialog"
import { RoutePointsDisplay } from "@/components/route-points-display"
import { finalizeAssignmentWithTeam, manuallyCalculateRoute } from "@/app/actions/assignments"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import { deleteAssignment } from "@/app/actions/delete-assignment"

// License Plate Component
function LicensePlate({ plate, color = "gr" }) {
  const bgColor = color === "gr" ? "bg-gray-100" : "bg-blue-100"
  const textColor = color === "gr" ? "text-gray-800" : "text-blue-800"

  return <div className={`${bgColor} ${textColor} text-xs font-medium px-2 py-0.5 rounded-md`}>{plate}</div>
}

// Move TypeFilters component outside of AssignmentsPage
function TypeFilters({ activeFilter, setActiveFilter }) {
  const filters = [
    { value: "all", label: "All" },
    { value: "Interventie", label: "Interventie" },
    { value: "Optimizare", label: "Optimizare" },
    { value: "Deschidere", label: "Deschidere" },
    { value: "Froo", label: "Froo" },
    { value: "BurgerKing", label: "BurgerKing" },
  ]

  return (
    <div className="flex flex-wrap gap-1 my-2">
      <Filter className="h-3 w-3 text-blue-400 mr-1 self-center" />
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant="outline"
          size="sm"
          onClick={() => setActiveFilter(filter.value)}
          className={`h-6 px-2 text-xs rounded-full ${
            activeFilter === filter.value
              ? "bg-blue-100 text-blue-800 border-blue-200"
              : "bg-gray-50 text-gray-600 border-gray-200"
          }`}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  )
}

// Format time for display
const formatTime = (dateString) => {
  if (!dateString) return "-"
  try {
    return format(parseISO(dateString), "MMM d, HH:mm")
  } catch (e) {
    return dateString
  }
}

// Calculate duration from start date to now
const calculateDuration = (dateString) => {
  if (!dateString) return "-"
  try {
    const startDate = parseISO(dateString)
    const now = new Date()
    const diffInHours = differenceInHours(now, startDate)

    if (diffInHours < 24) {
      return `${diffInHours}h`
    } else {
      const days = Math.floor(diffInHours / 24)
      const hours = diffInHours % 24
      return `${days}d ${hours}h`
    }
  } catch (e) {
    return "-"
  }
}

// Format driving time to hours
const formatDrivingTimeToHours = (drivingTime) => {
  if (!drivingTime) return "0h"

  // If it's already in the format like "2h 30min", return as is
  if (typeof drivingTime === "string" && drivingTime.includes("h")) {
    return drivingTime
  }

  // Convert from minutes to hours (driving_time is stored in minutes)
  const hours = Math.floor(Number(drivingTime) / 60)
  const minutes = Math.floor(Number(drivingTime) % 60)

  if (hours > 0) {
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`
  }
  return `${minutes}m`
}

// Format km with 1 decimal place
const formatKm = (km) => {
  if (!km) return "0"
  return Number(km).toFixed(1)
}

export default function AssignmentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [assignments, setAssignments] = useState([])
  const [filteredAssignments, setFilteredAssignments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("active")
  const [activeFilter, setActiveFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isFinalizingAssignment, setIsFinalizingAssignment] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)

  // Finalization dialog state
  const [isConfirmFinalizeOpen, setIsConfirmFinalizeOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMakingAPICall, setIsMakingAPICall] = useState(false)

  // Add these state variables with the other state variables
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null)
  const [isFinalizeDialogOpen, setIsFinalizeDialogOpen] = useState(false)
  const [isRecalculating, setIsRecalculating] = useState(false)
  const [recalculationResult, setRecalculationResult] = useState(null)

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab === "completed") {
      setActiveTab("completed")
    }
  }, [searchParams])

  useEffect(() => {
    fetchAssignments()
  }, [activeTab])

  const fetchAssignments = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/assignments?tab=${activeTab}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`)
      }

      const data = await response.json()
      setAssignments(data)
    } catch (e) {
      console.error("Error fetching assignments:", e)
      setError("Could not load assignments. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load assignments. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Apply all filters when assignments, active tab, search term, or type filter changes
  useEffect(() => {
    let filtered = [...assignments]

    // Filter by active/completed status
    if (activeTab === "active") {
      filtered = filtered.filter((a) => a.status !== "Finalizat")
    } else {
      filtered = filtered.filter((a) => a.status === "Finalizat")
    }

    // Filter by type if not "all"
    if (activeFilter !== "all") {
      filtered = filtered.filter((a) => a.type === activeFilter)
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter((a) => {
        return (
          a.store_number?.toLowerCase().includes(term) ||
          a.city?.toLowerCase().includes(term) ||
          a.county?.toLowerCase().includes(term) ||
          a.team_lead?.toLowerCase().includes(term) ||
          a.car_plate?.toLowerCase().includes(term)
        )
      })
    }

    // Sort by most recent start_date
    filtered.sort((a, b) => new Date(b.start_date) - new Date(a.start_date))

    setFilteredAssignments(filtered)
  }, [assignments, activeTab, searchTerm, activeFilter])

  const handleFinalize = async (assignment) => {
    // Allow Froo and BurgerKing to be finalized without km calculation
    const skipKmValidation = assignment.type === "Froo" || assignment.type === "BurgerKing"

    // If km is 0 and it's not a type that skips validation, redirect to route calculation page
    if (!skipKmValidation && (assignment.km === 0 || assignment.km === "0")) {
      router.push(`/test/assignment-route?id=${assignment.id}`)
      return
    }

    setSelectedAssignment(assignment)
    setIsConfirmFinalizeOpen(true)
  }

  const confirmFinalize = async () => {
    if (!selectedAssignment) return

    setIsSubmitting(true)
    try {
      const result = await finalizeAssignmentWithTeam(selectedAssignment)

      if (result.success) {
        toast({
          title: "Success",
          description: "Assignment finalized successfully",
        })
        setIsConfirmFinalizeOpen(false)
        fetchAssignments() // Refresh the assignments list
      } else {
        throw new Error(result.error || "Failed to finalize assignment")
      }
    } catch (error) {
      console.error("Error finalizing assignment:", error)
      toast({
        title: "Error",
        description: `Failed to finalize assignment: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRouteUpdate = async (storeIds, assignmentId) => {
    if (!assignmentId) return

    setIsMakingAPICall(true)
    try {
      // Call the server action to update the route points
      const result = await manuallyCalculateRoute(assignmentId, storeIds)

      if (result.success) {
        toast({
          title: "Success",
          description: "Route updated successfully",
        })
      } else {
        // Show toast about needing recalculation
        toast({
          title: "Route points updated",
          description: "KM reset to 0. Click on the orange KM indicator to calculate the route.",
        })
      }

      // Fetch fresh data to update the UI
      const response = await fetch(`/api/assignments?tab=${activeTab}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (response.ok) {
        const data = await response.json()

        // Process the data to ensure assignments with zero km show properly
        const processedData = data.map((assignment) => {
          if (assignment.id === assignmentId) {
            // Force km and driving_time to be treated as not calculated
            return {
              ...assignment,
              km: "0",
              driving_time: "0",
            }
          }
          return assignment
        })

        setAssignments(processedData)
      }
    } catch (error) {
      console.error("Error updating route:", error)
      toast({
        title: "Error",
        description: `Failed to update route: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsMakingAPICall(false)
    }
  }

  const handleRecalculateDistance = async (assignmentId) => {
    setSelectedAssignmentId(assignmentId)
    setIsRecalculating(true)
    setRecalculationResult(null)

    try {
      // Call API to recalculate distance
      const response = await fetch(`/api/assignments/${assignmentId}/recalculate`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to recalculate distance")
      }

      const result = await response.json()
      setRecalculationResult(result)

      toast({
        title: "Success",
        description: "Distance recalculated successfully",
      })

      // Refresh assignments to get updated data
      fetchAssignments()
    } catch (error) {
      console.error("Error recalculating distance:", error)
      toast({
        title: "Error",
        description: `Failed to recalculate distance: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsRecalculating(false)
    }
  }

  const handleRouteChange = (storeIds, assignmentId) => {
    handleRouteUpdate(storeIds, assignmentId)
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    try {
      return format(parseISO(dateString), "MMM d, yyyy")
    } catch (e) {
      return dateString
    }
  }

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "Finalizat":
        return "bg-green-100 text-green-800 border-green-200"
      case "In Deplasare":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Anulat":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Get type badge color
  const getTypeColor = (type) => {
    switch (type) {
      case "Interventie":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Optimizare":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Deschidere":
        return "bg-green-100 text-green-800 border-green-200"
      case "Froo":
        return "bg-green-100 text-green-800 border-green-200"
      case "BurgerKing":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-purple-100 text-purple-800 border-purple-200"
    }
  }

  // Update the handleDeleteAssignment function in the component
  const handleDeleteAssignment = async (password: string) => {
    if (!selectedAssignmentId) return

    setIsSubmitting(true)
    try {
      // Use the server action instead of direct API call
      const result = await deleteAssignment(selectedAssignmentId, password)

      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Assignment deleted successfully",
        })
        setIsDeleteDialogOpen(false)
        fetchAssignments() // Refresh the assignments list
      } else {
        // Show specific error message
        toast({
          title: "Error",
          description: result.error || "Failed to delete assignment",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting assignment:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppShell>
      <div className="container mx-auto py-6 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Deplasari</h1>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => router.push("/deplasareform")}>
            <Plus className="mr-2 h-4 w-4" />
            New Assignment
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="grid grid-cols-2 w-[200px]">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchAssignments}
              disabled={isLoading}
              className="h-8 bg-transparent"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Refresh
            </Button>
          </div>

          {/* Search and filters section */}
          <div className="mb-4 space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by store number, city, county, or team lead..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <TypeFilters activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
          </div>

          <TabsContent value="active" className="mt-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="h-8 w-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-700 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>{error}</p>
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-md">
                <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-500 mb-4">No active assignments found</p>
                <Button variant="outline" onClick={() => router.push("/deplasareform")}>
                  Create New Assignment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAssignments.map((assignment) => {
                  // Parse members array if it's a string
                  const members =
                    typeof assignment.members === "string" ? JSON.parse(assignment.members) : assignment.members || []

                  // Parse store points if available
                  const storePoints = assignment.store_points || []

                  return (
                    <Card
                      key={assignment.id}
                      className="overflow-hidden shadow-sm border border-gray-100 rounded-lg w-full"
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-2">
                          {/* Top Row: Title, Time Ago, Type, Status */}
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <CardTitle className="text-sm">
                                {assignment.city} - {assignment.store_number}
                              </CardTitle>
                              <div className="text-xs text-muted-foreground">
                                id: {assignment.id} from{" "}
                                {formatDistanceToNow(parseISO(assignment.start_date), { addSuffix: true })}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge
                                className={`${getTypeColor(assignment.type)} text-[10px] py-0.5 px-1.5 whitespace-nowrap`}
                              >
                                {assignment.type}
                              </Badge>
                              <Badge
                                className={`${getStatusColor(assignment.status)} text-[10px] py-0.5 px-1.5 whitespace-nowrap`}
                              >
                                {assignment.status}
                              </Badge>
                            </div>
                          </div>

                          {/* Team Members and Car Information */}
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1 items-start">
                              <div className="flex items-center gap-1">
                                <Car className="h-4 w-4 text-gray-400" />
                                <LicensePlate plate={assignment.car_plate || "NA"} color="gr" />
                              </div>
                              {assignment.team_lead && (
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-2 text-gray-400" />
                                  <TeamMemberAvatars members={[assignment.team_lead]} showNames />
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col items-end text-xs gap-1">
                              <GPSTimestamps
                                gpsStartDate={assignment.gps_start_date}
                                gpsCompletionDate={assignment.return_time}
                                returnTime={assignment.return_time}
                              />
                            </div>
                          </div>

                          {members.length > 0 && (
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2 text-gray-400" />
                              <TeamMemberAvatars members={members} showNames={true} />
                            </div>
                          )}

                          {/* Date and Duration */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                <PlayCircle className="h-4 w-4 mr-1 text-gray-400" />
                                <span className="text-xs">{formatTime(assignment.start_date)}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-gray-400" />
                                <span className="text-xs">{calculateDuration(assignment.start_date)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Route Info and Actions */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <AssignmentKmCell
                                assignmentId={assignment.id}
                                km={assignment.km}
                                drivingTime={assignment.driving_time}
                                onRecalculate={handleRecalculateDistance}
                                isRecalculating={isRecalculating && selectedAssignmentId === assignment.id}
                                recalculationResult={
                                  selectedAssignmentId === assignment.id ? recalculationResult : null
                                }
                              />
                            </div>

                            <div className="flex gap-2 items-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleFinalize(assignment)}
                                className="h-7 text-xs px-2"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Finalize
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => router.push(`/deplasareform?id=${assignment.id}`)}
                                    className="cursor-pointer"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => router.push(`/test/assignment-route?id=${assignment.id}`)}
                                    className="cursor-pointer"
                                  >
                                    <Route className="h-4 w-4 mr-2" />
                                    Calculate Route
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedAssignmentId(assignment.id)
                                      setSelectedAssignment(assignment)
                                      setIsDeleteDialogOpen(true)
                                    }}
                                    className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                                    disabled={isSubmitting}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          {storePoints.length > 0 && (
                            <RoutePointsDisplay
                              startCity="Chitila"
                              endCity="Chitila"
                              assignment={assignment}
                              onRouteChange={handleRouteChange}
                            />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="h-8 w-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-700 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>{error}</p>
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-md">
                <Clock className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-500">No completed assignments found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAssignments.map((assignment) => {
                  // Parse members array if it's a string
                  const members =
                    typeof assignment.members === "string" ? JSON.parse(assignment.members) : assignment.members || []

                  // Parse store points if available
                  const storePoints = assignment.store_points || []

                  return (
                    <Card key={assignment.id} className="overflow-hidden border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-2">
                          {/* Top Row: Title, Time Ago, Type, Status */}
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <CardTitle className="text-sm">
                                {assignment.city} - {assignment.store_number}
                              </CardTitle>
                              <div className="text-xs text-muted-foreground">
                                id: {assignment.id} from{" "}
                                {formatDistanceToNow(parseISO(assignment.start_date), { addSuffix: true })}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge
                                className={`${getTypeColor(assignment.type)} text-[10px] py-0.5 px-1.5 whitespace-nowrap`}
                              >
                                {assignment.type}
                              </Badge>
                              <Badge
                                className={`${getStatusColor(assignment.status)} text-[10px] py-0.5 px-1.5 whitespace-nowrap`}
                              >
                                {assignment.status}
                              </Badge>
                            </div>
                          </div>

                          {/* Team Members and Car Information */}
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1 items-start">
                              <div className="flex items-center gap-1">
                                <Car className="h-4 w-4 text-gray-400" />
                                <LicensePlate plate={assignment.car_plate || "NA"} color="gr" />
                              </div>
                              {assignment.team_lead && (
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-2 text-gray-400" />
                                  <TeamMemberAvatars members={[assignment.team_lead]} showNames />
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col items-end text-xs gap-1">
                              <GPSTimestamps
                                gpsStartDate={assignment.gps_start_date}
                                gpsCompletionDate={assignment.return_time}
                                returnTime={assignment.return_time}
                              />
                            </div>
                          </div>

                          {members.length > 0 && (
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2 text-gray-400" />
                              <TeamMemberAvatars members={members} showNames={true} />
                            </div>
                          )}

                          {/* Date and Duration */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                <PlayCircle className="h-4 w-4 mr-1 text-gray-400" />
                                <span className="text-xs">{formatTime(assignment.start_date)}</span>
                              </div>
                              <div className="flex items-center">
                                <StopCircle className="h-4 w-4 mr-1 text-gray-400" />
                                <span className="text-xs">{formatTime(assignment.completion_date)}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-gray-400" />
                                <span className="text-xs">{assignment.hours}h</span>
                              </div>
                            </div>
                          </div>

                          {/* Route Info and Actions */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <AssignmentKmCell
                                assignmentId={assignment.id}
                                km={assignment.km}
                                drivingTime={assignment.driving_time}
                                onRecalculate={handleRecalculateDistance}
                                isRecalculating={isRecalculating && selectedAssignmentId === assignment.id}
                                recalculationResult={
                                  selectedAssignmentId === assignment.id ? recalculationResult : null
                                }
                              />
                            </div>

                            <div className="flex gap-2 items-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => router.push(`/deplasareform?id=${assignment.id}`)}
                                    className="cursor-pointer"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => router.push(`/test/assignment-route?id=${assignment.id}`)}
                                    className="cursor-pointer"
                                  >
                                    <Route className="h-4 w-4 mr-2" />
                                    Calculate Route
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedAssignmentId(assignment.id)
                                      setIsDeleteDialogOpen(true)
                                    }}
                                    className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          {storePoints.length > 0 && (
                            <RoutePointsDisplay
                              startCity="Chitila"
                              endCity="Chitila"
                              assignment={assignment}
                              onRouteChange={handleRouteChange}
                            />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Finalization confirmation dialog */}
        <ConfirmFinalizeDialog
          open={isConfirmFinalizeOpen}
          onOpenChange={setIsConfirmFinalizeOpen}
          onConfirm={confirmFinalize}
          isSubmitting={isSubmitting}
          title="Finalize Assignment"
          description={`Are you sure you want to finalize assignment ${selectedAssignment?.id}?`}
          assignmentId={selectedAssignment?.id || 0}
          km={selectedAssignment?.km || 0}
          realStartDate={selectedAssignment?.gps_start_date}
          realCompletionDate={selectedAssignment?.return_time}
          assignmentType={selectedAssignment?.type}
        />

        {/* Delete confirmation dialog */}
        <ConfirmDeleteDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDeleteAssignment}
          isSubmitting={isSubmitting}
          title="Delete Assignment"
          description="Are you sure you want to delete this assignment? This action cannot be undone and will remove all related data."
          requirePassword={true}
          itemDetails={
            selectedAssignment
              ? `Assignment ID: ${selectedAssignment.id}
     Location: ${selectedAssignment.city}, ${selectedAssignment.county}
     Type: ${selectedAssignment.type}
     Team Lead: ${selectedAssignment.team_lead}`
              : undefined
          }
        />
      </div>
    </AppShell>
  )
}
