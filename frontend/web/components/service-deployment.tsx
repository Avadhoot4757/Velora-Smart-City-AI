"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Truck, Users, Wrench, MapPin, Clock, CheckCircle, AlertTriangle, Navigation, Phone, Radio } from "lucide-react"

const serviceTeams = [
  {
    id: "ST-001",
    name: "Traffic Police Unit A",
    type: "traffic",
    status: "available",
    location: "MG Road Station",
    members: 4,
    equipment: ["Traffic Cones", "Radios", "First Aid"],
    eta: "Ready",
  },
  {
    id: "ST-002",
    name: "Water Department Team B",
    type: "civic",
    status: "deployed",
    location: "En route to Koramangala",
    members: 6,
    equipment: ["Repair Tools", "Pipes", "Safety Gear"],
    eta: "8 min",
  },
  {
    id: "ST-003",
    name: "Electrical Maintenance",
    type: "infrastructure",
    status: "available",
    location: "HSR Layout Depot",
    members: 3,
    equipment: ["LED Lights", "Cables", "Testing Equipment"],
    eta: "Ready",
  },
  {
    id: "ST-004",
    name: "Emergency Response Unit",
    type: "emergency",
    status: "active",
    location: "Silk Board Junction",
    members: 5,
    equipment: ["Medical Kit", "Fire Extinguisher", "Rescue Tools"],
    eta: "On site",
  },
]

const deploymentRequests = [
  {
    id: "DR-001",
    incident: "Traffic Signal Malfunction",
    location: "Silk Board Junction",
    priority: "high",
    requestedBy: "Traffic Control",
    time: "5 min ago",
    requiredTeam: "traffic",
    estimatedDuration: "2 hours",
  },
  {
    id: "DR-002",
    incident: "Water Pipe Burst",
    location: "Koramangala 4th Block",
    priority: "critical",
    requestedBy: "Citizen Report #RPT-002",
    time: "12 min ago",
    requiredTeam: "civic",
    estimatedDuration: "4 hours",
  },
  {
    id: "DR-003",
    incident: "Street Light Outage",
    location: "HSR Layout Sector 2",
    priority: "medium",
    requestedBy: "Maintenance Schedule",
    time: "1 hour ago",
    requiredTeam: "infrastructure",
    estimatedDuration: "3 hours",
  },
]

const activeDeployments = [
  {
    id: "AD-001",
    team: "Emergency Response Unit",
    incident: "Accident Response",
    location: "Outer Ring Road",
    startTime: "2 hours ago",
    progress: 75,
    status: "in-progress",
  },
  {
    id: "AD-002",
    team: "Water Department Team B",
    incident: "Pipe Repair",
    location: "Koramangala",
    startTime: "45 min ago",
    progress: 30,
    status: "in-progress",
  },
]

export function ServiceDeployment() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [deploymentFilter, setDeploymentFilter] = useState("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "text-green-600 bg-green-50 dark:bg-green-950/20"
      case "deployed":
        return "text-blue-600 bg-blue-50 dark:bg-blue-950/20"
      case "active":
        return "text-orange-600 bg-orange-50 dark:bg-orange-950/20"
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-950/20"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-red-600 bg-red-50 dark:bg-red-950/20"
      case "high":
        return "text-orange-600 bg-orange-50 dark:bg-orange-950/20"
      case "medium":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20"
      default:
        return "text-blue-600 bg-blue-50 dark:bg-blue-950/20"
    }
  }

  const getTeamIcon = (type: string) => {
    switch (type) {
      case "traffic":
        return Users
      case "civic":
        return Wrench
      case "infrastructure":
        return Truck
      case "emergency":
        return AlertTriangle
      default:
        return Users
    }
  }

  const handleDeployTeam = (teamId: string, requestId: string) => {
    console.log(`Deploying team ${teamId} for request ${requestId}`)
  }

  const handleContactTeam = (teamId: string) => {
    console.log(`Contacting team ${teamId}`)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-950/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-muted-foreground">Available Teams</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/20 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">8</div>
                <div className="text-sm text-muted-foreground">Active Deployments</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-950/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">5</div>
                <div className="text-sm text-muted-foreground">Pending Requests</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">45</div>
                <div className="text-sm text-muted-foreground">Total Personnel</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Deployment Requests</TabsTrigger>
          <TabsTrigger value="teams">Service Teams</TabsTrigger>
          <TabsTrigger value="active">Active Deployments</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Deployment Requests */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pending Requests</CardTitle>
                  <Select value={deploymentFilter} onValueChange={setDeploymentFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-96">
                  <div className="space-y-3 p-4">
                    {deploymentRequests.map((request) => (
                      <Card key={request.id} className="border-l-4 border-l-primary">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {request.id}
                              </Badge>
                              <Badge className={`text-xs ${getPriorityColor(request.priority)}`}>
                                {request.priority}
                              </Badge>
                            </div>

                            <div>
                              <h4 className="font-medium text-sm mb-1">{request.incident}</h4>
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground mb-2">
                                <MapPin className="w-3 h-3" />
                                <span>{request.location}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">Requested by: {request.requestedBy}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Required Team:</span>
                                <div className="font-medium capitalize">{request.requiredTeam}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Duration:</span>
                                <div className="font-medium">{request.estimatedDuration}</div>
                              </div>
                            </div>

                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-xs h-7 bg-transparent"
                                onClick={() => console.log(`Viewing details for ${request.id}`)}
                              >
                                View Details
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1 text-xs h-7"
                                onClick={() => handleDeployTeam("auto", request.id)}
                              >
                                <Navigation className="w-3 h-3 mr-1" />
                                Auto Deploy
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

            {/* Available Teams */}
            <Card>
              <CardHeader>
                <CardTitle>Available Teams</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-96">
                  <div className="space-y-3 p-4">
                    {serviceTeams
                      .filter((team) => team.status === "available")
                      .map((team) => {
                        const IconComponent = getTeamIcon(team.type)
                        return (
                          <Card
                            key={team.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              selectedTeam === team.id ? "ring-2 ring-primary" : ""
                            }`}
                            onClick={() => setSelectedTeam(team.id)}
                          >
                            <CardContent className="p-3">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <IconComponent className="w-4 h-4" />
                                    <h4 className="font-medium text-sm">{team.name}</h4>
                                  </div>
                                  <Badge className={`text-xs ${getStatusColor(team.status)}`}>{team.status}</Badge>
                                </div>

                                <div className="text-xs text-muted-foreground">
                                  <div className="flex items-center space-x-1 mb-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{team.location}</span>
                                  </div>
                                  <div>
                                    {team.members} members • {team.eta}
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-1">
                                  {team.equipment.slice(0, 2).map((item, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {item}
                                    </Badge>
                                  ))}
                                  {team.equipment.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{team.equipment.length - 2}
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex space-x-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 text-xs h-7 bg-transparent"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleContactTeam(team.id)
                                    }}
                                  >
                                    <Phone className="w-3 h-3 mr-1" />
                                    Contact
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="flex-1 text-xs h-7"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      console.log(`Deploying team ${team.id}`)
                                    }}
                                  >
                                    <Navigation className="w-3 h-3 mr-1" />
                                    Deploy
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <CardTitle>All Service Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-4">
                {serviceTeams.map((team) => {
                  const IconComponent = getTeamIcon(team.type)
                  return (
                    <Card key={team.id}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <IconComponent className="w-5 h-5" />
                              <h4 className="font-medium">{team.name}</h4>
                            </div>
                            <Badge className={`${getStatusColor(team.status)}`}>{team.status}</Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Location:</span>
                              <div className="font-medium">{team.location}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Members:</span>
                              <div className="font-medium">{team.members}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Type:</span>
                              <div className="font-medium capitalize">{team.type}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">ETA:</span>
                              <div className="font-medium">{team.eta}</div>
                            </div>
                          </div>

                          <div>
                            <span className="text-sm text-muted-foreground">Equipment:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {team.equipment.map((item, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 bg-transparent"
                              onClick={() => handleContactTeam(team.id)}
                            >
                              <Radio className="w-4 h-4 mr-2" />
                              Contact
                            </Button>
                            <Button size="sm" className="flex-1" disabled={team.status !== "available"}>
                              <Navigation className="w-4 h-4 mr-2" />
                              Deploy
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Deployments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeDeployments.map((deployment) => (
                  <Card key={deployment.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{deployment.team}</h4>
                          <Badge variant="secondary">{deployment.status}</Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Incident:</span>
                            <div className="font-medium">{deployment.incident}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Location:</span>
                            <div className="font-medium">{deployment.location}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Started:</span>
                            <div className="font-medium">{deployment.startTime}</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{deployment.progress}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${deployment.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                            <Radio className="w-4 h-4 mr-2" />
                            Contact Team
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                            <MapPin className="w-4 h-4 mr-2" />
                            Track Location
                          </Button>
                          <Button size="sm" className="flex-1">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark Complete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
