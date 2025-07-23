"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Target, MapPin, Zap, Users, Car, AlertTriangle, Eye, Navigation } from "lucide-react"

const hotspots = [
  {
    id: "HS-001",
    name: "MG Road Junction",
    type: "traffic",
    severity: "critical",
    incidents: 23,
    activeServices: 3,
    eta: "5 min",
    coordinates: { x: "30%", y: "40%" },
    description: "Heavy congestion during peak hours",
  },
  {
    id: "HS-002",
    name: "Silk Board Signal",
    type: "traffic",
    severity: "high",
    incidents: 18,
    activeServices: 2,
    eta: "8 min",
    coordinates: { x: "60%", y: "60%" },
    description: "Signal malfunction causing delays",
  },
  {
    id: "HS-003",
    name: "Koramangala 4th Block",
    type: "civic",
    severity: "medium",
    incidents: 12,
    activeServices: 1,
    eta: "12 min",
    coordinates: { x: "45%", y: "25%" },
    description: "Water supply issues reported",
  },
  {
    id: "HS-004",
    name: "HSR Layout Sector 2",
    type: "safety",
    severity: "medium",
    incidents: 8,
    activeServices: 1,
    eta: "15 min",
    coordinates: { x: "70%", y: "35%" },
    description: "Street lighting maintenance required",
  },
]

const serviceUnits = [
  {
    id: "SU-001",
    type: "Traffic Police",
    location: "En route to MG Road",
    eta: "3 min",
    status: "active",
  },
  {
    id: "SU-002",
    type: "Water Dept",
    location: "Koramangala 4th Block",
    eta: "On site",
    status: "deployed",
  },
  {
    id: "SU-003",
    type: "Electrical Team",
    location: "HSR Layout",
    eta: "10 min",
    status: "active",
  },
]

export function HotspotManagement() {
  const [zoomLevel, setZoomLevel] = useState([2])
  const [viewMode, setViewMode] = useState("hotspots")
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      default:
        return "bg-blue-500"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "traffic":
        return Car
      case "civic":
        return AlertTriangle
      case "safety":
        return Users
      default:
        return MapPin
    }
  }

  const handleDeployServices = (hotspotId: string) => {
    console.log(`Deploying services to hotspot: ${hotspotId}`)
  }

  const handleFocusHotspot = (hotspotId: string) => {
    setSelectedHotspot(hotspotId)
    console.log(`Focusing on hotspot: ${hotspotId}`)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-950/20 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-muted-foreground">Active Hotspots</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/20 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">7</div>
                <div className="text-sm text-muted-foreground">Service Units</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-950/20 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">8m</div>
                <div className="text-sm text-muted-foreground">Avg Response</div>
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
                <div className="text-2xl font-bold">2km</div>
                <div className="text-sm text-muted-foreground">Focus Radius</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tactical Map */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Tactical Hotspot View (2km Radius)
              </CardTitle>
              <ToggleGroup type="single" value={viewMode} onValueChange={setViewMode}>
                <ToggleGroupItem value="hotspots" size="sm">
                  <Target className="w-4 h-4 mr-1" />
                  Hotspots
                </ToggleGroupItem>
                <ToggleGroupItem value="services" size="sm">
                  <Car className="w-4 h-4 mr-1" />
                  Services
                </ToggleGroupItem>
                <ToggleGroupItem value="both" size="sm">
                  <Eye className="w-4 h-4 mr-1" />
                  Both
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Zoom Control */}
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">Zoom Level:</span>
                <Slider value={zoomLevel} onValueChange={setZoomLevel} max={5} min={1} step={1} className="flex-1" />
                <Badge variant="outline">{zoomLevel[0]}km radius</Badge>
              </div>

              {/* Tactical Map */}
              <div className="relative h-80 bg-gradient-to-br from-muted/10 to-muted/20 rounded-lg overflow-hidden border-2 border-dashed border-primary/20">
                {/* Hotspot markers */}
                {hotspots.map((hotspot) => {
                  const IconComponent = getTypeIcon(hotspot.type)
                  return (
                    <div
                      key={hotspot.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                      style={{ left: hotspot.coordinates.x, top: hotspot.coordinates.y }}
                      onClick={() => handleFocusHotspot(hotspot.id)}
                    >
                      {/* Pulse ring */}
                      <div
                        className={`absolute ${getSeverityColor(hotspot.severity)}/20 rounded-full animate-ping`}
                        style={{
                          width: hotspot.severity === "critical" ? "40px" : "30px",
                          height: hotspot.severity === "critical" ? "40px" : "30px",
                          animationDuration: "2s",
                        }}
                      />

                      {/* Main marker */}
                      <div
                        className={`${getSeverityColor(hotspot.severity)} rounded-full flex items-center justify-center text-white shadow-lg ${
                          selectedHotspot === hotspot.id ? "ring-4 ring-primary/50" : ""
                        }`}
                        style={{
                          width: hotspot.severity === "critical" ? "20px" : "16px",
                          height: hotspot.severity === "critical" ? "20px" : "16px",
                        }}
                      >
                        <IconComponent className="w-3 h-3" />
                      </div>

                      {/* Label */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs whitespace-nowrap">
                        {hotspot.name}
                      </div>
                    </div>
                  )
                })}

                {/* Service unit markers */}
                <div className="absolute left-1/4 top-1/2 w-3 h-3 bg-green-500 rounded-sm animate-pulse"></div>
                <div className="absolute right-1/3 bottom-1/3 w-3 h-3 bg-green-500 rounded-sm animate-pulse"></div>

                {/* Focus radius indicator */}
                <div className="absolute inset-0 border-2 border-primary/30 rounded-full m-8"></div>

                {/* Legend */}
                <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg space-y-1">
                  <div className="flex items-center space-x-2 text-xs">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Critical</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>High</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Medium</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                    <span>Service Units</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hotspot Details & Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Hotspot Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hotspots.map((hotspot) => (
              <Card
                key={hotspot.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedHotspot === hotspot.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedHotspot(hotspot.id)}
              >
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {hotspot.id}
                      </Badge>
                      <div className={`w-3 h-3 rounded-full ${getSeverityColor(hotspot.severity)}`}></div>
                    </div>

                    <h4 className="font-medium text-sm">{hotspot.name}</h4>
                    <p className="text-xs text-muted-foreground">{hotspot.description}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Incidents:</span>
                        <div className="font-medium">{hotspot.incidents}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Services:</span>
                        <div className="font-medium">{hotspot.activeServices}</div>
                      </div>
                    </div>

                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-7 bg-transparent"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFocusHotspot(hotspot.id)
                        }}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Focus
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 text-xs h-7"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeployServices(hotspot.id)
                        }}
                      >
                        <Navigation className="w-3 h-3 mr-1" />
                        Deploy
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Service Units Status */}
      <Card>
        <CardHeader>
          <CardTitle>Active Service Units</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {serviceUnits.map((unit) => (
              <div key={unit.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{unit.type}</h4>
                  <Badge variant={unit.status === "deployed" ? "default" : "secondary"} className="text-xs">
                    {unit.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{unit.location}</p>
                <p className="text-xs font-medium">ETA: {unit.eta}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
