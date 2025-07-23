"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/mode-toggle"
import { Shield, MapPin, CheckCircle, TrendingUp, Target, Truck, Bell, Settings, LogOut } from "lucide-react"

interface AuthorityHeaderProps {
  activeView: string
  onViewChange: (view: string) => void
}

const navigationItems = [
  { id: "command", label: "Command Center", icon: MapPin },
  { id: "verifier", label: "Verify Reports", icon: CheckCircle },
  { id: "insights", label: "Root Cause", icon: TrendingUp },
  { id: "hotspots", label: "Hotspot Mgmt", icon: Target },
  { id: "deployment", label: "Deploy Services", icon: Truck },
]

export function AuthorityHeader({ activeView, onViewChange }: AuthorityHeaderProps) {
  return (
    <header className="h-16 border-b bg-card px-6 flex items-center justify-between">
      {/* Logo & Title */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold">Velora Authority Command</h1>
          <p className="text-xs text-muted-foreground">City Operations Center</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center space-x-1">
        {navigationItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={activeView === item.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange(item.id)}
              className={activeView === item.id ? "bg-primary text-primary-foreground" : ""}
            >
              <Icon className="w-4 h-4 mr-2" />
              {item.label}
            </Button>
          )
        })}
      </div>

      {/* Status & User */}
      <div className="flex items-center space-x-4">
        {/* Live Status */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Live</span>
        </div>

        {/* Alerts */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500">
            7
          </Badge>
        </Button>

        <ModeToggle />

        {/* Authority User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Authority" />
                <AvatarFallback>AC</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium">Authority Control</p>
                <p className="text-sm text-muted-foreground">admin@city.gov</p>
                <Badge variant="outline" className="text-xs w-fit">
                  Level 5 Access
                </Badge>
              </div>
            </div>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
