// components/map-section.tsx
"use client";

import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { useGoogleMaps } from "@/components/GoogleMapsProvider"; // Import the singleton loader

interface MapSectionProps {
  query: string;
}

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 12.9716,
  lng: 77.5946,
};

const minimalMapStyle = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.neighborhood", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels", stylers: [{ visibility: "on" }, { color: "#333333" }, { weight: 0.8 }] },
  { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ visibility: "simplified" }, { lightness: 20 }] },
  { featureType: "all", elementType: "geometry", stylers: [{ color: "#1d2c4d" }], applyTo: ["dark"] },
  { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }], applyTo: ["dark"] },
  { featureType: "all", elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }], applyTo: ["dark"] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }], applyTo: ["dark"] },
  { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#0e1626" }], applyTo: ["dark"] },
];

// Generate 50 random hotspots for each map type
const generateHotspots = (baseLat: number, baseLng: number) => {
  const hotspots = [];
  for (let i = 0; i < 50; i++) {
    const lat = baseLat + (Math.random() - 0.5) * 0.2;
    const lng = baseLng + (Math.random() - 0.5) * 0.2;
    const intensity = Math.random() < 0.2 ? "low" : Math.random() < 0.5 ? "medium" : "high";
    hotspots.push({ lat, lng, intensity });
  }
  return hotspots;
};

const baseHotspotsData = {
  traffic: generateHotspots(12.9716, 77.5946),
  air: generateHotspots(12.9716, 77.5946),
  noise: generateHotspots(12.9716, 77.5946),
  mood: generateHotspots(12.9716, 77.5946),
};

export function MapSection({ query }: MapSectionProps) {
  const [timeSlider, setTimeSlider] = useState([0]);
  const [activeMapType, setActiveMapType] = useState("traffic");
  const { theme } = useTheme();
  const mapRef = useRef<google.maps.Map | null>(null);
  const { isLoaded } = useGoogleMaps(); // Use the singleton loader

  useEffect(() => {
    if (query.includes("traffic")) setActiveMapType("traffic");
    else if (query.includes("air")) setActiveMapType("air");
    else if (query.includes("noise")) setActiveMapType("noise");
    else if (query.includes("mood")) setActiveMapType("mood");
  }, [query]);

  const getDynamicHotspots = () => {
    const baseHotspots = baseHotspotsData[activeMapType as keyof typeof baseHotspotsData];
    const timeFactor = timeSlider[0] / 6;
    return baseHotspots.map((hotspot, index) => {
      const latShift = (Math.sin(index + timeFactor * Math.PI) * 0.01) * timeSlider[0];
      const lngShift = (Math.cos(index + timeFactor * Math.PI) * 0.01) * timeSlider[0];
      const highProbability = 0.2 + 0.6 * timeFactor;
      const intensity =
        Math.random() < highProbability ? "high" : Math.random() < 0.5 ? "medium" : "low";
      return {
        ...hotspot,
        lat: hotspot.lat + latShift,
        lng: hotspot.lng + lngShift,
        intensity,
      };
    });
  };

  const getMarkerColor = (intensity: string, mapType: string) => {
    switch (mapType.toLowerCase()) {
      case "traffic":
        return intensity === "high" ? "#ef4444" : intensity === "medium" ? "#eab308" : "#22c55e";
      case "air":
        return intensity === "high" ? "#dc2626" : intensity === "medium" ? "#ca8a04" : "#16a34a";
      case "noise":
        return intensity === "high" ? "#dc2626" : intensity === "medium" ? "#9333ea" : "#6b7280";
      case "mood":
        return intensity === "high" ? "#dc2626" : intensity === "medium" ? "#06b6d4" : "#3b82f6";
      default:
        return "#22c55e";
    }
  };

  const mapOptions = {
    disableDefaultUI: true,
    mapTypeId: "roadmap",
    styles: theme === "dark" ? minimalMapStyle.filter((s) => !s.applyTo || s.applyTo.includes("dark")) : minimalMapStyle,
  };

  return (
    <div className="h-full relative">
      <div className="h-full">
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
            <Marker
              position={center}
              label={{
                text: "Bengaluru",
                color: theme === "dark" ? "#ffffff" : "#000000",
                fontSize: "16px",
                fontWeight: "bold",
              }}
              icon={{ path: google.maps.SymbolPath.CIRCLE, scale: 0 }}
            />

            {getDynamicHotspots().map((hotspot, index) => (
              <Marker
                key={`${index}-${timeSlider[0]}`}
                position={{ lat: hotspot.lat, lng: hotspot.lng }}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: hotspot.intensity === "high" ? 12 : hotspot.intensity === "medium" ? 10 : 8,
                  fillColor: getMarkerColor(hotspot.intensity, activeMapType),
                  fillOpacity: 0.8,
                  strokeWeight: 0,
                }}
                animation={google.maps.Animation.BOUNCE}
              />
            ))}
          </GoogleMap>
        ) : (
          <div className="h-full flex items-center justify-center bg-muted/20">
            {"Loading Map..."}
          </div>
        )}
      </div>

      <Card className="absolute bottom-4 right-4 p-4 w-80 z-10">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center">
              <Clock className="w-4 h-4 mr-2" /> Time Prediction
            </h4>
            <Badge variant="outline">{timeSlider[0] === 0 ? "Now" : `+${timeSlider[0]}h`}</Badge>
          </div>
          <Slider value={timeSlider} onValueChange={setTimeSlider} max={6} step={1} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Now</span>
            <span>+6h</span>
          </div>
        </div>
      </Card>
    </div>
  );
}