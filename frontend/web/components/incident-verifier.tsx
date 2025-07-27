"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, XCircle, Clock, MapPin, User, Camera, Eye, ThumbsUp, ThumbsDown, Loader2, AlertTriangle, Shield } from "lucide-react"
import { verifierService, VerifierAgentRequest, VerifierAgentResponse, VerificationResult } from "@/lib/verifier-service"
import { useToast } from "@/hooks/use-toast"
import { useVerification } from "@/hooks/use-verification"
import { synthesizeAlert, SynthesizerAlert } from "@/lib/synthesizer-service"
import { getSeverity, SeverityResponse } from "@/lib/severity-service"

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
  const { toast } = useToast()
  const {
    verifyingReports,
    verificationResults,
    verificationProgress,
    verifyReport,
    getVerificationStats,
  } = useVerification()
  const [authorityAlerts, setAuthorityAlerts] = useState<SynthesizerAlert[]>([])
  const [priorityQueue, setPriorityQueue] = useState<any[]>([])

  const handleVerifyReport = async (reportId: string, action: "approve" | "reject") => {
    if (action === "reject") {
      toast({
        title: "Report Rejected",
        description: `Report ${reportId} has been manually rejected.`,
        variant: "destructive",
      })
      return
    }

    const report = pendingReports.find(r => r.id === reportId)
    if (!report) {
      toast({
        title: "Error",
        description: "Report not found.",
        variant: "destructive",
      })
      return
    }

    try {
      const request: VerifierAgentRequest = {
        incidentId: report.id,
        title: report.title,
        description: report.description,
        location: report.location,
        reporter: report.reporter,
        reporterLevel: report.reporterLevel,
        reporterPoints: report.reporterPoints,
        type: report.type,
        severity: report.severity,
        hasPhoto: report.hasPhoto,
        hasVideo: report.hasVideo,
        upvotes: report.upvotes,
        downvotes: report.downvotes,
        similarReports: report.similarReports,
        timestamp: new Date().toISOString(),
      }

      const result = await verifyReport(request)

      if (result.success && result.data) {
        const verification = result.data
        if (verification.verified) {
          toast({
            title: "Report Verified",
            description: `Report ${reportId} verified with ${Math.round(verification.confidence * 100)}% confidence.`,
          })
          // Synthesize alert after verification
          const alert = await synthesizeAlert({
            incidentId: report.id,
            title: report.title,
            description: report.description,
            location: report.location,
            verifiedAt: new Date().toISOString(),
          })
          if (alert) setAuthorityAlerts(prev => [alert, ...prev])
          // Get severity and add to priority queue
          const severity = await getSeverity({
            incidentId: report.id,
            title: report.title,
            description: report.description,
            location: report.location,
            verifiedAt: new Date().toISOString(),
          })
          if (severity) {
            setPriorityQueue(prev => [
              {
                ...report,
                severity: severity.severity,
                severityScore: severity.score,
                severityReason: severity.reason,
                verifiedAt: new Date().toISOString(),
                status: 'pending',
                reportsCount: Math.floor(Math.random() * 10) + 1, // mock
                sensorsCount: Math.floor(Math.random() * 3), // mock
              },
              ...prev,
            ])
          }
        } else {
          toast({
            title: "Report Rejected",
            description: `Report ${reportId} rejected by AI verification.`,
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Verification Failed",
          description: result.error || "Failed to verify report",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Verification error:', error)
      toast({
        title: "Verification Error",
        description: error instanceof Error ? error.message : "An error occurred during verification",
        variant: "destructive",
      })
    }
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
      {/* Authority Alerts Section */}
      <div className="mb-6">
        <Card className="bg-[#181c23] border border-red-900/40">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center text-red-400">
              <span className="mr-2">Authority Alerts</span>
              {authorityAlerts.length > 0 && (
                <span className="ml-2 bg-red-600 text-white rounded-full px-2 py-0.5 text-xs font-bold">{authorityAlerts.length}</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-56 overflow-y-auto">
            {authorityAlerts.length === 0 ? (
              <div className="text-muted-foreground text-sm">No alerts yet.</div>
            ) : (
              authorityAlerts.map(alert => (
                <div key={alert.alertId} className="rounded-lg border border-red-900/30 bg-red-950/30 px-4 py-2 mb-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-red-200">{alert.title}</div>
                    <div className="text-xs text-muted-foreground">{formatAlertTime(alert.timestamp)}</div>
                  </div>
                  <div className="text-xs text-red-300 mt-1">{alert.description}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      {/* Priority Queue Section */}
      <div className="mb-6">
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center text-black">
              <span className="mr-2">&#9888; Priority Queue</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" className="text-xs">Filter</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {priorityQueue.length === 0 ? (
              <div className="text-muted-foreground text-sm">No priority incidents yet.</div>
            ) : (
              [...priorityQueue].sort((a, b) => severityOrder(b.severity) - severityOrder(a.severity) || new Date(b.verifiedAt).getTime() - new Date(a.verifiedAt).getTime()).map(item => (
                <div key={item.id} className="rounded-xl border border-gray-100 bg-white px-4 py-3 mb-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-gray-100 rounded px-2 py-0.5 font-semibold text-gray-600">{item.id}</span>
                      {item.severity === 'critical' && <span className="ml-2 w-2 h-2 bg-red-600 rounded-full inline-block"></span>}
                    </div>
                    <div className="text-xs text-gray-400">{formatAlertTime(item.verifiedAt)}</div>
                  </div>
                  <div className="font-semibold text-black mt-1">{item.title}</div>
                  <div className="text-xs text-gray-500">{item.location}</div>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`text-xs font-semibold rounded px-2 py-0.5 ${severityBadgeClass(item.severity)}`}>{item.severity}</span>
                    <span className="text-xs text-gray-400">{item.status}</span>
                  </div>
                  <div className="flex items-center space-x-6 mt-2">
                    <span className="text-xs text-gray-500">{item.reportsCount} reports</span>
                    <span className="text-xs text-gray-500">{item.sensorsCount} sensors</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1 text-xs"><Eye className="w-4 h-4 mr-1" />View</Button>
                    <Button size="sm" className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>Dispatch</Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-950/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{pendingReports.length}</div>
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
                <div className="text-2xl font-bold">{getVerificationStats().totalVerified}</div>
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
                <div className="text-2xl font-bold">{getVerificationStats().totalRejected}</div>
                <div className="text-sm text-muted-foreground">Rejected Today</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {verifyingReports.size > 0 ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{verifyingReports.size}</span>
                    </div>
                  ) : (
                    `${getVerificationStats().accuracyRate}%`
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {verifyingReports.size > 0 ? "Verifying..." : "AI Accuracy Rate"}
                </div>
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
                              {verifyingReports.has(report.id) ? (
                                <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  <span>{verificationProgress.get(report.id) || "Verifying..."}</span>
                                </div>
                              ) : verificationResults.has(report.id) ? (
                                <div className="flex items-center space-x-2">
                                  {(() => {
                                    const result = verificationResults.get(report.id)!
                                    return (
                                      <>
                                        <Badge 
                                          variant={result.verified ? "default" : "destructive"}
                                          className="text-xs"
                                        >
                                          {result.verified ? "Verified" : "Rejected"}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                          {Math.round(result.confidence * 100)}%
                                        </Badge>
                                      </>
                                    )
                                  })()}
                                </div>
                              ) : (
                                <>
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
                                    <Shield className="w-3 h-3 mr-1" />
                                    AI Verify
                                  </Button>
                                </>
                              )}
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

                            {verificationResults.has(report.id) && (() => {
                              const result = verificationResults.get(report.id)!
                              return (
                                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                                  <div className="flex items-center space-x-2">
                                    <Shield className="w-5 h-5 text-blue-600" />
                                    <h4 className="font-medium">AI Verification Result</h4>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Status:</span>
                                      <div className="font-medium">
                                        <Badge variant={result.verified ? "default" : "destructive"}>
                                          {result.verified ? "Verified" : "Rejected"}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Confidence:</span>
                                      <div className="font-medium">{Math.round(result.confidence * 100)}%</div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Risk Level:</span>
                                      <div className="font-medium">
                                        <Badge variant={
                                          result.riskLevel === 'high' ? 'destructive' : 
                                          result.riskLevel === 'medium' ? 'default' : 'secondary'
                                        }>
                                          {result.riskLevel}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Priority:</span>
                                      <div className="font-medium">
                                        <Badge variant={
                                          result.suggestedPriority === 'critical' ? 'destructive' : 
                                          result.suggestedPriority === 'high' ? 'default' : 'secondary'
                                        }>
                                          {result.suggestedPriority}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <span className="text-muted-foreground text-sm">Reasoning:</span>
                                    <p className="text-sm mt-1">{result.reasoning}</p>
                                  </div>

                                  {result.recommendations.length > 0 && (
                                    <div>
                                      <span className="text-muted-foreground text-sm">Recommendations:</span>
                                      <ul className="text-sm mt-1 space-y-1">
                                        {result.recommendations.map((rec, index) => (
                                          <li key={index} className="flex items-start space-x-2">
                                            <span className="text-blue-600 mt-1">•</span>
                                            <span>{rec}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Response Time:</span>
                                      <div className="font-medium">{result.estimatedResponseTime} min</div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Immediate Action:</span>
                                      <div className="font-medium">
                                        <Badge variant={result.requiresImmediateAction ? "destructive" : "secondary"}>
                                          {result.requiresImmediateAction ? "Required" : "Not Required"}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })()}

                            <div className="flex space-x-2">
                              {verifyingReports.has(report.id) ? (
                                <div className="flex items-center justify-center space-x-2 text-muted-foreground w-full">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>{verificationProgress.get(report.id) || "Verifying with AI..."}</span>
                                </div>
                              ) : verificationResults.has(report.id) ? (
                                <>
                                  <Button
                                    variant="outline"
                                    className="flex-1 bg-transparent"
                                    onClick={() => handleVerifyReport(report.id, "reject")}
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Override & Reject
                                  </Button>
                                  <Button
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                    onClick={() => handleDispatchServices(report.id)}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Dispatch Services
                                  </Button>
                                </>
                              ) : (
                                <>
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
                                    <Shield className="w-4 h-4 mr-2" />
                                    AI Verify & Dispatch
                                  </Button>
                                </>
                              )}
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

function formatAlertTime(timestamp: string) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 60000)
  if (diff < 1) return 'Just now'
  if (diff < 60) return `${diff}m`
  const hours = Math.floor(diff / 60)
  if (hours < 24) return `${hours}h`
  return date.toLocaleDateString()
}

function severityOrder(severity: string) {
  switch (severity) {
    case 'critical': return 4
    case 'high': return 3
    case 'medium': return 2
    case 'low': return 1
    default: return 0
  }
}
function severityBadgeClass(severity: string) {
  switch (severity) {
    case 'critical': return 'bg-red-100 text-red-600'
    case 'high': return 'bg-orange-100 text-orange-600'
    case 'medium': return 'bg-yellow-100 text-yellow-600'
    case 'low': return 'bg-green-100 text-green-600'
    default: return 'bg-gray-100 text-gray-600'
  }
}