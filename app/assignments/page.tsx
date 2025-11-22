"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
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
  Plus,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { format, parseISO, differenceInHours, formatDistanceToNow } from "date-fns"
import { TeamMemberAvatars } from "@/components/team-member-avatars"
import { GPSTimestamps } from "@/components/gps-timestamps"
import { RoutePointsDisplay } from "@/components/route-points-display"
import { finalizeAssignmentWithTeam, manuallyCalculateRoute } from "@/app/actions/assignments"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteAssignment } from "@/app/actions/delete-assignment"

// License Plate Component
function LicensePlate({ plate, color = "gr" }: { plate: string; color?: string }) {
  const bgColor = color === "gr" ? "bg-slate-700 dark:bg-slate-700/80" : "bg-blue-900/50 dark:bg-blue-900/50"
  const textColor = color === "gr" ? "text-slate-200 dark:text-slate-200" : "text-blue-300 dark:text-blue-300"

  return <div className={`${bgColor} ${textColor} text-xs font-mono font-medium px-2 py-0.5 rounded`}>{plate}</div>
}

// Move TypeFilters component outside of AssignmentsPage
function TypeFilters({
  activeFilter,
  setActiveFilter,
}: {
  activeFilter: string
  setActiveFilter: (filter: string) => void
}) {
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
      <Filter className="h-3 w-3 text-slate-400 dark:text-slate-500 mr-1 self-center" />
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant="outline"
          size="sm"
          onClick={() => setActiveFilter(filter.value)}
          className={`h-6 px-2 text-xs rounded-full ${
            activeFilter === filter.value
              ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-600 dark:text-white dark:border-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700"
              : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
          }`}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  )
}

// Format time for display
const formatTime = (dateString: string) => {
  if (!dateString) return "-"
  try {
    return format(parseISO(dateString), "MMM d, HH:mm")
  } catch (e) {
    return dateString
  }
}

// Calculate duration from start date to now
const calculateDuration = (dateString: string) => {
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

// Get status badge color
const getStatusColor = (status: string) => {
  switch (status) {
    case "Finalizat":
      return "bg-green-900/40 text-green-400 border-green-800/50 dark:bg-green-900/40 dark:text-green-400 dark:border-green-800/50"
    case "In Deplasare":
      return "bg-blue-600 text-blue-50 border-blue-700 dark:bg-blue-600 dark:text-blue-50 dark:border-blue-700"
    case "Anulat":
      return "bg-red-900/40 text-red-400 border-red-800/50 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800/50"
    default:
      return "bg-slate-800/50 text-slate-300 border-slate-700/50 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700/50"
  }
}

// Get type badge color
const getTypeColor = (type: string) => {
  switch (type) {
    case "Interventie":
      return "bg-blue-600 text-blue-50 border-blue-700 dark:bg-blue-600 dark:text-blue-50 dark:border-blue-700"
    case "Optimizare":
      return "bg-orange-900/40 text-orange-400 border-orange-800/50 dark:bg-orange-900/40 dark:text-orange-400 dark:border-orange-800/50"
    case "Deschidere":
      return "bg-green-800/50 text-green-300 border-green-700/50 dark:bg-green-800/50 dark:text-green-300 dark:border-green-700/50"
    case "Froo":
      return "bg-purple-900/40 text-purple-400 border-purple-800/50 dark:bg-purple-900/40 dark:text-purple-400 dark:border-purple-800/50"
    case "BurgerKing":
      return "bg-red-900/40 text-red-400 border-red-800/50 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800/50"
    default:
      return "bg-purple-900/40 text-purple-400 border-purple-800/50 dark:bg-purple-900/40 dark:text-purple-400 dark:border-purple-800/50"
  }
}

export default function AssignmentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [assignments, setAssignments] = useState<any[]>([])
  const [filteredAssignments, setFilteredAssignments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("active")
  const [activeFilter, setActiveFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)

  // Finalization dialog state
  const [isConfirmFinalizeOpen, setIsConfirmFinalizeOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null)

  // Recalculation state
  const [isRecalculating, setIsRecalculating] = useState(false)
  const [recalculationResult, setRecalculationResult] = useState<any>(null)

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

  // Apply all filters
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
    filtered.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())

    setFilteredAssignments(filtered)
  }, [assignments, activeTab, searchTerm, activeFilter])

  const handleFinalize = async (assignment: any) => {
    console.log("[DEBUG] handleFinalize called with assignment:", assignment)

    // Check if this is a type that can skip km validation
    const skipKmValidation = assignment.type === "Froo" || assignment.type === "BurgerKing"
    const kmValue = typeof assignment.km === "string" ? Number.parseFloat(assignment.km) : assignment.km || 0

    console.log("[DEBUG] Skip KM validation:", skipKmValidation, "KM value:", kmValue)

    if (!skipKmValidation && kmValue === 0) {
      // Redirect to calculate route
      router.push(`/test/assignment-route?id=${assignment.id}&autoFinalize=true`)
      return
    }

    // For Froo/BurgerKing OR if KM was calculated normally, confirm finalization
    setSelectedAssignment(assignment)
    setIsConfirmFinalizeOpen(true)
  }

  const confirmFinalize = async () => {
    if (!selectedAssignment) {
      console.log("[DEBUG] No selected assignment")
      return
    }

    console.log("[DEBUG] Starting finalization for assignment:", selectedAssignment.id)
    setIsSubmitting(true)

    try {
      const result = await finalizeAssignmentWithTeam(selectedAssignment)
      console.log("[DEBUG] Finalization result:", result)

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
      console.error("[DEBUG] Error finalizing assignment:", error)
      toast({
        title: "Error",
        description: `Failed to finalize assignment: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRouteUpdate = async (storeIds: number[], assignmentId: number) => {
    if (!assignmentId) return

    try {
      const result = await manuallyCalculateRoute(assignmentId, storeIds)

      if (result.success) {
        toast({
          title: "Success",
          description: "Route updated successfully",
        })
      } else {
        toast({
          title: "Route points updated",
          description: "KM reset to 0. Click on the orange KM indicator to calculate the route.",
        })
      }

      fetchAssignments()
    } catch (error) {
      console.error("Error updating route:", error)
      toast({
        title: "Error",
        description: `Failed to update route: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    }
  }

  const handleRecalculateDistance = async (assignmentId: number) => {
    setSelectedAssignmentId(assignmentId)
    setIsRecalculating(true)
    setRecalculationResult(null)

    try {
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

      fetchAssignments()
    } catch (error) {
      console.error("Error recalculating distance:", error)
      toast({
        title: "Error",
        description: `Failed to recalculate distance: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsRecalculating(false)
    }
  }

  const handleDeleteAssignment = async (password: string) => {
    if (!selectedAssignmentId) return

    setIsSubmitting(true)
    try {
      const result = await deleteAssignment(selectedAssignmentId, password)

      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Assignment deleted successfully",
        })
        setIsDeleteDialogOpen(false)
        fetchAssignments()
      } else {
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
    <AppShell searchTerm={searchTerm} onSearch={setSearchTerm}>
      <div className="container mx-auto py-6 max-w-5xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="grid grid-cols-2 w-[200px]">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <button
              onClick={() => router.push("/deplasareform")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors font-medium text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>New</span>
            </button>
          </div>

          <TypeFilters activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

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
                  const members =
                    typeof assignment.members === "string" ? JSON.parse(assignment.members) : assignment.members || []
                  const storePoints = assignment.store_points || []

                  return (
                    <Card
                      key={assignment.id}
                      className="overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700/50 rounded-lg w-full bg-white dark:bg-slate-900/50"
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <CardTitle className="text-sm text-foreground">
                                {assignment.city} - {assignment.store_number}
                              </CardTitle>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
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

                          <div className="border-t border-slate-200 dark:border-slate-700/50 my-2" />

                          <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1 items-start">
                              <div className="flex items-center gap-1">
                                <Car className="h-4 w-4 text-gray-400" />
                                <LicensePlate plate={assignment.car_plate || "NA"} color="gr" />
                              </div>
                              {assignment.team_lead && (
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
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
                              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                              <TeamMemberAvatars members={members} showNames={true} />
                            </div>
                          )}

                          <div className="border-t border-slate-200 dark:border-slate-700/50 my-3" />

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                <PlayCircle className="h-4 w-4 mr-1 text-slate-400" />
                                <span className="text-xs text-slate-300">{formatTime(assignment.start_date)}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-slate-400" />
                                <span className="text-xs text-slate-300">
                                  {calculateDuration(assignment.start_date)}
                                </span>
                              </div>
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
                              onRouteChange={(storeIds) => handleRouteUpdate(storeIds, assignment.id)}
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
            {/* Similar structure for completed assignments */}
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="h-8 w-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-md">
                <Clock className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-500">No completed assignments found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAssignments.map((assignment) => {
                  const members =
                    typeof assignment.members === "string" ? JSON.parse(assignment.members) : assignment.members || []

                  return (
                    <Card
                      key={assignment.id}
                      className="overflow-hidden border border-slate-200 dark:border-slate-700/50 rounded-lg w-full bg-white dark:bg-slate-900/50"
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm text-foreground">
                              {assignment.city} - {assignment.store_number}
                            </CardTitle>
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

                          <div className="border-t border-slate-200 dark:border-slate-700/50 my-2" />

                          <div className="flex items-center gap-2 text-xs text-foreground">
                            <PlayCircle className="h-4 w-4 text-slate-400 dark:text-slate-400" />
                            <span>{formatTime(assignment.start_date)}</span>
                            <StopCircle className="h-4 w-4 text-slate-400 dark:text-slate-400" />
                            <span>{formatTime(assignment.completion_date)}</span>
                            <Clock className="h-4 w-4 text-slate-400 dark:text-slate-400" />
                            <span>{assignment.hours}h</span>
                          </div>

                          {assignment.km && (
                            <div className="text-xs text-muted-foreground">
                              Distance: {Number.parseFloat(assignment.km).toFixed(1)} km
                            </div>
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
      </div>
    </AppShell>
  )
}
