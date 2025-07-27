"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Route, Leaf, Shield } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/dashboard');
  };

  const handleAuthorityLogin = () => {
    router.push('/authority');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden flex flex-col">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)] pointer-events-none"></div>
      
      {/* Header */}
      <header className="relative z-10 border-b bg-background/80 backdrop-blur-sm flex-shrink-0">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <Route className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Velora</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</a>
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
            <Button variant="outline" size="sm" onClick={handleAuthorityLogin}>
              Authority Login
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Smart City Intelligence Platform
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Comprehensive city intelligence platform that helps reduce traffic, prevent accidents, and enables authorities to manage efficiently with real-time analytics and route optimization.
            </p>
          </div>

          {/* Get Started Button */}
          <div className="space-y-4">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={handleGetStarted}
            >
              Explore City
            </Button>
          </div>

          {/* Feature Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-16 border-t">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Route className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold">Traffic Analytics</h3>
              <p className="text-sm text-muted-foreground text-center">Real-time traffic monitoring and intelligent route optimization</p>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold">Accident Prevention</h3>
              <p className="text-sm text-muted-foreground text-center">Predictive analytics to identify and prevent potential incidents</p>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold">Authority Tools</h3>
              <p className="text-sm text-muted-foreground text-center">Comprehensive dashboard for city authorities and emergency services</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t bg-background/80 backdrop-blur-sm flex-shrink-0">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-primary to-primary/80 rounded flex items-center justify-center">
                <Route className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">Velora</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>© 2024 Velora. All rights reserved.</span>
              <a href="#privacy" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#terms" className="hover:text-foreground transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}