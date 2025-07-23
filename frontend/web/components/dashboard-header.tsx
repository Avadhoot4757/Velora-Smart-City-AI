"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { LoginDialog } from "@/components/login-dialog"
import { ReportDialog } from "@/components/report-dialog"
import { LeaderboardDialog } from "@/components/leaderboard-dialog"
import { ModeToggle } from "@/components/mode-toggle"
import { Search, Bell, Settings, LogOut, Trophy, ArrowLeft, Crosshair, Navigation, Upload } from "lucide-react"

export interface DashboardHeaderProps {
  onBack?: () => void
  showReportIssue?: boolean
}

export function DashboardHeader({ onBack, showReportIssue = true }: DashboardHeaderProps) {
  const { user, logout } = useAuth()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleProtectedAction = (action: () => void) => {
    if (user) {
      action()
    } else {
      setIsLoginOpen(true)
    }
  }

  return (
    <>
      <header className="h-20 border-b bg-background px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <span className="text-2xl font-extrabold text-primary tracking-wide flex items-center">
            <span className="mr-2">📡</span> Velora
          </span>
        </div>

        {/* Center Section: Current Location and Report Issue */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-muted/50 px-4 py-2 rounded-full">
            <Crosshair className="w-4 h-4 text-primary animate-pulse" />
            <span className="font-medium text-sm">Koramangala, Bengaluru</span>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Navigation className="w-3 h-3" />
            </Button>
          </div>

          {showReportIssue && (
            <Button
              variant="default"
              size="sm"
              className="justify-start"
              onClick={() => handleProtectedAction(() => setIsReportOpen(true))}
            >
              <Upload className="w-4 h-4 mr-2" />
              Report Issue
              {!user && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  Login
                </Badge>
              )}
            </Button>
          )}
        </div>

        {/* Search Bar */}
        {!onBack && (
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Where do you want to go?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* User Section */}
        <div className="flex items-center space-x-4">
          <ModeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsLeaderboardOpen(true)}
            className="flex items-center"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Leaderboard
          </Button>

          {user ? (
            <>
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Trophy className="w-3 h-3" />
                <span>{user.points} pts</span>
              </Badge>

              <Button variant="ghost" size="icon">
                <Bell className="w-4 h-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Level {user.level} • {user.points} points
                      </p>
                    </div>
                  </div>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={() => setIsLoginOpen(true)}>Login / Sign Up</Button>
          )}
        </div>
      </header>

      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
      <ReportDialog open={isReportOpen} onOpenChange={setIsReportOpen} />
      <LeaderboardDialog open={isLeaderboardOpen} onOpenChange={setIsLeaderboardOpen} />
    </>
  )
}