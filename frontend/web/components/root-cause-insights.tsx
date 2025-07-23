"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TrendingUp, AlertTriangle, Lightbulb, FileText, Target } from "lucide-react"

const rootCauseAnalysis = [
  {
    id: "RC-001",
    issue: "Recurring Traffic Jams - MG Road",
    frequency: "Daily 8-10 AM, 6-8 PM",
    rootCause: "Insufficient lane capacity during peak hours",
    impact: "High",
    affectedArea: "MG Road Corridor",
    solution: "Add dedicated bus lane and optimize signal timing",
    cost: "₹2.5 Cr",
    timeline: "6 months",
    incidents: 156,
    trend: "increasing",
  },
  {
    id: "RC-002",
    issue: "Waterlogging - Koramangala",
    frequency: "Every monsoon season",
    rootCause: "Inadequate drainage system and blocked storm drains",
    impact: "High",
    affectedArea: "Koramangala 4th & 5th Block",
    solution: "Upgrade drainage infrastructure and regular maintenance",
    cost: "₹1.8 Cr",
    timeline: "4 months",
    incidents: 89,
    trend: "stable",
  },
  {
    id: "RC-003",
    issue: "Street Light Outages - HSR Layout",
    frequency: "Weekly incidents",
    rootCause: "Aging electrical infrastructure and poor maintenance",
    impact: "Medium",
    affectedArea: "HSR Layout Sectors 1-3",
    solution: "LED upgrade and smart monitoring system",
    cost: "₹75 Lakh",
    timeline: "3 months",
    incidents: 45,
    trend: "decreasing",
  },
]

const preventiveMeasures = [
  {
    title: "Smart Traffic Management",
    description: "AI-powered signal optimization based on real-time traffic data",
    status: "In Progress",
    completion: 65,
  },
  {
    title: "Predictive Maintenance",
    description: "IoT sensors for early detection of infrastructure issues",
    status: "Planning",
    completion: 20,
  },
  {
    title: "Citizen Engagement Platform",
    description: "Enhanced reporting and feedback system for proactive issue identification",
    status: "Deployed",
    completion: 100,
  },
]

export function RootCauseInsights() {
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "increasing":
        return "text-red-600 bg-red-50 dark:bg-red-950/20"
      case "decreasing":
        return "text-green-600 bg-green-50 dark:bg-green-950/20"
      default:
        return "text-blue-600 bg-blue-50 dark:bg-blue-950/20"
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "High":
        return "text-red-600 bg-red-50 dark:bg-red-950/20"
      case "Medium":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20"
      default:
        return "text-green-600 bg-green-50 dark:bg-green-950/20"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">23</div>
                <div className="text-sm text-muted-foreground">Root Causes ID'd</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/20 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">15</div>
                <div className="text-sm text-muted-foreground">Solutions Proposed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-950/20 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">8</div>
                <div className="text-sm text-muted-foreground">Implemented</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-950/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">67%</div>
                <div className="text-sm text-muted-foreground">Prevention Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Root Cause Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Root Cause Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              <div className="space-y-4 p-4">
                {rootCauseAnalysis.map((analysis) => (
                  <Card key={analysis.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {analysis.id}
                          </Badge>
                          <div className="flex items-center space-x-2">
                            <Badge className={`text-xs ${getImpactColor(analysis.impact)}`}>
                              {analysis.impact} Impact
                            </Badge>
                            <Badge className={`text-xs ${getTrendColor(analysis.trend)}`}>{analysis.trend}</Badge>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm mb-1">{analysis.issue}</h4>
                          <p className="text-xs text-muted-foreground mb-2">{analysis.rootCause}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Frequency:</span>
                            <div className="font-medium">{analysis.frequency}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Incidents:</span>
                            <div className="font-medium">{analysis.incidents}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Area:</span>
                            <div className="font-medium">{analysis.affectedArea}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Timeline:</span>
                            <div className="font-medium">{analysis.timeline}</div>
                          </div>
                        </div>

                        <div className="bg-muted/50 p-3 rounded-lg">
                          <h5 className="font-medium text-xs mb-1">Proposed Solution:</h5>
                          <p className="text-xs text-muted-foreground mb-2">{analysis.solution}</p>
                          <div className="flex justify-between text-xs">
                            <span>
                              Cost: <strong>{analysis.cost}</strong>
                            </span>
                            <span>
                              Timeline: <strong>{analysis.timeline}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="flex-1 text-xs h-7 bg-transparent">
                            <FileText className="w-3 h-3 mr-1" />
                            View Report
                          </Button>
                          <Button size="sm" className="flex-1 text-xs h-7">
                            <Target className="w-3 h-3 mr-1" />
                            Approve Solution
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Preventive Measures */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" />
              Preventive Measures
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {preventiveMeasures.map((measure, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{measure.title}</h4>
                      <Badge
                        variant={
                          measure.status === "Deployed"
                            ? "default"
                            : measure.status === "In Progress"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {measure.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground">{measure.description}</p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{measure.completion}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${measure.completion}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Quick Actions */}
            <div className="space-y-2">
              <Button className="w-full" size="sm">
                <Lightbulb className="w-4 h-4 mr-2" />
                Generate New Insights
              </Button>
              <Button variant="outline" className="w-full bg-transparent" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Export Analysis Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
