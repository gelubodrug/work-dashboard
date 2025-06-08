"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, User, Users, Building2 } from "lucide-react"
import { format } from "date-fns"
import { getAssignmentsByTypeAndDateRange } from "@/app/actions/work-logs"

interface Assignment {
  id: number
  type: string
  location: string
  team_lead: string
  members: string | string[]
  start_date: string
  due_date?: string
  completion_date?: string
  status: string
  hours: number
  store_number?: string
  county?: string
  city?: string
  magazin?: string
  km?: number
  created_at?: string
}

interface TypeAssignmentsListProps {
  type: string
  startDate: Date
  endDate: Date
}

interface GroupedAssignments {
  [storeKey: string]: {
    storeName: string
    storeNumber: string
    assignments: Assignment[]
    totalHours: number
  }
}

export function TypeAssignmentsList({ type, startDate, endDate }: TypeAssignmentsListProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAssignments() {
      setIsLoading(true)
      try {
        const data = await getAssignmentsByTypeAndDateRange(type, startDate, endDate)
        console.log(`Fetched ${data.length} assignments for type ${type}:`, data)
        setAssignments(data)
      } catch (error) {
        console.error("Error fetching assignments:", error)
        setAssignments([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssignments()
  }, [type, startDate, endDate])

  // Group assignments by store and sort by time
  const groupedAssignments: GroupedAssignments = assignments.reduce((groups, assignment) => {
    const storeKey = assignment.store_number || assignment.magazin || `unknown-${assignment.id}`
    const storeName = assignment.magazin || assignment.location || "Magazin necunoscut"
    const storeNumber = assignment.store_number || "N/A"

    if (!groups[storeKey]) {
      groups[storeKey] = {
        storeName,
        storeNumber,
        assignments: [],
        totalHours: 0,
      }
    }

    groups[storeKey].assignments.push(assignment)
    groups[storeKey].totalHours += assignment.hours || 0

    return groups
  }, {} as GroupedAssignments)

  // Sort assignments within each group by start_date
  Object.values(groupedAssignments).forEach((group) => {
    group.assignments.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
  })

  // Sort groups by earliest assignment date
  const sortedGroups = Object.entries(groupedAssignments).sort(([, groupA], [, groupB]) => {
    const earliestA = new Date(groupA.assignments[0]?.start_date || 0).getTime()
    const earliestB = new Date(groupB.assignments[0]?.start_date || 0).getTime()
    return earliestA - earliestB
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Finalizat":
        return "bg-green-100 text-green-800 border-green-200"
      case "In Deplasare":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Programat":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const parseMembers = (members: string | string[]): string[] => {
    if (Array.isArray(members)) return members
    if (typeof members === "string") {
      try {
        const parsed = JSON.parse(members)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return members ? [members] : []
      }
    }
    return []
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm")
    } catch {
      return dateString
    }
  }

  const formatDateShort = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM")
    } catch {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Timeline Assignment-uri {type}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Timeline Assignment-uri {type}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {assignments.length} assignment-uri în {Object.keys(groupedAssignments).length} magazine pentru perioada{" "}
          {format(startDate, "dd MMM")} - {format(endDate, "dd MMM yyyy")}
        </p>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nu există assignment-uri pentru tipul "{type}" în perioada selectată
          </div>
        ) : (
          <div className="space-y-8">
            {sortedGroups.map(([storeKey, group], groupIndex) => (
              <div key={storeKey} className="relative">
                {/* Store Header */}
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Magazin: {group.storeNumber}</h3>
                    <p className="text-sm text-gray-600">
                      {group.storeName} • {group.assignments.length} assignment-uri • {group.totalHours}h total
                    </p>
                  </div>
                </div>

                {/* Store Timeline */}
                <div className="ml-5 border-l-2 border-gray-200 pl-6 space-y-6">
                  {group.assignments.map((assignment, assignmentIndex) => {
                    const members = parseMembers(assignment.members)

                    return (
                      <div key={assignment.id} className="relative">
                        {/* Timeline dot */}
                        <div
                          className={`absolute -left-9 w-6 h-6 rounded-full border-2 bg-white ${
                            assignment.status === "Finalizat"
                              ? "border-green-500"
                              : assignment.status === "In Deplasare"
                                ? "border-blue-500"
                                : "border-yellow-500"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full mx-auto mt-1 ${
                              assignment.status === "Finalizat"
                                ? "bg-green-500"
                                : assignment.status === "In Deplasare"
                                  ? "bg-blue-500"
                                  : "bg-yellow-500"
                            }`}
                          ></div>
                        </div>

                        {/* Assignment details */}
                        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">Assignment #{assignment.id}</h4>
                              <p className="text-sm text-gray-600">{formatDateShort(assignment.start_date)}</p>
                            </div>
                            <Badge className={getStatusColor(assignment.status)}>{assignment.status}</Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            {/* Location */}
                            {(assignment.city || assignment.county) && (
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-700">
                                  {assignment.city && assignment.county
                                    ? `${assignment.city}, ${assignment.county}`
                                    : assignment.city || assignment.county}
                                </span>
                              </div>
                            )}

                            {/* Team Lead */}
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700">
                                Lead: <strong>{assignment.team_lead}</strong>
                              </span>
                            </div>

                            {/* Team Members */}
                            {members.length > 0 && (
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-700">Echipă: {members.join(", ")}</span>
                              </div>
                            )}

                            {/* Hours */}
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700">
                                <strong>{assignment.hours}h</strong> lucrătoare
                              </span>
                            </div>

                            {/* Kilometers */}
                            {assignment.km && assignment.km > 0 && (
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-700">
                                  <strong>{assignment.km} km</strong>
                                </span>
                              </div>
                            )}

                            {/* Start Date */}
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700">Început: {formatDate(assignment.start_date)}</span>
                            </div>
                          </div>

                          {/* Completion/Due dates */}
                          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-4 text-xs">
                            {assignment.completion_date && (
                              <span className="text-green-600">
                                ✓ Finalizat: {formatDate(assignment.completion_date)}
                              </span>
                            )}
                            {assignment.due_date && (
                              <span className="text-orange-600">⏰ Termen: {formatDate(assignment.due_date)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Separator between stores */}
                {groupIndex < sortedGroups.length - 1 && <div className="mt-8 border-b border-gray-300"></div>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
