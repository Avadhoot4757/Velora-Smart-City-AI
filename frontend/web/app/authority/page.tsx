"use client"

import { useState } from "react"
import { AuthorityHeader } from "@/components/authority-header"
import { CommandDashboard } from "@/components/command-dashboard"
import { IncidentVerifier } from "@/components/incident-verifier"
import { RootCauseInsights } from "@/components/root-cause-insights"
import { HotspotManagement } from "@/components/hotspot-management"
import { ServiceDeployment } from "@/components/service-deployment"

type AuthorityView = "command" | "verifier" | "insights" | "hotspots" | "deployment"

export default function AuthorityDashboard() {
  const [activeView, setActiveView] = useState<AuthorityView>("command")

  const renderView = () => {
    switch (activeView) {
      case "command":
        return <CommandDashboard />
      case "verifier":
        return <IncidentVerifier />
      case "insights":
        return <RootCauseInsights />
      case "hotspots":
        return <HotspotManagement />
      case "deployment":
        return <ServiceDeployment />
      default:
        return <CommandDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthorityHeader
        activeView={activeView}
        onViewChange={(view) => setActiveView(view as AuthorityView)}
        />
      {renderView()}
    </div>
  )
}
