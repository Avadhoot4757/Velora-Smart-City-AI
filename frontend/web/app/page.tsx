"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ModeToggle } from "@/components/mode-toggle"
import { LoginDialog } from "@/components/login-dialog"
import { AuthorityLoginModal } from "@/components/authority-login-modal"

import {
  Search,
  AlertTriangle,
  Wind,
  Volume2,
  Calendar,
  MessageSquare,
  Megaphone,
  Car,
  Users,
  Navigation,
  Crosshair,
  Clock,
  MapPin,
} from "lucide-react"
import { MapSection } from "@/components/map-section"

const mapTypes = [
  { id: "traffic", label: "Traffic", icon: Car, color: "bg-red-500" },
  { id: "air", label: "Air Quality", icon: Wind, color: "bg-green-500" },
  { id: "noise", label: "Noise", icon: Volume2, color: "bg-purple-500" },
  { id: "mood", label: "Mood", icon: Users, color: "bg-blue-500" },
]

const notifications = [
  {
    type: "authority",
    title: "MG Road Lane Closure",
    description: "Emergency maintenance work in progress",
    time: "2m",
    icon: Megaphone,
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-900/10",
    borderColor: "border-red-200 dark:border-red-800",
  },
  {
    type: "authority",
    title: "Signal Maintenance Silk Board",
    description: "Traffic signal repair ongoing",
    time: "5m",
    icon: Megaphone,
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-900/10",
    borderColor: "border-red-200 dark:border-red-800",
  },
  {
    type: "authority",
    title: "Metro Service Update",
    description: "Purple line delays expected",
    time: "8m",
    icon: Megaphone,
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-900/10",
    borderColor: "border-red-200 dark:border-red-800",
  },
]

const socialBuzz = [
  { 
    title: "#BangaloreRains",
    description: "Heavy rainfall reported in multiple areas",
    time: "30m",
    icon: MessageSquare,
    trending: true,
    engagement: "2.1K posts"
  },
  { 
    title: "#TrafficAlert Whitefield",
    description: "Major jam on ITPL main road",
    time: "45m",
    icon: MessageSquare,
    trending: false,
    engagement: "856 posts"
  },
  { 
    title: "#MetroUpdate Purple Line",
    description: "Service restored after technical issues",
    time: "1h",
    icon: MessageSquare,
    trending: false,
    engagement: "432 posts"
  },
]

const events = [
  { 
    title: "Tech Summit 2024",
    location: "Palace Grounds",
    time: "Tomorrow",
    impact: "High Traffic",
    duration: "9 AM - 6 PM",
    attendees: "15K+"
  },
  { 
    title: "Bengaluru Marathon",
    location: "Lalbagh to Cubbon Park",
    time: "Sunday",
    impact: "Road Closures",
    duration: "5 AM - 11 AM",
    attendees: "25K+"
  },
  { 
    title: "Karaga Festival",
    location: "Commercial Street",
    time: "Weekend",
    impact: "Parking Issues",
    duration: "6 PM - 12 AM",
    attendees: "50K+"
  },
]

const civicIssues = [
  { 
    title: "Pothole - ORR Main",
    description: "Large pothole near Electronic City",
    time: "1h",
    severity: "high",
    location: "Outer Ring Road",
    reports: 23
  },
  { 
    title: "Water Supply - HSR Layout",
    description: "Water shortage in Sector 2",
    time: "2h",
    severity: "medium",
    location: "HSR Layout",
    reports: 15
  },
  { 
    title: "Street Lights - Bannerghatta",
    description: "Multiple street lights not working",
    time: "3h",
    severity: "low",
    location: "Bannerghatta Road",
    reports: 8
  },
]

export default function LandingPage() {
  const [activeMap, setActiveMap] = useState("traffic")
  const [query, setQuery] = useState("")
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [currentLocation, setCurrentLocation] = useState("Koramangala, Bengaluru")
  const [isAuthorityLoginOpen, setIsAuthorityLoginOpen] = useState(false)
  const router = useRouter()

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/dashboard?q=${encodeURIComponent(query)}`)
    }
  }

  const getMapData = (mapType: string) => {
    const data = {
      traffic: {
        hotspots: [
          { x: "25%", y: "30%", intensity: "high", label: "MG Road" },
          { x: "60%", y: "45%", intensity: "medium", label: "Electronic City" },
          { x: "40%", y: "60%", intensity: "high", label: "Silk Board" },
          { x: "70%", y: "25%", intensity: "low", label: "Whitefield" },
        ],
        color: "bg-red-500",
      },
      air: {
        hotspots: [
          { x: "30%", y: "40%", intensity: "medium", label: "Moderate" },
          { x: "65%", y: "35%", intensity: "low", label: "Good" },
          { x: "45%", y: "70%", intensity: "high", label: "Poor" },
          { x: "20%", y: "60%", intensity: "medium", label: "Moderate" },
        ],
        color: "bg-green-500",
      },
      noise: {
        hotspots: [
          { x: "35%", y: "25%", intensity: "high", label: "High" },
          { x: "55%", y: "50%", intensity: "medium", label: "Medium" },
          { x: "75%", y: "40%", intensity: "low", label: "Quiet" },
          { x: "25%", y: "75%", intensity: "high", label: "Construction" },
        ],
        color: "bg-purple-500",
      },
      mood: {
        hotspots: [
          { x: "40%", y: "35%", intensity: "high", label: "Happy" },
          { x: "60%", y: "55%", intensity: "medium", label: "Neutral" },
          { x: "30%", y: "65%", intensity: "low", label: "Stressed" },
          { x: "70%", y: "30%", intensity: "high", label: "Positive" },
        ],
        color: "bg-blue-500",
      },
    }
    return data[mapType as keyof typeof data] || data.traffic
  }

  const currentMapData = getMapData(activeMap)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
    }
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Minimal Header */}
      <header className="flex-shrink-0 border-b bg-background/95 backdrop-blur-sm">
        <div className="px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-extrabold text-primary tracking-wide flex items-center">
              <span className="mr-2">📡</span> Velora
            </span>
          </div>

          {/* Current Location */}
          <div className="flex items-center space-x-2 bg-muted/50 px-3 py-1.5 rounded-full">
            <Crosshair className="w-3 h-3 text-primary" />
            <span className="text-sm font-medium">{currentLocation}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0"
              onClick={() => {
                setCurrentLocation("Detecting...")
                setTimeout(() => setCurrentLocation("Koramangala, Bengaluru"), 1000)
              }}
            >
              <Navigation className="w-3 h-3" />
            </Button>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <ModeToggle />
            <Button variant="outline" size="sm" onClick={() => setIsLoginOpen(true)}>
              Login
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsAuthorityLoginOpen(true)}>
              Authority Login
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Section with Centered Heading and Map */}
        <div className="flex-1 flex flex-col p-6">
          {/* Centered Hero */}
          <div className="flex justify-center mb-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-1">What's happening around you?</h1>
              <p className="text-sm text-muted-foreground">Live city intelligence at a glance</p>
            </div>
          </div>

          {/* Map Controls and Search */}
          <div className="flex flex-col space-y-4">
            <div className="flex justify-center space-x-2">
              {mapTypes.map((mapType) => {
                const Icon = mapType.icon
                return (
                  <Button
                    key={mapType.id}
                    variant={activeMap === mapType.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveMap(mapType.id)}
                    className={activeMap === mapType.id ? `${mapType.color} text-white` : ""}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    {mapType.label}
                  </Button>
                )
              })}
            </div>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Ask about your city..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 h-9"
                />
              </div>
              <Button onClick={handleSearch} size="sm" className="px-4">
                Go
              </Button>
            </div>
          </div>

          {/* Map Section with Hotspots */}
          <Card className="flex-1 mt-4 p-0 overflow-hidden relative">
            <MapSection query={query} />
            {/* Hotspots Overlay */}
            {currentMapData.hotspots.map((hotspot, index) => (
              <div
                key={index}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                style={{ left: hotspot.x, top: hotspot.y }}
              >
                {/* Pulse Ring */}
                <div
                  className={`absolute ${currentMapData.color}/30 rounded-full animate-ping`}
                  style={{
                    width: hotspot.intensity === "high" ? "60px" : hotspot.intensity === "medium" ? "40px" : "25px",
                    height: hotspot.intensity === "high" ? "60px" : hotspot.intensity === "medium" ? "40px" : "25px",
                    animationDelay: `${index * 600}ms`,
                    animationDuration: "2s",
                  }}
                />

                {/* Main Dot */}
                <div
                  className={`${currentMapData.color}/70 rounded-full flex items-center justify-center animate-pulse`}
                  style={{
                    width: hotspot.intensity === "high" ? "30px" : hotspot.intensity === "medium" ? "20px" : "12px",
                    height: hotspot.intensity === "high" ? "30px" : hotspot.intensity === "medium" ? "20px" : "12px",
                  }}
                >
                  <div className={`w-1 h-1 ${currentMapData.color} rounded-full`} />
                </div>
              </div>
            ))}
            {/* Stats Overlay */}
            <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg z-20">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">
                  {activeMap === "traffic"
                    ? "74%"
                    : activeMap === "air"
                      ? "156"
                      : activeMap === "noise"
                        ? "68dB"
                        : "7.2"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {activeMap === "traffic"
                    ? "Congested"
                    : activeMap === "air"
                      ? "AQI"
                      : activeMap === "noise"
                        ? "Noise"
                        : "Mood"}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Sidebar - Enhanced Notification Cards */}
        <div className="w-96 flex-shrink-0 pt-6 pr-6 space-y-4">
          {/* Authority Alerts */}
          <Card className="border-l-4 border-l-red-500 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center">
                  <Megaphone className="w-5 h-5 mr-2 text-red-500" />
                  Authority Alerts
                </div>
                <Badge variant="destructive" className="text-xs">
                  {notifications.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-40 px-4 pb-4">
                <div className="space-y-3">
                  {notifications.map((item, index) => (
                    <div key={index} className={`p-3 rounded-lg ${item.bgColor} ${item.borderColor} border`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          {item.time}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Social Buzz */}
          <Card className="border-l-4 border-l-blue-500 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
                  Social Buzz
                </div>
                <Badge variant="secondary" className="text-xs">
                  Trending
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-40 px-4 pb-4">
                <div className="space-y-3">
                  {socialBuzz.map((item, index) => (
                    <div key={index} className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm flex items-center">
                          {item.title}
                          {item.trending && (
                            <Badge variant="outline" className="ml-2 text-xs h-4 text-blue-600">
                              🔥
                            </Badge>
                          )}
                        </h4>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          {item.time}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{item.description}</p>
                      <p className="text-xs text-blue-600 font-medium">{item.engagement}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="border-l-4 border-l-green-500 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-green-500" />
                  Upcoming Events
                </div>
                <Badge variant="outline" className="text-xs">
                  {events.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-48 px-4 pb-4">
                <div className="space-y-3">
                  {events.map((event, index) => (
                    <div key={index} className="p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <Badge variant="outline" className="text-xs h-4">
                          {event.time}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3 mr-1" />
                          {event.location}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{event.duration}</span>
                          <span className="text-green-600 font-medium">{event.attendees}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {event.impact}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Civic Issues */}
          <Card className="border-l-4 border-l-yellow-500 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
                  Civic Issues
                </div>
                <Badge variant="outline" className="text-xs">
                  Active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-40 px-4 pb-4">
                <div className="space-y-3">
                  {civicIssues.map((issue, index) => (
                    <div key={index} className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{issue.title}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge className={`text-xs h-4 ${getSeverityColor(issue.severity)}`}>
                            {issue.severity}
                          </Badge>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 mr-1" />
                            {issue.time}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{issue.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="w-3 h-3 mr-1" />
                          {issue.location}
                        </div>
                        <span className="text-yellow-600 font-medium">{issue.reports} reports</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
      {isAuthorityLoginOpen && (
        <AuthorityLoginModal onClose={() => setIsAuthorityLoginOpen(false)} />
      )}
    </div>
  )
}