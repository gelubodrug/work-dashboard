"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SegmentedProgress, type AssignmentSegment } from "./segmented-progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"
import { SpringNumberFlow } from "@/components/ui/spring-number-flow"
import useCycle from "@/hooks/use-cycle"
import { useRef } from "react"
import { useInView } from "motion/react"

interface TopWorkersProps {
  workers: any[]
}

export function TopWorkers({ workers }: TopWorkersProps) {
  const [animationTrigger, cycleAnimation] = useCycle([0, 1, 2, 3])
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  if (!workers || workers.length === 0) {
    return <div className="text-muted-foreground">No data available</div>
  }

  // Find the maximum hours value for scaling
  const maxHours = Math.max(...workers.map((worker) => Number(worker.total_hours) || 0))

  return (
    <div className="space-y-4" ref={ref}>
      {workers.map((worker, index) => {
        // Process assignments to create segments
        const segments: AssignmentSegment[] = []
        if (worker.assignments && Array.isArray(worker.assignments)) {
          worker.assignments.forEach((assignment: any) => {
            if (assignment && typeof assignment.hours === "number" && assignment.hours > 0) {
              segments.push({
                id: assignment.id,
                type: assignment.type || "Unknown",
                value: Number(assignment.hours),
                storeNumber: assignment.store_number,
              })
            }
          })
        }

        const userId = worker.id || `user-${index}`

        // Return exact values - no continuous animation
        const baseHours = Number(worker.total_hours)
        const baseAssignments = worker.assignment_count || 0
        const baseStores = worker.store_count || 0

        // Only animate on user interaction
        const animatedHours = animationTrigger === 0 ? baseHours : baseHours + baseHours * animationTrigger * 0.02
        const animatedAssignments =
          animationTrigger === 0
            ? baseAssignments
            : Math.round(baseAssignments + baseAssignments * animationTrigger * 0.03)
        const animatedStores =
          animationTrigger === 0 ? baseStores : Math.round(baseStores + baseStores * animationTrigger * 0.02)

        return (
          <Link href={`/dashboard/details?userId=${userId}`} key={userId} className="block">
            <div
              className="flex items-center gap-4 p-2 -mx-2 rounded-md hover:bg-accent transition-colors cursor-pointer group"
              onClick={(e) => {
                e.preventDefault()
                cycleAnimation()
                setTimeout(() => {
                  window.location.href = `/dashboard/details?userId=${userId}`
                }, 300)
              }}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={worker.profile_photo || "/placeholder.svg"} alt={worker.name} />
                <AvatarFallback>{worker.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium leading-none group-hover:underline">{worker.name}</p>
                  <p className="text-sm font-medium">
                    <SpringNumberFlow
                      value={animatedHours}
                      suffix="h"
                      className="inline-block tabular-nums"
                      willChange
                      format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
                    />
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    <SpringNumberFlow
                      value={animatedAssignments}
                      className="inline-block tabular-nums"
                      willChange
                      format={{ maximumFractionDigits: 0 }}
                    />{" "}
                    assignments
                  </span>
                  <span>
                    <SpringNumberFlow
                      value={animatedStores}
                      className="inline-block tabular-nums"
                      willChange
                      format={{ maximumFractionDigits: 0 }}
                    />{" "}
                    stores
                  </span>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild onClick={(e) => e.preventDefault()}>
                      <div className="mt-1 relative">
                        <SegmentedProgress
                          segments={segments}
                          total={Number(worker.total_hours)}
                          maxValue={maxHours}
                          unit="h"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs space-y-1">
                        <p className="font-semibold">Assignment breakdown:</p>
                        {segments.map((segment, i) => (
                          <div key={i} className="flex justify-between gap-4">
                            <div className="flex items-center gap-1">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  segment.type === "Interventie"
                                    ? "bg-blue-500"
                                    : segment.type === "Optimizare"
                                      ? "bg-orange-500"
                                      : segment.type === "Deschidere"
                                        ? "bg-green-500"
                                        : "bg-gray-500"
                                }`}
                              ></div>
                              <span>{segment.type}</span>
                            </div>
                            <span>{segment.value}h</span>
                          </div>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
