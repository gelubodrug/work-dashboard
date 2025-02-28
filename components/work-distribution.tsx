"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { Cell, Pie, PieChart } from "recharts"

export function WorkDistribution({ className }: { className?: string }) {
  const data = [
    { name: "Deschidere", value: 1 },
    { name: "Interventie", value: 1 },
    { name: "Optimizare", value: 1 },
  ]

  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Work Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            deschidere: {
              label: "Deschidere",
              color: "hsl(var(--chart-1))",
            },
            interventie: {
              label: "Interventie",
              color: "hsl(var(--chart-2))",
            },
            optimizare: {
              label: "Optimizare",
              color: "hsl(var(--chart-3))",
            },
          }}
          className="h-[300px]"
        >
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

