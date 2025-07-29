"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Play } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Match } from "@/types/match"

interface MatchCardProps {
  match: Match
}

export function MatchCard({ match }: MatchCardProps) {
  const router = useRouter()
  const [isLive, setIsLive] = useState(false)
  const [timeUntilMatch, setTimeUntilMatch] = useState("")

  useEffect(() => {
    const updateStatus = () => {
      const now = Date.now()
      const matchTime = match.match_time * 1000
      const timeDiff = matchTime - now
      const showTime = 10 * 60 * 1000 // 10 minutes

      setIsLive(timeDiff <= showTime && timeDiff > -2 * 60 * 60 * 1000)

      if (timeDiff > 0) {
        const hours = Math.floor(timeDiff / (1000 * 60 * 60))
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))

        if (hours > 0) {
          setTimeUntilMatch(`${hours}h ${minutes}m`)
        } else {
          setTimeUntilMatch(`${minutes}m`)
        }
      } else {
        setTimeUntilMatch("")
      }
    }

    updateStatus()
    const interval = setInterval(updateStatus, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [match.match_time])

  const matchDate = new Date(match.match_time * 1000)
  const timeString = matchDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  const viewerCount = Math.floor(Math.random() * 50000) + 5000

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className="text-xs">
            {match.league}
          </Badge>
          {isLive ? (
            <div className="flex items-center space-x-2">
              <Badge className="bg-red-600 text-white animate-pulse">LIVE</Badge>
              <div className="flex items-center text-xs text-slate-500">
                <Users className="w-3 h-3 mr-1" />
                <span>{(viewerCount / 1000).toFixed(1)}K</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500">{timeUntilMatch && `in ${timeUntilMatch}`}</div>
          )}
        </div>

        <div className="grid grid-cols-7 gap-2 items-center mb-4">
          <div className="col-span-3 text-center">
            <img
              src={match.home_img || "/placeholder.svg?height=40&width=40&text=Team"}
              alt={match.home_name}
              className="w-10 h-10 mx-auto mb-1 rounded-full"
            />
            <p className="text-xs font-medium truncate">{match.home_name}</p>
          </div>

          <div className="col-span-1 text-center">
            {isLive ? (
              <div className="text-lg font-bold">
                {Math.floor(Math.random() * 3)} - {Math.floor(Math.random() * 3)}
              </div>
            ) : (
              <div className="text-sm font-medium text-slate-600">{timeString}</div>
            )}
          </div>

          <div className="col-span-3 text-center">
            <img
              src={match.away_img || "/placeholder.svg?height=40&width=40&text=Team"}
              alt={match.away_name}
              className="w-10 h-10 mx-auto mb-1 rounded-full"
            />
            <p className="text-xs font-medium truncate">{match.away_name}</p>
          </div>
        </div>

        <Button
          className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors bg-transparent"
          variant="outline"
          size="sm"
          onClick={() => router.push(`/player/${match.id}`)}
        >
          <Play className="w-4 h-4 mr-2" />
          {isLive ? "Watch" : "Details"}
        </Button>
      </CardContent>
    </Card>
  )
}
