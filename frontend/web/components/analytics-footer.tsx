"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Clock, Users, AlertTriangle } from "lucide-react"

export function AnalyticsFooter() {
  const metrics = [
    {
      label: "Live Incidents",
      value: "23",
      change: "+5",
      icon: AlertTriangle,
      color: "text-red-500",
    },
    {
      label: "Avg Commute Time",
      value: "28 min",
      change: "-3 min",
      icon: Clock,
      color: "text-blue-500",
    },
    {
      label: "Active Citizens",
      value: "1,247",
      change: "+89",
      icon: Users,
      color: "text-green-500",
    },
    {
      label: "Satisfaction Score",
      value: "8.4/10",
      change: "+0.2",
      icon: TrendingUp,
      color: "text-purple-500",
    },
  ]

  return (
    <Card className="mx-6 mb-6 p-4">
      <div className="grid grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-muted ${metric.color}`}>
              <metric.icon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg">{metric.value}</span>
                <Badge variant="outline" className="text-xs">
                  {metric.change}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
