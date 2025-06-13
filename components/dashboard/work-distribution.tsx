"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { getWorkDistributionByType } from "@/app/actions/work-logs"
import Link from "next/link"
import { motion, MotionConfig, useInView } from "motion/react"
import { SpringNumberFlow } from "@/components/ui/spring-number-flow"
import useCycle from "@/hooks/use-cycle"

type WorkDistributionData = {
  type: string
  total_hours: number
  assignment_count: number
  store_count: number
  unique_store_ids: string[]
}

type WorkDistributionProps = {
  startDate?: Date
  endDate?: Date
  distribution?: WorkDistributionData[]
}

// Create motion-enabled Link
const MotionLink = motion.create(Link)

export function WorkDistribution({ startDate, endDate, distribution }: WorkDistributionProps) {
  const [data, setData] = useState<WorkDistributionData[]>([])
  const [loading, setLoading] = useState(true)

  // useCycle for dynamic animations - but only when user interacts
  const [animationTrigger, cycleAnimation] = useCycle([0, 1, 2, 3, 4])
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (distribution) {
      setData(distribution)
      setLoading(false)
      return
    }

    const fetchData = async () => {
      if (!startDate || !endDate) return

      setLoading(true)
      try {
        const distributionData = await getWorkDistributionByType(startDate, endDate)
        setData(distributionData)
      } catch (error) {
        console.error("Error fetching work distribution:", error)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [startDate, endDate, distribution])

  const getHoursForType = (type: string): number => {
    const item = data.find((item) => item.type === type)
    const baseValue = item ? Number(item.total_hours) : 0

    // Only add variation when animationTrigger changes (user interaction)
    // Otherwise return the exact base value
    if (animationTrigger === 0) {
      return baseValue
    }

    const variation = animationTrigger * 0.1
    return baseValue + baseValue * variation
  }

  const getAssignmentsForType = (type: string): number => {
    const item = data.find((item) => item.type === type)
    const baseValue = item ? Number(item.assignment_count) : 0

    if (animationTrigger === 0) {
      return baseValue
    }

    const variation = animationTrigger * 0.05
    return Math.round(baseValue + baseValue * variation)
  }

  const getStoresForType = (type: string): number => {
    const item = data.find((item) => item.type === type)
    const baseValue = item ? Number(item.store_count) : 0

    if (animationTrigger === 0) {
      return baseValue
    }

    const variation = animationTrigger * 0.08
    return Math.round(baseValue + baseValue * variation)
  }

  return (
    <Card className="col-span-1 md:col-span-2" ref={ref}>
      <CardContent className="p-4">
        {loading ? (
          <motion.div
            className="flex h-24 items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            <div className="text-xs text-muted-foreground">Loading...</div>
          </motion.div>
        ) : data.length === 0 ? (
          <motion.div
            className="flex h-24 items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            <div className="text-xs text-muted-foreground">No data available</div>
          </motion.div>
        ) : (
          <MotionConfig
            transition={{
              layout: {
                duration: 0.75,
                ease: "easeOut",
              },
            }}
          >
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2 rounded-lg border-0 bg-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.75,
                ease: "easeOut",
              }}
              layout
            >
              {/* Interventie */}
              <MotionLink
                href="/dashboard/type?type=Interventie"
                className="rounded-lg border-l-4 border-l-blue-500 border-t-0 border-r-0 border-b-0 bg-transparent p-4 hover:bg-gray-50 transition-colors duration-200"
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2, ease: "easeOut" },
                }}
                whileTap={{
                  scale: 0.98,
                  transition: { duration: 0.1, ease: "easeOut" },
                }}
                layout
                onClick={(e) => {
                  e.preventDefault()
                  cycleAnimation()
                  // Navigate after animation
                  setTimeout(() => {
                    window.location.href = "/dashboard/type?type=Interventie"
                  }, 200)
                }}
              >
                <h3 className="text-sm font-medium">Interventie</h3>
                <p className="text-2xl font-bold">
                  <SpringNumberFlow
                    value={getHoursForType("Interventie")}
                    suffix="h"
                    className="inline-block tabular-nums"
                    willChange
                    format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
                  />
                </p>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>
                    <SpringNumberFlow
                      value={getAssignmentsForType("Interventie")}
                      className="inline-block tabular-nums"
                      willChange
                      format={{ maximumFractionDigits: 0 }}
                    />{" "}
                    assig
                  </span>
                  <span>
                    <SpringNumberFlow
                      value={getStoresForType("Interventie")}
                      className="inline-block tabular-nums"
                      willChange
                      format={{ maximumFractionDigits: 0 }}
                    />{" "}
                    stores
                  </span>
                </div>
              </MotionLink>

              {/* Optimizare */}
              <MotionLink
                href="/dashboard/type?type=Optimizare"
                className="rounded-lg border-l-4 border-l-orange-500 border-t-0 border-r-0 border-b-0 bg-transparent p-4 hover:bg-gray-50 transition-colors duration-200"
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2, ease: "easeOut" },
                }}
                whileTap={{
                  scale: 0.98,
                  transition: { duration: 0.1, ease: "easeOut" },
                }}
                layout
                onClick={(e) => {
                  e.preventDefault()
                  cycleAnimation()
                  setTimeout(() => {
                    window.location.href = "/dashboard/type?type=Optimizare"
                  }, 200)
                }}
              >
                <h3 className="text-sm font-medium">Optimizare</h3>
                <p className="text-2xl font-bold">
                  <SpringNumberFlow
                    value={getHoursForType("Optimizare")}
                    suffix="h"
                    className="inline-block tabular-nums"
                    willChange
                    format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
                  />
                </p>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>
                    <SpringNumberFlow
                      value={getAssignmentsForType("Optimizare")}
                      className="inline-block tabular-nums"
                      willChange
                      format={{ maximumFractionDigits: 0 }}
                    />{" "}
                    assig
                  </span>
                  <span>
                    <SpringNumberFlow
                      value={getStoresForType("Optimizare")}
                      className="inline-block tabular-nums"
                      willChange
                      format={{ maximumFractionDigits: 0 }}
                    />{" "}
                    stores
                  </span>
                </div>
              </MotionLink>

              {/* Deschidere */}
              <MotionLink
                href="/dashboard/type?type=Deschidere"
                className="rounded-lg border-l-4 border-l-green-500 border-t-0 border-r-0 border-b-0 bg-transparent p-4 hover:bg-gray-50 transition-colors duration-200"
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2, ease: "easeOut" },
                }}
                whileTap={{
                  scale: 0.98,
                  transition: { duration: 0.1, ease: "easeOut" },
                }}
                layout
                onClick={(e) => {
                  e.preventDefault()
                  cycleAnimation()
                  setTimeout(() => {
                    window.location.href = "/dashboard/type?type=Deschidere"
                  }, 200)
                }}
              >
                <h3 className="text-sm font-medium">Deschidere</h3>
                <p className="text-2xl font-bold">
                  <SpringNumberFlow
                    value={getHoursForType("Deschidere")}
                    suffix="h"
                    className="inline-block tabular-nums"
                    willChange
                    format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
                  />
                </p>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>
                    <SpringNumberFlow
                      value={getAssignmentsForType("Deschidere")}
                      className="inline-block tabular-nums"
                      willChange
                      format={{ maximumFractionDigits: 0 }}
                    />{" "}
                    assig
                  </span>
                  <span>
                    <SpringNumberFlow
                      value={getStoresForType("Deschidere")}
                      className="inline-block tabular-nums"
                      willChange
                      format={{ maximumFractionDigits: 0 }}
                    />{" "}
                    stores
                  </span>
                </div>
              </MotionLink>
            </motion.div>
          </MotionConfig>
        )}
      </CardContent>
    </Card>
  )
}
