"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, MapPin, Calendar, TrendingUp, Clock } from "lucide-react"

interface InsightsPanelProps {
  query: string
}

const mockInsights = [
  {
    id: 1,
    type: "traffic",
    title: "Heavy congestion expected near MG Road",
    description: "Due to festival at 6 PM. Consider alternate routes.",
    time: "2 min ago",
    severity: "high",
    icon: MapPin,
  },
  {
    id: 2,
    type: "civic",
    title: "Recurring civic complaints in Whitefield",
    description: "Potholes flagged by 15+ citizens. Maintenance scheduled.",
    time: "5 min ago",
    severity: "medium",
    icon: AlertTriangle,
  },
  {
    id: 3,
    type: "event",
    title: "Concert at Cubbon Park tonight",
    description: "Expected 5000+ attendees. Traffic impact from 7-11 PM.",
    time: "10 min ago",
    severity: "medium",
    icon: Calendar,
  },
  {
    id: 4,
    type: "traffic",
    title: "Accident detected on Outer Ring Road",
    description: "Lane blocked. Rerouting advised via Sarjapur Road.",
    time: "15 min ago",
    severity: "high",
    icon: AlertTriangle,
  },
]

export function InsightsPanel({ query }: InsightsPanelProps) {
  const [filter, setFilter] = useState("all")

  const filteredInsights = filter === "all" ? mockInsights : mockInsights.filter((insight) => insight.type === filter)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Your City Insights
        </CardTitle>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter insights" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Insights</SelectItem>
            <SelectItem value="traffic">Traffic</SelectItem>
            <SelectItem value="civic">Civic Issues</SelectItem>
            <SelectItem value="event">Events</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full px-6">
          <div className="space-y-4">
            {filteredInsights.map((insight) => (
              <Card key={insight.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <insight.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={getSeverityColor(insight.severity)} className="text-xs">
                        {insight.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {insight.time}
                      </span>
                    </div>
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <p className="text-xs text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </div>
  )
}
