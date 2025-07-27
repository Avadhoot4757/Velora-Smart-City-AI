"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Route, Leaf, Shield, Heart, Navigation } from "lucide-react";

export default function LandingPage() {
  const [currentLocation] = useState("Koramangala, Bengaluru");
  const router = useRouter();

  const handleGetStarted = () => {
    router.push(`/dashboard`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-8 max-w-2xl mx-auto px-6">
          {/* Welcome Section */}
          <div className="space-y-4">
            <div className="text-6xl mb-4">🚀</div>
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome to <span className="text-primary">Velora</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Your intelligent companion for navigating Bengaluru with real-time insights, 
              smart routing, and city intelligence at your fingertips.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <Card className="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardContent className="p-0 space-y-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Route className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Smart Navigation</h3>
                  <p className="text-muted-foreground text-sm">
                    Get intelligent route suggestions with real-time traffic, pollution, and safety data.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardContent className="p-0 space-y-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Eco-Friendly Routes</h3>
                  <p className="text-muted-foreground text-sm">
                    Choose routes that minimize your carbon footprint and exposure to pollution.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardContent className="p-0 space-y-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Safety First</h3>
                  <p className="text-muted-foreground text-sm">
                    Navigate through well-lit, safe areas with real-time incident alerts.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardContent className="p-0 space-y-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Health Conscious</h3>
                  <p className="text-muted-foreground text-sm">
                    Routes optimized for lower noise levels and better air quality.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Get Started Button */}
          <div className="mt-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={handleGetStarted}
            >
              <Navigation className="w-5 h-5 mr-2" />
              Get Started - Plan Your Route
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
              Start exploring Bengaluru with intelligent navigation
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">50K+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">1M+</div>
              <div className="text-sm text-muted-foreground">Routes Planned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">95%</div>
              <div className="text-sm text-muted-foreground">User Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}