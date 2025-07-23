// components/route-selection.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Route, Heart, Shield, Leaf, ParkingCircle } from "lucide-react";
import { GoogleMap, DirectionsRenderer } from "@react-google-maps/api";
import { useTheme } from "next-themes";
import { useGoogleMaps } from "@/components/GoogleMapsProvider"; // Import the context hook

interface RouteSelectionProps {
  destination: string;
  currentLocation: string;
  onRouteSelect: (route: any) => void;
}

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 12.9352, // Approximate center for Koramangala
  lng: 77.6245,
};

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
  { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#0e1626" }] },
];

export function RouteSelection({ destination, currentLocation, onRouteSelect }: RouteSelectionProps) {
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult[]>([]);
  const { theme } = useTheme();
  const mapRef = useRef<google.maps.Map | null>(null);
  const { isLoaded } = useGoogleMaps(); // Use the context hook

  const routes = [
    {
      id: 1,
      name: "Fastest Route",
      duration: "28 min",
      distance: "12.5 km",
      traffic: "Medium",
      description: "Shortest path via ORR",
      highlights: ["Fastest arrival", "Moderate traffic"],
      color: "from-blue-500 to-blue-600",
      strokeColor: "#3b82f6",
      icon: Route,
      analytics: {
        time: "28 min",
        traffic: "Medium congestion",
        fuel: "₹85 estimated",
        tolls: "₹45",
      },
      waypoints: [{ location: "Outer Ring Road, Bengaluru", stopover: false }],
    },
    {
      id: 2,
      name: "Heart-Friendly Route",
      duration: "35 min",
      distance: "14.2 km",
      traffic: "Low",
      description: "Less noisy, cleaner air quality",
      highlights: ["Low noise levels", "Better air quality", "Peaceful drive"],
      color: "from-green-500 to-green-600",
      strokeColor: "#10b981",
      icon: Heart,
      analytics: {
        time: "35 min",
        noise: "15dB lower",
        airQuality: "25% cleaner",
        stress: "Low stress route",
      },
      waypoints: [{ location: "Hosur Road, Bengaluru", stopover: false }],
    },
    {
      id: 3,
      name: "Safe Route",
      duration: "32 min",
      distance: "13.8 km",
      traffic: "Medium",
      description: "Well-lit, crowded areas, safe for families",
      highlights: ["Well-lit roads", "High foot traffic", "CCTV coverage"],
      color: "from-purple-500 to-purple-600",
      strokeColor: "#8b5cf6",
      icon: Shield,
      analytics: {
        time: "32 min",
        safety: "95% safe zones",
        lighting: "Well-lit path",
        crowd: "High visibility",
      },
      waypoints: [{ location: "Intermediate Ring Road, Bengaluru", stopover: false }],
    },
    {
      id: 4,
      name: "Eco Route",
      duration: "40 min",
      distance: "15.1 km",
      traffic: "Low",
      description: "Least polluted, tree-lined roads",
      highlights: ["Low pollution", "Green corridors", "Fresh air"],
      color: "from-emerald-500 to-emerald-600",
      strokeColor: "#059669",
      icon: Leaf,
      analytics: {
        time: "40 min",
        pollution: "40% less CO2",
        greenery: "Tree-lined roads",
        carbon: "Eco-friendly",
      },
      waypoints: [{ location: "100 Feet Road, Koramangala, Bengaluru", stopover: false }],
    },
  ];

  useEffect(() => {
    if (isLoaded) {
      const directionsService = new google.maps.DirectionsService();
      const routePromises = routes.map((route, index) =>
        new Promise<{ route: typeof routes[0]; result: google.maps.DirectionsResult; index: number } | null>((resolve) => {
          directionsService.route(
            {
              origin: "Koramangala, Bengaluru",
              destination: "MG Road, Bengaluru",
              travelMode: google.maps.TravelMode.DRIVING,
              provideRouteAlternatives: true,
              waypoints: route.waypoints,
              optimizeWaypoints: false,
            },
            (result, status) => {
              if (status === google.maps.DirectionsStatus.OK && result) {
                resolve({ route, result, index });
              } else {
                resolve(null);
              }
            }
          );
        })
      );

      Promise.all(routePromises).then((results) => {
        const validResults = results.filter((r): r is { route: typeof routes[0]; result: google.maps.DirectionsResult; index: number } => r !== null);
        const updatedDirections = validResults.map(({ result }) => result).slice(0, 4);
        setDirections(updatedDirections);

        // Update route data with Google Maps results
        validResults.forEach(({ route, result }, i) => {
          if (result.routes[0]) {
            route.duration = result.routes[0].legs[0].duration?.text || route.duration;
            route.distance = result.routes[0].legs[0].distance?.text || route.distance;
            route.analytics.time = route.duration;
          }
        });

        // Ensure map zooms to fit all routes
        if (mapRef.current && validResults.length > 0) {
          const bounds = new google.maps.LatLngBounds();
          validResults.forEach(({ result }) => {
            result.routes[0].legs[0].steps.forEach((step) => {
              bounds.extend(step.start_location);
              bounds.extend(step.end_location);
            });
          });
          mapRef.current.fitBounds(bounds);
        }
      });
    }
  }, [isLoaded]);

  const mapOptions = {
    disableDefaultUI: true,
    mapTypeId: "roadmap",
    styles: theme === "dark" ? darkMapStyle : [],
  };

  return (
    <div className="flex-1 p-6 space-y-6 h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Routes to {destination}</h2>
        <div className="flex items-center justify-center space-x-2 text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">From {currentLocation}</span>
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-3 gap-6">
        {/* Mini Map */}
        <Card className="lg:col-span-2 h-[200px]">
          <CardContent className="p-0 h-full">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={13}
                options={mapOptions}
                onLoad={(map) => {
                  mapRef.current = map;
                }}
              >
                {directions.map((direction, index) => (
                  <DirectionsRenderer
                    key={index}
                    directions={direction}
                    options={{
                      polylineOptions: {
                        strokeColor: routes[index].strokeColor,
                        strokeWeight: 3,
                        strokeOpacity: 0.8,
                      },
                      suppressMarkers: false,
                    }}
                  />
                ))}
              </GoogleMap>
            ) : (
              <div className="h-full bg-muted/20 flex items-center justify-center">
                {"Loading Map..."}
              </div>
            )}
            {/* Legend */}
            {/* <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm p-2 rounded-lg space-y-1">
              {routes.map((route) => (
                <div key={route.id} className="flex items-center space-x-2 text-xs">
                  <div className={`w-3 h-0.5 bg-${route.color.split(" ")[0].replace("from-", "")}`}></div>
                  <span>{route.name}</span>
                </div>
              ))}
            </div> */}
          </CardContent>
        </Card>

        {/* Parking Options */}
        <Card className="h-[200px]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-base">
              <ParkingCircle className="w-4 h-4 mr-2" />
              Parking Near {destination}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2 text-xs">
              <div className="p-2 border rounded">
                <h4 className="font-medium text-xs">Phoenix MarketCity</h4>
                <div className="space-y-1 mt-1 text-muted-foreground">
                  <div>200m from destination</div>
                  <div className="flex justify-between">
                    <span>₹20/hour</span>
                    <span className="text-green-600">85% available</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Mall Parking
                  </Badge>
                </div>
              </div>
              <div className="p-2 border rounded">
                <h4 className="font-medium text-xs">Street Parking</h4>
                <div className="space-y-1 mt-1 text-muted-foreground">
                  <div>50m from destination</div>
                  <div className="flex justify-between">
                    <span>₹10/hour</span>
                    <span className="text-yellow-600">Limited</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Roadside
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Route Options */}
        <div className="lg:col-span-2 grid lg:grid-cols-2 gap-4">
          {routes.map((route) => {
            const IconComponent = route.icon;
            return (
              <Card
                key={route.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedRouteId === route.id ? "ring-2 ring-primary shadow-lg" : ""
                }`}
                onClick={() => setSelectedRouteId(route.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center">
                      <div
                        className={`w-8 h-8 bg-gradient-to-r ${route.color} rounded-lg flex items-center justify-center mr-2`}
                      >
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      {route.name}
                    </CardTitle>
                    <div className="text-right">
                      <div className="font-bold text-base">{route.duration}</div>
                      <div className="text-xs text-muted-foreground">{route.distance}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-muted-foreground">{route.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {route.highlights.map((highlight: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    className={`w-full text-sm ${
                      selectedRouteId === route.id ? `bg-gradient-to-r ${route.color} text-white` : ""
                    }`}
                    variant={selectedRouteId === route.id ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRouteSelect({ ...route, directions: directions[route.id - 1] });
                    }}
                  >
                    {selectedRouteId === route.id ? "Selected - View Details" : "Choose This Route"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}