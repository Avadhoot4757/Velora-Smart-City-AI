"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { RouteSelection } from "@/components/route-selection";
import { RouteDetails } from "@/components/route-details";
import { NavigationView } from "@/components/navigation-view";
import { InsightsPanel } from "@/components/insights-panel";
import { ActionsPanel } from "@/components/actions-panel";
import { AnalyticsFooter } from "@/components/analytics-footer";
import { GoogleMap, Marker, TrafficLayer } from "@react-google-maps/api";
import { useGoogleMaps } from "@/components/GoogleMapsProvider";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Music, Thermometer, Users, Car, Volume2 } from "lucide-react";
import { useGeolocation } from "@/hooks/use-geolocation";

type DashboardView = "default" | "routes" | "details" | "navigation";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 12.9716, // Bengaluru center
  lng: 77.5946,
};

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
  { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#0e1626" }] },
];

const baseCityData = [
  // Traffic
  {
    id: "traffic_silk_board",
    type: "traffic",
    position: { lat: 12.9171, lng: 77.6220 },
    label: "Traffic: Heavy",
    color: "red",
    iconUrl: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
  },
  {
    id: "traffic_marathahalli",
    type: "traffic",
    position: { lat: 12.9592, lng: 77.6974 },
    label: "Traffic: Moderate",
    color: "yellow",
    iconUrl: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  },
  {
    id: "traffic_hebbal",
    type: "traffic",
    position: { lat: 13.0359, lng: 77.5970 },
    label: "Traffic: Heavy",
    color: "red",
    iconUrl: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
  },
  // Noise
  {
    id: "noise_koramangala",
    type: "noise",
    position: { lat: 12.9352, lng: 77.6245 },
    label: "Noise: Low (30 dB)",
    color: "green",
    iconUrl: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
  },
  {
    id: "noise_indiranagar",
    type: "noise",
    position: { lat: 12.9784, lng: 77.6408 },
    label: "Noise: Moderate (50 dB)",
    color: "yellow",
    iconUrl: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  },
  {
    id: "noise_whitefield",
    type: "noise",
    position: { lat: 12.9698, lng: 77.7499 },
    label: "Noise: High (70 dB)",
    color: "red",
    iconUrl: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
  },
  // Pollution
  {
    id: "pollution_mg_road",
    type: "pollution",
    position: { lat: 12.9757, lng: 77.6067 },
    label: "AQI: 120 (Moderate)",
    color: "yellow",
    iconUrl: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  },
  {
    id: "pollution_electronic_city",
    type: "pollution",
    position: { lat: 12.8390, lng: 77.6770 },
    label: "AQI: 150 (Unhealthy)",
    color: "red",
    iconUrl: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
  },
  {
    id: "pollution_jayanagar",
    type: "pollution",
    position: { lat: 12.9308, lng: 77.5838 },
    label: "AQI: 80 (Good)",
    color: "green",
    iconUrl: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
  },
  // Mood
  {
    id: "mood_cubbon_park",
    type: "mood",
    position: { lat: 12.9756, lng: 77.5929 },
    label: "Mood: Positive 😊",
    color: "blue",
    iconUrl: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  },
  {
    id: "mood_indiranagar",
    type: "mood",
    position: { lat: 12.9784, lng: 77.6408 },
    label: "Mood: Neutral 😐",
    color: "gray",
    iconUrl: "http://maps.google.com/mapfiles/ms/icons/grey-dot.png",
  },
  {
    id: "mood_malleshwaram",
    type: "mood",
    position: { lat: 13.0027, lng: 77.5704 },
    label: "Mood: Happy 😄",
    color: "blue",
    iconUrl: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  },
  // Events
  {
    id: "event_tech_meetup",
    type: "event",
    position: { lat: 12.9345, lng: 77.6300 },
    label: "Tech Meetup at Startup Hub",
    color: "purple",
    iconUrl: "http://maps.google.com/mapfiles/ms/icons/purple-dot.png",
  },
  {
    id: "event_cubbon_festival",
    type: "event",
    position: { lat: 12.9756, lng: 77.5929 },
    label: "Cultural Festival at Cubbon Park",
    color: "purple",
    iconUrl: "http://maps.google.com/mapfiles/ms/icons/purple-dot.png",
  },
  {
    id: "event_food_festival",
    type: "event",
    position: { lat: 12.9260, lng: 77.5900 },
    label: "Food Festival at VV Puram",
    color: "purple",
    iconUrl: "http://maps.google.com/mapfiles/ms/icons/purple-dot.png",
  },
  {
    id: "event_concert_whitefield",
    type: "event",
    position: { lat: 12.9698, lng: 77.7499 },
    label: "Concert at Whitefield",
    color: "purple",
    iconUrl: "http://maps.google.com/mapfiles/ms/icons/purple-dot.png",
  },
];

const legendData = [
  { type: "traffic", label: "Traffic", color: "red", icon: Car },
  { type: "noise", label: "Noise", color: "green", icon: Volume2 },
  { type: "pollution", label: "Pollution", color: "yellow", icon: Thermometer },
  { type: "mood", label: "Mood", color: "blue", icon: Users },
  { type: "event", label: "Event", color: "purple", icon: Calendar },
];

export default function Dashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const { isLoaded } = useGoogleMaps();
  const mapRef = useRef<google.maps.Map | null>(null);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<DashboardView>("default");
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [destination, setDestination] = useState("");
  const [cityDataWithIcons, setCityDataWithIcons] = useState<any[]>([]);
  
  // Get user's current location
  const { latitude, longitude, address, isLoading: locationLoading, error: locationError } = useGeolocation();

  useEffect(() => {
    if (isLoaded && window.google) {
      setCityDataWithIcons(
        baseCityData.map((data) => ({
          ...data,
          icon: {
            url: data.iconUrl,
            scaledSize: new window.google.maps.Size(40, 40),
          },
        }))
      );
    }
  }, [isLoaded]);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      // If the query contains any destination-like terms, show routes
      if (
        q.toLowerCase().includes("route") ||
        q.toLowerCase().includes("go to") ||
        q.toLowerCase().includes("navigate") ||
        q.toLowerCase().includes("whitefield") ||
        q.toLowerCase().includes("mg road") ||
        q.toLowerCase().includes("electronic city") ||
        q.toLowerCase().includes("koramangala") ||
        q.toLowerCase().includes("indiranagar") ||
        q.toLowerCase().includes("jayanagar") ||
        q.toLowerCase().includes("malleshwaram") ||
        q.toLowerCase().includes("hebbal") ||
        q.toLowerCase().includes("marathahalli") ||
        q.toLowerCase().includes("silk board") ||
        q.toLowerCase().includes("airport") ||
        q.toLowerCase().includes("station") ||
        q.toLowerCase().includes("mall") ||
        q.toLowerCase().includes("hospital") ||
        q.toLowerCase().includes("school") ||
        q.toLowerCase().includes("office") ||
        q.toLowerCase().includes("work") ||
        q.toLowerCase().includes("home")
      ) {
        setDestination(extractDestination(q));
        setView("routes");
      } else {
        setView("default");
      }
    }
  }, [searchParams]);

  const extractDestination = (query: string) => {
    const queryLower = query.toLowerCase();
    
    // Specific locations
    if (queryLower.includes("whitefield")) return "Whitefield";
    if (queryLower.includes("mg road")) return "MG Road";
    if (queryLower.includes("electronic city")) return "Electronic City";
    if (queryLower.includes("koramangala")) return "Koramangala";
    if (queryLower.includes("indiranagar")) return "Indiranagar";
    if (queryLower.includes("jayanagar")) return "Jayanagar";
    if (queryLower.includes("malleshwaram")) return "Malleshwaram";
    if (queryLower.includes("hebbal")) return "Hebbal";
    if (queryLower.includes("marathahalli")) return "Marathahalli";
    if (queryLower.includes("silk board")) return "Silk Board";
    
    // Generic destinations
    if (queryLower.includes("airport")) return "Kempegowda International Airport";
    if (queryLower.includes("station")) return "Bengaluru Railway Station";
    if (queryLower.includes("mall")) return "Phoenix MarketCity";
    if (queryLower.includes("hospital")) return "Apollo Hospital";
    if (queryLower.includes("school")) return "School";
    if (queryLower.includes("office") || queryLower.includes("work")) return "Office";
    if (queryLower.includes("home")) return "Home";
    
    // If it's a general navigation request, use the query as destination
    if (queryLower.includes("go to") || queryLower.includes("navigate") || queryLower.includes("route")) {
      // Extract the destination from phrases like "go to [destination]"
      const goToMatch = query.match(/(?:go to|navigate to|route to)\s+(.+)/i);
      if (goToMatch) {
        return goToMatch[1];
      }
    }
    
    // Default: use the query as destination
    return query;
  };

  const handleRouteSelect = (route: any) => {
    setSelectedRoute(route);
    setView("details");
  };

  const handleStartNavigation = () => {
    console.log("Starting navigation with route:", selectedRoute);
    console.log("Destination:", destination);
    console.log("Current location:", getCurrentLocation());
    setView("navigation");
  };

  const handleBackToRoutes = () => {
    setView("routes");
    setSelectedRoute(null);
  };

  const handleBackToDefault = () => {
    setView("default");
    setQuery("");
    setDestination("");
    setSelectedRoute(null);
    router.push("/dashboard");
  };

  const mapOptions = {
    disableDefaultUI: false,
    mapTypeId: "roadmap",
    styles: theme === "dark" ? darkMapStyle : [],
  };

  // Get current location string for route planning
  const getCurrentLocation = () => {
    if (locationLoading) {
      return "Getting location...";
    } else if (locationError) {
      return "Location unavailable";
    } else if (address) {
      return address;
    } else if (latitude && longitude) {
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } else {
      // Fallback to Koramangala if location is not available
      return "Koramangala, Bengaluru";
    }
  };

  // Show loading state while getting location
  if (locationLoading && view === "routes") {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader onBack={handleBackToDefault} currentLocation="Getting location..." />
        <div className="flex h-[calc(100vh-80px)] items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Getting your current location...</p>
            <p className="text-sm text-muted-foreground">Please allow location access for accurate route planning</p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background">
      {view !== "navigation" && <DashboardHeader onBack={view !== "default" ? handleBackToDefault : undefined} currentLocation={getCurrentLocation()} />}

      {view === "navigation" ? (
        <NavigationView 
          route={selectedRoute} 
          currentLocation={getCurrentLocation()} 
          destination={destination}
          onBack={handleBackToRoutes} 
        />
      ) : (
        <div className="flex h-[calc(100vh-80px)]">
          {/* Left Sidebar - Insights */}
          <div className="w-80 border-r bg-card">
            <InsightsPanel query={query} />
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {view === "default" && (
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-base">
                    <Users className="w-4 h-4 mr-2" />
                    Bengaluru City Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 h-[calc(100%-4rem)]">
                  <div className="relative w-full h-full" style={{ minHeight: "500px" }}>
                    {isLoaded ? (
                      <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={center}
                        zoom={12}
                        options={mapOptions}
                        onLoad={(map) => {
                          mapRef.current = map;
                          console.log("City Overview map loaded successfully");
                        }}
                      >
                        <TrafficLayer />
                        {cityDataWithIcons.map((data) => (
                          <Marker
                            key={data.id}
                            position={data.position}
                            icon={data.icon}
                            title={data.label}
                            onClick={() => {
                              if (mapRef.current) {
                                mapRef.current.panTo(data.position);
                                console.log(`Panned to marker: ${data.label}`);
                              }
                            }}
                          >
                            <div className="absolute -top-10 bg-background/90 px-2 py-1 rounded text-xs">
                              <Badge variant="secondary" className={`bg-${data.color}-500 text-white text-xs font-medium`}>
                                {data.label}
                              </Badge>
                            </div>
                          </Marker>
                        ))}
                        {/* Legend */}
                        <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
                          <h4 className="text-xs font-semibold mb-2">Map Legend</h4>
                          <div className="space-y-1">
                            {legendData.map((item) => (
                              <div key={item.type} className="flex items-center space-x-2">
                                <item.icon className="w-4 h-4" style={{ color: item.color }} />
                                <span className="text-xs text-muted-foreground">{item.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </GoogleMap>
                    ) : (
                      <div className="h-full bg-muted/20 flex items-center justify-center">
                        Loading Map...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {view === "routes" && (
              <RouteSelection
                destination={destination}
                currentLocation={getCurrentLocation()}
                onRouteSelect={handleRouteSelect}
              />
            )}

            {view === "details" && selectedRoute && (
              <RouteDetails
                route={selectedRoute}
                destination={destination}
                currentLocation={getCurrentLocation()}
                onStartNavigation={handleStartNavigation}
                onBack={handleBackToRoutes}
              />
            )}
          </div>

          {/* Right Sidebar - Actions */}
          {view === "default" && (
            <div className="w-80 border-l bg-card">
              <ActionsPanel />
            </div>
          )}
        </div>
      )}

      {view === "default" && <AnalyticsFooter />}
    </div>
  );
}
