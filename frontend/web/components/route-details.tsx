// components/route-details.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, AlertTriangle, Cloud, Shield, Navigation, ArrowLeft, Zap } from "lucide-react";
import { GoogleMap, DirectionsRenderer } from "@react-google-maps/api";
import { useTheme } from "next-themes";
import { useGoogleMaps } from "@/components/GoogleMapsProvider";

interface RouteDetailsProps {
  route: any;
  destination: string;
  onStartNavigation: () => void;
  onBack: () => void;
}

const routeAlerts = [
  {
    type: "weather",
    title: "Heavy Rain Expected",
    message: "Moderate to heavy rainfall expected in 15 minutes on your route",
    time: "In 15 min",
    severity: "medium",
    icon: Cloud,
  },
  {
    type: "traffic",
    title: "MLA Convoy",
    message: "Official convoy passing through Silk Board junction at 3:30 PM",
    time: "In 45 min",
    severity: "high",
    icon: Shield,
  },
];

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 12.9352, // Koramangala
  lng: 77.6245,
};

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
  { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#0e1626" }] },
];

export function RouteDetails({ route, destination, onStartNavigation, onBack }: RouteDetailsProps) {
  const { theme } = useTheme();
  const mapRef = useRef<google.maps.Map | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingDirections, setIsFetchingDirections] = useState(false);
  const { isLoaded } = useGoogleMaps();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-500 bg-red-50 dark:bg-red-950/20";
      case "medium":
        return "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20";
      default:
        return "text-blue-500 bg-blue-50 dark:bg-blue-950/20";
    }
  };

  const mapOptions = {
    disableDefaultUI: false, // Changed from true to false for debugging
    mapTypeId: "roadmap" as google.maps.MapTypeId,
    styles: theme === "dark" ? darkMapStyle : [],
    zoomControl: true,
    streetViewControl: false,
    fullscreenControl: false,
  };

  useEffect(() => {
    console.log("RouteDetails useEffect triggered", { isLoaded, route });
    
    if (!isLoaded) {
      console.log("Google Maps API not loaded yet");
      return;
    }

    // Add validation for route object
    if (!route) {
      console.error("No route object provided");
      setError("No route data available");
      return;
    }

    // Use route.directions if valid, otherwise fetch new directions
    if (route.directions && route.directions.routes?.[0]?.legs?.length) {
      console.log("Using provided route.directions:", route.directions);
      setDirections(route.directions);
      setError(null);
      setIsFetchingDirections(false);
      return;
    }

    setIsFetchingDirections(true);
    setError(null);
    console.log("Fetching directions for route:", route.name);
    
    // Add timeout for debugging
    const timeoutId = setTimeout(() => {
      console.error("Directions request timed out");
      setIsFetchingDirections(false);
      setError("Request timed out");
    }, 10000);

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: { query: "Koramangala, Bengaluru" }, // Use query for better geocoding
        destination: { query: "MG Road, Bengaluru" },
        travelMode: google.maps.TravelMode.DRIVING,
        waypoints: route.waypoints || [],
        optimizeWaypoints: false,
      },
      (result, status) => {
        clearTimeout(timeoutId);
        setIsFetchingDirections(false);
        console.log("Directions service response:", { status, result });
        
        if (status === google.maps.DirectionsStatus.OK && result) {
          console.log("Directions fetched successfully:", result);
          setDirections(result);
          setError(null);
        } else {
          console.error("Directions API error:", status, result);
          setError(`Failed to fetch directions: ${status}`);
        }
      }
    );
  }, [isLoaded, route]);

  useEffect(() => {
    if (isLoaded && mapRef.current && directions?.routes?.[0]?.legs) {
      console.log("Setting map bounds for directions:", directions);
      try {
        const bounds = new google.maps.LatLngBounds();
        directions.routes[0].legs.forEach((leg: any) => {
          leg.steps.forEach((step: any) => {
            bounds.extend(step.start_location);
            bounds.extend(step.end_location);
          });
        });
        mapRef.current.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
      } catch (error) {
        console.error("Error setting bounds:", error);
      }
    } else if (isLoaded && mapRef.current) {
      // Fallback to default center and zoom if no directions
      console.log("No valid directions, using default center and zoom");
      mapRef.current.setCenter(center);
      mapRef.current.setZoom(13);
    }
  }, [isLoaded, directions]);

  // Add loading state check
  if (!isLoaded) {
    return (
      <div className="flex-1 p-6 space-y-4 h-[calc(100vh-80px)] flex flex-col">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading Google Maps...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-4 h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Routes
          </Button>
          <div>
            <h2 className="text-xl font-bold">{route?.name || "Route"}</h2>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">To {destination}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-primary">{route?.duration || "N/A"}</div>
          <div className="text-sm text-muted-foreground">{route?.distance || "N/A"}</div>
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-3 gap-4">
        {/* Route Map */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-base">
              <Navigation className="w-4 h-4 mr-2" />
              Route Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div
              className="relative w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
              style={{ height: "400px" }} // Fixed height instead of 100%
            >
              {isFetchingDirections ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Fetching route...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="h-full flex items-center justify-center text-center p-4">
                  <div>
                    <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Error: {error}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => window.location.reload()}
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              ) : (
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={center}
                  zoom={13}
                  options={mapOptions}
                  onLoad={(map) => {
                    mapRef.current = map;
                    console.log("Map loaded successfully", map);
                  }}
                >
                  {directions && (
                    <DirectionsRenderer
                      directions={directions}
                      options={{
                        polylineOptions: {
                          strokeColor: "#3B82F6", // Default blue color
                          strokeWeight: 4,
                          strokeOpacity: 0.8,
                        },
                        suppressMarkers: false,
                      }}
                    />
                  )}
                </GoogleMap>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Route Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-base">
              <Zap className="w-4 h-4 mr-2" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {route?.analytics && Object.entries(route.analytics).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground capitalize">{key}</span>
                <span className="font-medium">{String(value)}</span>
              </div>
            ))}
            <div className="pt-2 border-t">
              <div className="flex flex-wrap gap-1">
                {route?.highlights?.map((highlight: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {highlight}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Route Alerts */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-base">
              <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
              Route Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {routeAlerts.map((alert, index) => (
                <div key={index} className={`p-3 rounded border ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-start space-x-2">
                    <div className="p-1 rounded-full bg-background">
                      <alert.icon className="w-3 h-3" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-xs">{alert.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {alert.time}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Start Navigation Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={onStartNavigation}
          className={`bg-gradient-to-r ${route?.color || 'from-blue-500 to-blue-600'} text-white px-8 py-2 text-base font-semibold hover:shadow-lg transition-all duration-300`}
        >
          <Navigation className="w-4 h-4 mr-2" />
          Start Navigation
        </Button>
      </div>
    </div>
  );
}