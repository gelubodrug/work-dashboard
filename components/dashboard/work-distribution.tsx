"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { getWorkDistributionByType } from "@/app/actions/work-logs"
import Link from "next/link"
import { motion, MotionConfig, useInView } from "framer-motion"
import { SpringNumberFlow } from "@/components/ui/spring-number-flow"
import useCycle from "@/hooks/use-cycle"
import { Clock, MapPin, Users } from "lucide-react"
import { useSearchParams } from "next/navigation"

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

type WorkType = {
  type: string
  count: number
  total_hours: number
  avg_hours: number
}

// Create motion-enabled Link
const MotionLink = motion(Link)

export function WorkDistribution({ startDate, endDate, distribution }: WorkDistributionProps) {
  const [data, setData] = useState<WorkDistributionData[]>([])
  const [loading, setLoading] = useState(true)
  const [workTypes, setWorkTypes] = useState<WorkType[]>([])
  const searchParams = useSearchParams()
  const type = searchParams.get("type")
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const [animationTrigger, setAnimationTrigger] = useState(0)
  const cycleAnimation = useCycle(setAnimationTrigger, [0, 1])

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

  useEffect(() => {
    async function fetchWorkTypes() {
      const res = await fetch(`/api/work-type-details`)
      const data = await res.json()
      setWorkTypes(data)
    }

    fetchWorkTypes()
  }, [])

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

  const cards = [
    {
      type: "Interventie",
      title: "Interventie",
      borderColor: "border-l-blue-500",
      href: "/dashboard/type?type=Interventie",
    },
    {
      type: "Optimizare",
      title: "Optimizare",
      borderColor: "border-l-orange-500",
      href: "/dashboard/type?type=Optimizare",
    },
    {
      type: "Deschidere",
      title: "Deschidere",
      borderColor: "border-l-green-500",
      href: "/dashboard/type?type=Deschidere",
    },
    {
      type: "Froo",
      title: "Froo",
      borderColor: "border-l-purple-500",
      href: "/dashboard/type?type=Froo",
    },
    {
      type: "BurgerKing",
      title: "BurgerKing",
      borderColor: "border-l-red-500",
      href: "/dashboard/type?type=BurgerKing",
    },
  ]

  const cardWidth = "w-40" // Base width
  const cardHeight = "h-32" // Base height

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
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 p-2 rounded-lg border-0 bg-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.75,
                ease: "easeOut",
              }}
              layout
            >
              {cards.map((card) => (
                <MotionLink
                  key={card.type}
                  href={card.href}
                  className={`rounded-lg border-l-4 ${card.borderColor} border-t-0 border-r-0 border-b-0 bg-transparent p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200`}
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
                      window.location.href = card.href
                    }, 200)
                  }}
                >
                  <h3 className="text-sm font-medium">{card.title}</h3>
                  <p className="text-2xl font-bold">
                    <SpringNumberFlow
                      value={getHoursForType(card.type)}
                      suffix="h"
                      className="inline-block tabular-nums"
                      willChange
                      format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
                    />
                  </p>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>
                      <SpringNumberFlow
                        value={getAssignmentsForType(card.type)}
                        className="inline-block tabular-nums"
                        willChange
                        format={{ maximumFractionDigits: 0 }}
                      />{" "}
                      assig
                    </span>
                    <span>
                      <SpringNumberFlow
                        value={getStoresForType(card.type)}
                        className="inline-block tabular-nums"
                        willChange
                        format={{ maximumFractionDigits: 0 }}
                      />{" "}
                      stores
                    </span>
                  </div>
                </MotionLink>
              ))}
            </motion.div>
          </MotionConfig>
        )}
        <h2 className="text-xl font-bold mb-4">Work Distribution - Assignment types</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {workTypes.map((item) => (
            <div
              key={item.type}
              className={`${cardWidth} ${cardHeight} flex flex-col justify-between p-4 border-l-4 rounded-md shadow-sm transition-shadow hover:shadow-md dark:bg-gray-900 dark:hover:bg-gray-800`}
            >
              <a href={`/dashboard/type?type=${item.type}`} className="hover:underline">
                <h3 className="text-lg font-semibold mb-2">{item.type}</h3>
              </a>
              <div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{item.count} Assignments</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{item.total_hours} Total Hours</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{item.avg_hours.toFixed(1)} Avg. Hours</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
