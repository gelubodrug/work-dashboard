"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface TypeStatsChartProps {
  type: string
  startDate: Date
  endDate: Date
}

// Mock data for the chart
const mockChartData = [
  { name: "Week 1", hours: 65, assignments: 4 },
  { name: "Week 2", hours: 85, assignments: 3 },
  { name: "Week 3", hours: 92, assignments: 5 },
  { name: "Week 4", hours: 116, assignments: 7 },
]

export function TypeStatsChart({ type, startDate, endDate }: TypeStatsChartProps) {
  const [chartData, setChartData] = useState(mockChartData)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Here you would fetch real chart data based on type and date range
    // For now, using mock data
    setIsLoading(true)
    setTimeout(() => {
      setChartData(mockChartData)
      setIsLoading(false)
    }, 500)
  }, [type, startDate, endDate])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Statistics</CardTitle>
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
        <CardTitle>Weekly Statistics for {type}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="hours" fill="#3b82f6" name="Hours" />
            <Bar dataKey="assignments" fill="#10b981" name="Assignments" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
