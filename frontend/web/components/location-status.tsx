"use client";

import { useGeolocation } from "@/hooks/use-geolocation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Loader2, AlertCircle, CheckCircle } from "lucide-react";

export function LocationStatus() {
  const { latitude, longitude, address, accuracy, isLoading, error } = useGeolocation();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="w-5 h-5" />
          <span>Location Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Getting your location...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-red-500">{error}</span>
          </div>
        )}

        {!isLoading && !error && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-500">Location obtained</span>
            </div>
            
            {address && (
              <div>
                <span className="text-sm font-medium">Address:</span>
                <p className="text-sm text-muted-foreground">{address}</p>
              </div>
            )}
            
            {latitude && longitude && (
              <div>
                <span className="text-sm font-medium">Coordinates:</span>
                <p className="text-sm text-muted-foreground">
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
              </div>
            )}
            
            {accuracy && (
              <div>
                <span className="text-sm font-medium">Accuracy:</span>
                <p className="text-sm text-muted-foreground">{Math.round(accuracy)} meters</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 