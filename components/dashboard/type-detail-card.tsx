"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Clock, FileText, Store } from "lucide-react"

interface TypeDetailCardProps {
  title: string
  value: string
  icon: "clock" | "file-text" | "store"
  color: "blue" | "orange" | "green" | "gray"
}

export function TypeDetailCard({ title, value, icon, color }: TypeDetailCardProps) {
  const getIcon = () => {
    switch (icon) {
      case "clock":
        return <Clock className="w-5 h-5" />
      case "file-text":
        return <FileText className="w-5 h-5" />
      case "store":
        return <Store className="w-5 h-5" />
      default:
        return <Clock className="w-5 h-5" />
    }
  }

  const getColorClasses = () => {
    switch (color) {
      case "blue":
        return "text-blue-600 bg-blue-50"
      case "orange":
        return "text-orange-600 bg-orange-50"
      case "green":
        return "text-green-600 bg-green-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getColorClasses()}`}>{getIcon()}</div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
