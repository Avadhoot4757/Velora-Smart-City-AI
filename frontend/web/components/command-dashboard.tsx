// components/command-dashboard.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { GoogleMap, Marker, HeatmapLayer } from "@react-google-maps/api";
import { useGoogleMaps } from "@/components/GoogleMapsProvider";
import { useTheme } from "next-themes";
import {
  MapPin,
  AlertTriangle,
  Clock,
  Users,
  Car,
  Zap,
  Eye,
  CheckCircle,
  Navigation,
  Layers,
  Filter,
} from "lucide-react";

const liveIncidents = [
  {
    id: "INC-001",
    type: "traffic",
    title: "Heavy Traffic Jam - MG Road",
    location: "MG Road Junction",
    severity: "high",
    time: "2 min ago",
    status: "verified",
    reports: 15,
    sensors: 3,
    position: { lat: 12.9757, lng: 77.6067 },
  },
  {
    id: "INC-002",
    type: "civic",
    title: "Water Pipe Burst",
    location: "Koramangala 4th Block",
    severity: "high",
    time: "5 min ago",
    status: "pending",
    reports: 8,
    sensors: 1,
    position: { lat: 12.9352, lng: 77.6245 },
  },
  {
    id: "INC-003",
    type: "safety",
    title: "Street Light Outage",
    location: "HSR Layout Sector 2",
    severity: "medium",
    time: "12 min ago",
    status: "verified",
    reports: 3,
    sensors: 0,
    position: { lat: 12.9116, lng: 77.6387 },
  },
  {
    id: "INC-004",
    type: "traffic",
    title: "Accident Reported",
    location: "Outer Ring Road",
    severity: "high",
    time: "18 min ago",
    status: "dispatched",
    reports: 12,
    sensors: 2,
    position: { lat: 12.9293, lng: 77.6848 },
  },
  {
    id: "INC-005",
    type: "traffic",
    title: "Congestion - Whitefield",
    location: "Whitefield Main Road",
    severity: "high",
    time: "10 min ago",
    status: "verified",
    reports: 10,
    sensors: 2,
    position: { lat: 12.9698, lng: 77.7499 },
  },
  {
    id: "INC-006",
    type: "civic",
    title: "Pothole Reported",
    location: "Indiranagar 100 Feet Road",
    severity: "medium",
    time: "15 min ago",
    status: "pending",
    reports: 5,
    sensors: 0,
    position: { lat: 12.9784, lng: 77.6408 },
  },
  {
    id: "INC-007",
    type: "safety",
    title: "Suspicious Activity",
    location: "Jayanagar 4th Block",
    severity: "high",
    time: "20 min ago",
    status: "dispatched",
    reports: 7,
    sensors: 1,
    position: { lat: 12.9308, lng: 77.5838 },
  },
  {
    id: "INC-008",
    type: "traffic",
    title: "Signal Malfunction",
    location: "Electronic City",
    severity: "medium",
    time: "25 min ago",
    status: "verified",
    reports: 9,
    sensors: 2,
    position: { lat: 12.8390, lng: 77.6770 },
  },
  {
    id: "INC-009",
    type: "civic",
    title: "Garbage Overflow",
    location: "Malleshwaram",
    severity: "medium",
    time: "30 min ago",
    status: "pending",
    reports: 4,
    sensors: 0,
    position: { lat: 13.0027, lng: 77.5704 },
  },
  {
    id: "INC-010",
    type: "safety",
    title: "Street Flooding",
    location: "Marathahalli",
    severity: "high",
    time: "35 min ago",
    status: "dispatched",
    reports: 11,
    sensors: 3,
    position: { lat: 12.9592, lng: 77.6974 },
  },
  {
    id: "INC-011",
    type: "traffic",
    title: "Road Blockage",
    location: "Hebbal Flyover",
    severity: "high",
    time: "40 min ago",
    status: "verified",
    reports: 13,
    sensors: 2,
    position: { lat: 13.0359, lng: 77.5970 },
  },
  {
    id: "INC-012",
    type: "civic",
    title: "Broken Bench",
    location: "Cubbon Park",
    severity: "low",
    time: "45 min ago",
    status: "pending",
    reports: 2,
    sensors: 0,
    position: { lat: 12.9756, lng: 77.5929 },
  },
  {
    id: "INC-013",
    type: "safety",
    title: "Power Outage",
    location: "VV Puram",
    severity: "high",
    time: "50 min ago",
    status: "dispatched",
    reports: 8,
    sensors: 1,
    position: { lat: 12.9260, lng: 77.5900 },
  },
  {
    id: "INC-014",
    type: "traffic",
    title: "Illegal Parking",
    location: "Koramangala 5th Block",
    severity: "medium",
    time: "55 min ago",
    status: "verified",
    reports: 6,
    sensors: 0,
    position: { lat: 12.9345, lng: 77.6300 },
  },
  {
    id: "INC-015",
    type: "civic",
    title: "Stray Animals",
    location: "Banashankari",
    severity: "medium",
    time: "60 min ago",
    status: "pending",
    reports: 3,
    sensors: 0,
    position: { lat: 12.9255, lng: 77.5738 },
  },
  {
    id: "INC-016",
    type: "safety",
    title: "Fallen Tree",
    location: "JP Nagar",
    severity: "high",
    time: "65 min ago",
    status: "dispatched",
    reports: 10,
    sensors: 2,
    position: { lat: 12.9062, lng: 77.5856 },
  },
];

const heatmapData = [
  { area: "MG Road", incidents: 23, trend: "up", position: { lat: 12.9757, lng: 77.6067 } },
  { area: "Electronic City", incidents: 18, trend: "down", position: { lat: 12.8390, lng: 77.6770 } },
  { area: "Whitefield", incidents: 15, trend: "stable", position: { lat: 12.9698, lng: 77.7499 } },
  { area: "Koramangala", incidents: 12, trend: "up", position: { lat: 12.9352, lng: 77.6245 } },
  { area: "Indiranagar", incidents: 20, trend: "up", position: { lat: 12.9784, lng: 77.6408 } },
  { area: "Jayanagar", incidents: 10, trend: "down", position: { lat: 12.9308, lng: 77.5838 } },
  { area: "Malleshwaram", incidents: 14, trend: "stable", position: { lat: 13.0027, lng: 77.5704 } },
  { area: "Marathahalli", incidents: 17, trend: "up", position: { lat: 12.9592, lng: 77.6974 } },
  { area: "Hebbal", incidents: 19, trend: "up", position: { lat: 13.0359, lng: 77.5970 } },
  { area: "Cubbon Park", incidents: 8, trend: "down", position: { lat: 12.9756, lng: 77.5929 } },
  { area: "VV Puram", incidents: 13, trend: "stable", position: { lat: 12.9260, lng: 77.5900 } },
  { area: "Banashankari", incidents: 11, trend: "down", position: { lat: 12.9255, lng: 77.5738 } },
  { area: "JP Nagar", incidents: 16, trend: "up", position: { lat: 12.9062, lng: 77.5856 } },
  { area: "HSR Layout", incidents: 15, trend: "stable", position: { lat: 12.9116, lng: 77.6387 } },
  { area: "Outer Ring Road", incidents: 22, trend: "up", position: { lat: 12.9293, lng: 77.6848 } },
  { area: "Koramangala 5th Block", incidents: 9, trend: "down", position: { lat: 12.9345, lng: 77.6300 } },
];

const serviceVehicles = [
  {
    id: "SV-001",
    type: "police",
    location: "Near MG Road",
    status: "active",
    position: { lat: 12.9760, lng: 77.6050 },
  },
  {
    id: "SV-002",
    type: "ambulance",
    location: "Koramangala",
    status: "dispatched",
    position: { lat: 12.9340, lng: 77.6250 },
  },
  {
    id: "SV-003",
    type: "fire",
    location: "HSR Layout",
    status: "standby",
    position: { lat: 12.9120, lng: 77.6390 },
  },
  {
    id: "SV-004",
    type: "police",
    location: "Whitefield",
    status: "active",
    position: { lat: 12.9700, lng: 77.7480 },
  },
  {
    id: "SV-005",
    type: "ambulance",
    location: "Indiranagar",
    status: "dispatched",
    position: { lat: 12.9780, lng: 77.6410 },
  },
  {
    id: "SV-006",
    type: "fire",
    location: "Jayanagar",
    status: "standby",
    position: { lat: 12.9310, lng: 77.5840 },
  },
  {
    id: "SV-007",
    type: "police",
    location: "Electronic City",
    status: "active",
    position: { lat: 12.8400, lng: 77.6760 },
  },
  {
    id: "SV-008",
    type: "ambulance",
    location: "Malleshwaram",
    status: "dispatched",
    position: { lat: 13.0030, lng: 77.5710 },
  },
  {
    id: "SV-009",
    type: "fire",
    location: "Marathahalli",
    status: "standby",
    position: { lat: 12.9600, lng: 77.6980 },
  },
  {
    id: "SV-010",
    type: "police",
    location: "Hebbal",
    status: "active",
    position: { lat: 13.0360, lng: 77.5960 },
  },
  {
    id: "SV-011",
    type: "ambulance",
    location: "Cubbon Park",
    status: "dispatched",
    position: { lat: 12.9760, lng: 77.5930 },
  },
  {
    id: "SV-012",
    type: "fire",
    location: "VV Puram",
    status: "standby",
    position: { lat: 12.9270, lng: 77.5910 },
  },
];

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 12.9716,
  lng: 77.5946,
};

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
  { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#0e1626" }] },
];

const heatmapGradient = [
  "rgba(0, 255, 255, 0)",
  "rgba(0, 255, 255, 1)",
  "rgba(0, 191, 255, 1)",
  "rgba(0, 127, 255, 1)",
  "rgba(0, 63, 255, 1)",
  "rgba(0, 0, 255, 1)",
  "rgba(0, 0, 223, 1)",
  "rgba(0, 0, 191, 1)",
  "rgba(0, 0, 159, 1)",
  "rgba(0, 0, 127, 1)",
  "rgba(63, 0, 91, 1)",
  "rgba(127, 0, 63, 1)",
  "rgba(191, 0, 31, 1)",
  "rgba(255, 0, 0, 1)",
];

const legendData = {
  incidents: [
    { type: "high", label: "High Priority", color: "red", icon: AlertTriangle },
    { type: "medium", label: "Medium Priority", color: "yellow", icon: AlertTriangle },
  ],
  heatmap: [
    { type: "low", label: "Low Density", color: "blue", icon: Layers },
    { type: "high", label: "High Density", color: "red", icon: Layers },
  ],
  services: [
    { type: "service", label: "Service Units", color: "green", icon: Car },
  ],
};

export function CommandDashboard() {
  const [mapView, setMapView] = useState<"incidents" | "heatmap" | "services">("incidents");
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const { isLoaded } = useGoogleMaps();
  const { theme } = useTheme();
  const mapRef = useRef<google.maps.Map | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "text-green-600 bg-green-50 dark:bg-green-950/20";
      case "dispatched":
        return "text-blue-600 bg-blue-50 dark:bg-blue-950/20";
      case "pending":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-950/20";
    }
  };

  const handleVerifyIncident = (incidentId: string) => {
    console.log(`Verifying incident: ${incidentId}`);
  };

  const handleDispatchServices = (incidentId: string) => {
    console.log(`Dispatching services for: ${incidentId}`);
  };

  useEffect(() => {
    setIsFetching(true);
    const timer = setTimeout(() => {
      setIsFetching(false);
      console.log(`Fetched data for mapView: ${mapView}`);
    }, 1000);
    return () => clearTimeout(timer);
  }, [mapView]);

  const mapOptions = {
    disableDefaultUI: false,
    mapTypeId: "roadmap",
    styles: theme === "dark" ? darkMapStyle : [],
    zoomControl: true,
  };

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-950/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">23</div>
                <div className="text-sm text-muted-foreground">Active Incidents</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">156</div>
                <div className="text-sm text-muted-foreground">Citizen Reports</div>
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
                <div className="text-2xl font-bold">89</div>
                <div className="text-sm text-muted-foreground">Resolved Today</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950/20 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">12m</div>
                <div className="text-sm text-muted-foreground">Avg Response</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Command Map */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Live Command Map
              </CardTitle>
              <div className="flex items-center space-x-2">
                <ToggleGroup
                  type="single"
                  value={mapView}
                  onValueChange={(value) => value && setMapView(value as "incidents" | "heatmap" | "services")}
                >
                  <ToggleGroupItem
                    value="incidents"
                    size="sm"
                    className={mapView === "incidents" ? "bg-primary text-white" : ""}
                  >
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Incidents
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="heatmap"
                    size="sm"
                    className={mapView === "heatmap" ? "bg-primary text-white" : ""}
                  >
                    <Layers className="w-4 h-4 mr-1" />
                    Heatmap
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="services"
                    size="sm"
                    className={mapView === "services" ? "bg-primary text-white" : ""}
                  >
                    <Car className="w-4 h-4 mr-1" />
                    Services
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="relative w-full h-[400px]">
              {isLoaded ? (
                // loadError ? (
                //   <div className="h-full bg-muted/20 flex items-center justify-center text-center">
                //     Map Load Error: {loadError.message}
                //   </div>
                // ) : isFetching ? (
                //   <div className="h-full bg-muted/20 flex items-center justify-center">
                //     Fetching data...
                //   </div>
                // ) : (
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={12}
                    options={mapOptions}
                    onLoad={(map) => {
                      mapRef.current = map;
                      console.log(`Command Dashboard map loaded successfully: ${mapView}`);
                    }}
                  >
                    {mapView === "incidents" && (
                      <>
                        {liveIncidents.map((incident) => (
                          <Marker
                            key={incident.id}
                            position={incident.position}
                            icon={{
                              url: `http://maps.google.com/mapfiles/ms/icons/${incident.severity === "high" ? "red" : "yellow"}-dot.png`,
                              scaledSize: new google.maps.Size(40, 40),
                            }}
                            title={incident.title}
                            onClick={() => {
                              setSelectedIncident(incident.id);
                              if (mapRef.current) {
                                mapRef.current.panTo(incident.position);
                                console.log(`Panned to incident: ${incident.title}`);
                              }
                            }}
                          >
                            <div className="absolute -top-10 bg-background/90 px-2 py-1 rounded text-xs">
                              <Badge
                                variant="secondary"
                                className={`bg-${incident.severity === "high" ? "red" : "yellow"}-500 text-white text-xs font-medium`}
                              >
                                {incident.title}
                              </Badge>
                            </div>
                          </Marker>
                        ))}
                      </>
                    )}
                    {mapView === "heatmap" && (
                      <HeatmapLayer
                        data={heatmapData.map((area) => ({
                          location: new google.maps.LatLng(area.position.lat, area.position.lng),
                          weight: area.incidents,
                        }))}
                        options={{
                          gradient: heatmapGradient,
                          radius: 20,
                          opacity: 0.6,
                        }}
                      />
                    )}
                    {mapView === "services" && (
                      <>
                        {serviceVehicles.map((vehicle) => (
                          <Marker
                            key={vehicle.id}
                            position={vehicle.position}
                            icon={{
                              url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                              scaledSize: new google.maps.Size(40, 40),
                            }}
                            title={`${vehicle.type} - ${vehicle.location}`}
                            onClick={() => {
                              if (mapRef.current) {
                                mapRef.current.panTo(vehicle.position);
                                console.log(`Panned to service vehicle: ${vehicle.type}`);
                              }
                            }}
                          >
                            <div className="absolute -top-10 bg-background/90 px-2 py-1 rounded text-xs">
                              <Badge variant="secondary" className="bg-green-500 text-white text-xs font-medium">
                                {vehicle.type}
                              </Badge>
                            </div>
                          </Marker>
                        ))}
                      </>
                    )}
                    <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
                      <h4 className="text-xs font-semibold mb-2">Map Legend</h4>
                      <div className="space-y-1">
                        {legendData[mapView].map((item) => (
                          <div key={item.type} className="flex items-center space-x-2">
                            <item.icon className="w-4 h-4" style={{ color: item.color }} />
                            <span className="text-xs text-muted-foreground">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">
                          {mapView === "incidents" ? liveIncidents.length : mapView === "heatmap" ? heatmapData.length : serviceVehicles.length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {mapView === "incidents" ? "Live Incidents" : mapView === "heatmap" ? "Hotspots" : "Service Units"}
                        </div>
                      </div>
                    </div>
                  </GoogleMap>
                // )
              ) : (
                <div className="h-full bg-muted/20 flex items-center justify-center">
                  Loading Map...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Priority Queue
              </span>
              <Button size="sm" variant="outline">
                <Filter className="w-4 h-4 mr-1" />
                Filter
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              <div className="space-y-3 p-4">
                {liveIncidents.map((incident) => (
                  <Card
                    key={incident.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedIncident === incident.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => {
                      setSelectedIncident(incident.id);
                      if (mapView === "incidents" && mapRef.current) {
                        mapRef.current.panTo(incident.position);
                      }
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {incident.id}
                          </Badge>
                          <div className={`w-3 h-3 rounded-full ${getSeverityColor(incident.severity)}`}></div>
                        </div>

                        <h4 className="font-medium text-sm">{incident.title}</h4>
                        <p className="text-xs text-muted-foreground">{incident.location}</p>

                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{incident.time}</span>
                          </span>
                          <Badge className={`text-xs ${getStatusColor(incident.status)}`}>{incident.status}</Badge>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{incident.reports} reports</span>
                          <span>{incident.sensors} sensors</span>
                        </div>

                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs h-7 bg-transparent"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVerifyIncident(incident.id);
                            }}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 text-xs h-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDispatchServices(incident.id);
                            }}
                          >
                            <Navigation className="w-3 h-3 mr-1" />
                            Dispatch
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Area Heatmap Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {heatmapData.map((area, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{area.area}</h4>
                  <Badge
                    variant={area.trend === "up" ? "destructive" : area.trend === "down" ? "default" : "secondary"}
                  >
                    {area.trend}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-primary">{area.incidents}</div>
                <div className="text-sm text-muted-foreground">incidents today</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}