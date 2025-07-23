"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, XCircle, Clock, MapPin, User, Camera, Eye, ThumbsUp, ThumbsDown } from "lucide-react"

const pendingReports = [
  {
    id: "RPT-001",
    title: "Pothole on MG Road",
    description: "Large pothole causing traffic issues near the metro station",
    location: "MG Road Metro Station",
    reporter: "Priya Sharma",
    reporterLevel: 8,
    reporterPoints: 1250,
    time: "5 min ago",
    type: "civic",
    severity: "medium",
    hasPhoto: true,
    hasVideo: false,
    upvotes: 12,
    downvotes: 1,
    similarReports: 3,
  },
  {
    id: "RPT-002",
    title: "Traffic Signal Not Working",
    description: "Traffic signal at Silk Board junction has been malfunctioning for 2 hours",
    location: "Silk Board Junction",
    reporter: "Rajesh Kumar",
    reporterLevel: 5,
    reporterPoints: 890,
    time: "12 min ago",
    type: "traffic",
    severity: "high",
    hasPhoto: true,
    hasVideo: true,
    upvotes: 25,
    downvotes: 0,
    similarReports: 8,
  },
  {
    id: "RPT-003",
    title: "Street Light Outage",
    description: "Multiple street lights not working in HSR Layout Sector 2",
    location: "HSR Layout Sector 2",
    reporter: "Anonymous User",
    reporterLevel: 2,
    reporterPoints: 150,
    time: "25 min ago",
    type: "safety",
    severity: "medium",
    hasPhoto: false,
    hasVideo: false,
    upvotes: 5,
    downvotes: 2,
    similarReports: 1,
  },
]

const verifiedReports = [
  {
    id: "RPT-VER-001",
    title: "Water Pipe Burst Verified",
    location: "Koramangala 4th Block",
    verifiedBy: "Authority Control",
    time: "2 hours ago",
    status: "dispatched",
    serviceTeam: "Water Dept Team A",
  },
  {
    id: "RPT-VER-002",
    title: "Accident Cleared",
    location: "Outer Ring Road",
    verifiedBy: "Traffic Control",
    time: "4 hours ago",
    status: "resolved",
    serviceTeam: "Traffic Police Unit 3",
  },
]

export function IncidentVerifier() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null)

  const handleVerifyReport = (reportId: string, action: "approve" | "reject") => {
    console.log(`${action} report: ${reportId}`)
    // Mock verification logic
  }

  const handleDispatchServices = (reportId: string) => {
    console.log(`Dispatching services for report: ${reportId}`)
    // Mock dispatch logic
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-50 dark:bg-red-950/20"
      case "medium":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20"
      default:
        return "text-blue-600 bg-blue-50 dark:bg-blue-950/20"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "traffic":
        return "🚗"
      case "civic":
        return "🏗️"
      case "safety":
        return "🚨"
      default:
        return "📍"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-950/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">47</div>
                <div className="text-sm text-muted-foreground">Pending Review</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-950/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">156</div>
                <div className="text-sm text-muted-foreground">Verified Today</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-950/20 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">23</div>
                <div className="text-sm text-muted-foreground">Rejected Today</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/20 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">89%</div>
                <div className="text-sm text-muted-foreground">Accuracy Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Reports ({pendingReports.length})</TabsTrigger>
          <TabsTrigger value="verified">Recently Verified ({verifiedReports.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Reports List */}
            <Card>
              <CardHeader>
                <CardTitle>Reports Queue</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-96">
                  <div className="space-y-3 p-4">
                    {pendingReports.map((report) => (
                      <Card
                        key={report.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedReport === report.id ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => setSelectedReport(report.id)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {report.id}
                              </Badge>
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{getTypeIcon(report.type)}</span>
                                <Badge className={`text-xs ${getSeverityColor(report.severity)}`}>
                                  {report.severity}
                                </Badge>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-sm mb-1">{report.title}</h4>
                              <p className="text-xs text-muted-foreground mb-2">{report.description}</p>
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                <span>{report.location}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src="/placeholder.svg" />
                                  <AvatarFallback className="text-xs">{report.reporter.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="text-xs">
                                  <div className="font-medium">{report.reporter}</div>
                                  <div className="text-muted-foreground">
                                    L{report.reporterLevel} • {report.reporterPoints}pts
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">{report.time}</div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 text-xs">
                                {report.hasPhoto && <Camera className="w-4 h-4 text-blue-500" />}
                                {report.hasVideo && <div className="text-blue-500">🎥</div>}
                                <div className="flex items-center space-x-1">
                                  <ThumbsUp className="w-3 h-3 text-green-500" />
                                  <span>{report.upvotes}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <ThumbsDown className="w-3 h-3 text-red-500" />
                                  <span>{report.downvotes}</span>
                                </div>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                +{report.similarReports} similar
                              </Badge>
                            </div>

                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-xs h-7 bg-transparent"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleVerifyReport(report.id, "reject")
                                }}
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1 text-xs h-7 bg-green-600 hover:bg-green-700"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleVerifyReport(report.id, "approve")
                                }}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verify
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

            {/* Report Details */}
            <Card>
              <CardHeader>
                <CardTitle>Report Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedReport ? (
                  <div className="space-y-4">
                    {(() => {
                      const report = pendingReports.find((r) => r.id === selectedReport)
                      if (!report) return <div>Report not found</div>

                      return (
                        <>
                          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                            {report.hasPhoto ? (
                              <div className="text-center">
                                <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Photo Evidence</p>
                              </div>
                            ) : (
                              <div className="text-center">
                                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">No Photo Available</p>
                              </div>
                            )}
                          </div>

                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium mb-1">{report.title}</h4>
                              <p className="text-sm text-muted-foreground">{report.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Location:</span>
                                <div className="font-medium">{report.location}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Reported:</span>
                                <div className="font-medium">{report.time}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Reporter:</span>
                                <div className="font-medium">{report.reporter}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Credibility:</span>
                                <div className="font-medium">
                                  L{report.reporterLevel} • {report.reporterPoints}pts
                                </div>
                              </div>
                            </div>

                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                className="flex-1 bg-transparent"
                                onClick={() => handleVerifyReport(report.id, "reject")}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject Report
                              </Button>
                              <Button
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                onClick={() => handleVerifyReport(report.id, "approve")}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Verify & Dispatch
                              </Button>
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a report to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="verified">
          <Card>
            <CardHeader>
              <CardTitle>Recently Verified Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {verifiedReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{report.title}</h4>
                      <p className="text-sm text-muted-foreground">{report.location}</p>
                      <p className="text-xs text-muted-foreground">
                        Verified by {report.verifiedBy} • {report.time}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={report.status === "resolved" ? "default" : "secondary"} className="mb-2">
                        {report.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{report.serviceTeam}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
