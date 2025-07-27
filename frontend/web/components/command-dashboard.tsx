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

const serviceVehicles = [
  { id: "SV-001", type: "police", location: "Near MG Road", status: "active", position: { lat: 12.9760, lng: 77.6050 } },
  { id: "SV-002", type: "ambulance", location: "Koramangala", status: "dispatched", position: { lat: 12.9340, lng: 77.6250 } },
  { id: "SV-003", type: "fire", location: "HSR Layout", status: "standby", position: { lat: 12.9120, lng: 77.6390 } },
  { id: "SV-004", type: "police", location: "Whitefield", status: "active", position: { lat: 12.9700, lng: 77.7480 } },
  { id: "SV-005", type: "ambulance", location: "Indiranagar", status: "dispatched", position: { lat: 12.9780, lng: 77.6410 } },
  { id: "SV-006", type: "fire", location: "Jayanagar", status: "standby", position: { lat: 12.9310, lng: 77.5840 } },
  { id: "SV-007", type: "police", location: "Electronic City", status: "active", position: { lat: 12.8400, lng: 77.6760 } },
  { id: "SV-008", type: "ambulance", location: "Malleshwaram", status: "dispatched", position: { lat: 13.0030, lng: 77.5710 } },
  { id: "SV-009", type: "fire", location: "Marathahalli", status: "standby", position: { lat: 12.9600, lng: 77.6980 } },
  { id: "SV-010", type: "police", location: "Hebbal", status: "active", position: { lat: 13.0360, lng: 77.5960 } },
  { id: "SV-011", type: "ambulance", location: "Cubbon Park", status: "dispatched", position: { lat: 12.9760, lng: 77.5930 } },
  { id: "SV-012", type: "fire", location: "VV Puram", status: "standby", position: { lat: 12.9270, lng: 77.5910 } },
];

export function CommandDashboard() {
  const [mapView, setMapView] = useState<"incidents" | "heatmap" | "services">("incidents");
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [liveIncidents, setLiveIncidents] = useState([]);
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

  // Fetch live incidents from the API
  const fetchIncidents = async () => {
    setIsFetching(true);
    try {
      const response = await fetch("https://asia-south1-velora-demo.cloudfunctions.net/get_all_reports"); // Placeholder URL
      const data = await response.json();
      if (data.status === "success") {
        const incidents = data.reports.map((report: any) => ({
          id: report.id,
          type: report.reportType || "unknown",
          title: report.description || "No description",
          location: report.geoLocation?.join(", ") || "Unknown location",
          severity: report.severityScore > 50 ? "high" : report.severityScore > 30 ? "medium" : "low",
          time: timeAgo(new Date(report.timestamp)),
          status: report.status || "pending",
          reports: 1, // Assuming 1 report per document for now
          sensors: 0, // Placeholder, adjust if sensor data is available
          position: {
            lat: report.geoLocation ? parseFloat(report.geoLocation[0]) : center.lat,
            lng: report.geoLocation ? parseFloat(report.geoLocation[1]) : center.lng,
          },
          mediaUrl: report.mediaUrl || null,
        }));
        setLiveIncidents(incidents);
      }
    } catch (error) {
      console.error("Failed to fetch incidents:", error);
    } finally {
      setIsFetching(false);
    }
  };

  // Polling every 30 seconds
  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 30000);
    return () => clearInterval(interval);
  }, []);

  // Helper function to calculate time ago
  const timeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    return `${diffMin} min ago`;
  };

  const mapOptions = {
    disableDefaultUI: false,
    mapTypeId: "roadmap",
    styles: theme === "dark" ? darkMapStyle : [],
    zoomControl: true,
  };

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Stats Overview (Static for now, can be updated with real data later) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-950/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{liveIncidents.length}</div>
                <div className="text-sm text-muted-foreground">Active Incidents</div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Add other stats cards similarly */}
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
                isFetching ? (
                  <div className="h-full bg-muted/20 flex items-center justify-center">
                    Fetching data...
                  </div>
                ) : (
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
                              url: `http://maps.google.com/mapfiles/ms/icons/${incident.severity === "high" ? "red" : incident.severity === "medium" ? "yellow" : "blue"}-dot.png`,
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
                            {incident.mediaUrl && (
                              <div
                                className="absolute -top-16 bg-background/90 px-2 py-1 rounded text-xs"
                                style={{ display: "none" }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.display = "block";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              >
                                <img src={incident.mediaUrl} alt="Incident Media" width="100" />
                              </div>
                            )}
                            <div className="absolute -top-10 bg-background/90 px-2 py-1 rounded text-xs">
                              <Badge
                                variant="secondary"
                                className={`bg-${incident.severity === "high" ? "red" : incident.severity === "medium" ? "yellow" : "blue"}-500 text-white text-xs font-medium`}
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
                )
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
