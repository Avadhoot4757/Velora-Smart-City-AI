// components/navigation-view.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Navigation,
  Volume2,
  VolumeX,
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  Fuel,
  AlertTriangle,
} from "lucide-react";
import { GoogleMap, DirectionsRenderer } from "@react-google-maps/api";
import { useTheme } from "next-themes";
import { useGoogleMaps } from "@/components/GoogleMapsProvider"; // Import the renamed utility

interface NavigationViewProps {
  route: any;
  onBack: () => void;
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

export function NavigationView({ route, onBack }: NavigationViewProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [eta, setEta] = useState(route.duration);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const { theme } = useTheme();
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useGoogleMaps(); // Use the singleton utility

  const navigationSteps = [
    "Head southeast on Koramangala Ring Road",
    "Turn right onto Outer Ring Road",
    "Continue straight for 8.2 km",
    "Take exit toward MG Road",
    "Turn left at the traffic signal",
    "Destination will be on your right",
  ];

  useEffect(() => {
    // Simulate navigation progress
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % navigationSteps.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: "Koramangala, Bengaluru",
          destination: "MG Road, Bengaluru",
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirections(result);
            // Update ETA based on Google Maps response
            const duration = result.routes[0].legs[0].duration?.text;
            if (duration) setEta(duration);
          }
        }
      );
    }
  }, [isLoaded]);

  const mapOptions = {
    disableDefaultUI: true,
    mapTypeId: "roadmap",
    styles: theme === "dark" ? darkMapStyle : [],
  };

  return (
    <div className="h-[calc(100vh-80px)] bg-background flex flex-col">
      {/* Navigation Header */}
      <div className="bg-card border-b p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit Navigation
          </Button>

          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-base font-bold text-primary">{eta}</div>
              <div className="text-xs text-muted-foreground">ETA</div>
            </div>
            <div className="text-center">
              <div className="text-base font-bold">{route.distance}</div>
              <div className="text-xs text-muted-foreground">Distance</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MessageSquare className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Navigation View */}
      <div className="flex-1 relative">
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
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        ) : (
          <div className="h-full bg-muted/20 flex items-center justify-center">
            {"Loading Map..."}
          </div>
        )}

        {/* Navigation Instructions Overlay */}
        <Card className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm">
          <div className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Navigation className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">{navigationSteps[currentStep]}</h3>
                <p className="text-xs text-muted-foreground">
                  Step {currentStep + 1} of {navigationSteps.length} • Continue for 2.3 km
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary">2.3 km</div>
                <div className="text-xs text-muted-foreground">Next turn</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Live Alerts */}
        <Card className="absolute top-4 left-4 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200">
          <div className="p-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <div>
                <h4 className="font-medium text-sm">Traffic Alert</h4>
                <p className="text-xs text-muted-foreground">Heavy traffic ahead. Adding 5 minutes to ETA.</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="absolute top-4 right-4 space-y-2">
          <Card className="bg-background/90 backdrop-blur-sm">
            <div className="p-2 text-center">
              <Clock className="w-4 h-4 mx-auto mb-1 text-primary" />
              <div className="text-xs font-bold">{eta}</div>
              <div className="text-xs text-muted-foreground">ETA</div>
            </div>
          </Card>
          <Card className="bg-background/90 backdrop-blur-sm">
            <div className="p-2 text-center">
              <Fuel className="w-4 h-4 mx-auto mb-1 text-green-600" />
              <div className="text-xs font-bold">₹85</div>
              <div className="text-xs text-muted-foreground">Fuel</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}