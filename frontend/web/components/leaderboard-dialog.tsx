"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trophy, Medal, Award, Star } from "lucide-react"

interface LeaderboardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const mockLeaderboard = [
  {
    id: 1,
    name: "Sarah Chen",
    points: 2450,
    level: 12,
    reports: 89,
    verified: 156,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Mike Johnson",
    points: 2100,
    level: 10,
    reports: 76,
    verified: 134,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Priya Sharma",
    points: 1890,
    level: 9,
    reports: 65,
    verified: 112,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Alex Rodriguez",
    points: 1650,
    level: 8,
    reports: 58,
    verified: 98,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "Emma Wilson",
    points: 1420,
    level: 7,
    reports: 52,
    verified: 87,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 6,
    name: "David Kim",
    points: 1200,
    level: 6,
    reports: 45,
    verified: 76,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 7,
    name: "Lisa Zhang",
    points: 980,
    level: 5,
    reports: 38,
    verified: 65,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 8,
    name: "John Doe",
    points: 150,
    level: 3,
    reports: 12,
    verified: 8,
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export function LeaderboardDialog({ open, onOpenChange }: LeaderboardDialogProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <Star className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">🥇 Champion</Badge>
      case 2:
        return <Badge className="bg-gray-400 hover:bg-gray-500">🥈 Runner-up</Badge>
      case 3:
        return <Badge className="bg-amber-600 hover:bg-amber-700">🥉 Third Place</Badge>
      default:
        return <Badge variant="outline">#{rank}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Trophy className="w-5 h-5 mr-2" />
            City Champions Leaderboard
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gradient-to-r from-primary/10 to-cyan-500/10 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">🏆 How to Earn Points</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                • Submit report: <strong>+10 pts</strong>
              </div>
              <div>
                • Verify report: <strong>+5 pts</strong>
              </div>
              <div>
                • First to report: <strong>+20 pts</strong>
              </div>
              <div>
                • Report verified: <strong>+15 pts</strong>
              </div>
              <div>
                • Weekly streak: <strong>+5 pts/day</strong>
              </div>
              <div>
                • Catch spam: <strong>+10 pts</strong>
              </div>
            </div>
          </div>

          <ScrollArea className="h-96">
            <div className="space-y-3">
              {mockLeaderboard.map((user, index) => (
                <div
                  key={user.id}
                  className="flex items-center space-x-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {getRankIcon(index + 1)}
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{user.name}</h4>
                      {getRankBadge(index + 1)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Level {user.level}</span>
                      <span>•</span>
                      <span>{user.reports} reports</span>
                      <span>•</span>
                      <span>{user.verified} verified</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-lg">{user.points.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">points</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
