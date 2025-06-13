"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { getWorkDistributionByType } from "@/app/actions/work-logs"
import NumberFlow, { NumberFlowGroup } from "@/components/ui/number-flow"
import { continuous } from "@/components/ui/continuous"
import Link from "next/link"

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

export function AnimatedWorkDistribution({ startDate, endDate, distribution }: WorkDistributionProps) {
  const [data, setData] = useState<WorkDistributionData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (distribution) {
      setData(distribution)
      setLoading(false)
      return
    }

    const fetchData = async () => {
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
    return item ? Number(item.total_hours) : 0
  }

  const getAssignmentsForType = (type: string): number => {
    const item = data.find((item) => item.type === type)
    return item ? Number(item.assignment_count) : 0
  }

  const getStoresForType = (type: string): number => {
    const item = data.find((item) => item.type === type)
    return item ? Number(item.store_count) : 0
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
  ]

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardContent className="p-4">
        {loading ? (
          <div className="flex h-24 items-center justify-center">
            <div className="text-xs text-muted-foreground">Loading...</div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-24 items-center justify-center">
            <div className="text-xs text-muted-foreground">No data available</div>
          </div>
        ) : (
          <NumberFlowGroup>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2 rounded-lg border-0 bg-transparent">
              {cards.map((card) => (
                <Link
                  key={card.type}
                  href={card.href}
                  className={`rounded-lg border-l-4 border-t-0 border-r-0 border-b-0 bg-transparent p-4 hover:bg-gray-50 transition-colors ${card.borderColor}`}
                >
                  <h3 className="text-sm font-medium">{card.title}</h3>
                  <p className="text-2xl font-bold">
                    <NumberFlow
                      plugins={[continuous]}
                      value={getHoursForType(card.type)}
                      suffix="h"
                      className="inline"
                    />
                  </p>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>
                      <NumberFlow plugins={[continuous]} value={getAssignmentsForType(card.type)} className="inline" />{" "}
                      assig
                    </span>
                    <span>
                      <NumberFlow plugins={[continuous]} value={getStoresForType(card.type)} className="inline" />{" "}
                      stores
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </NumberFlowGroup>
        )}
      </CardContent>
    </Card>
  )
}
