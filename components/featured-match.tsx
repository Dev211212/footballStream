"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CountdownTimer } from "@/components/countdown-timer"
import { MapPin, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Match } from "@/types/match"

interface FeaturedMatchProps {
  match: Match
}

export function FeaturedMatch({ match }: FeaturedMatchProps) {
  const router = useRouter()
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    const now = Date.now()
    const matchTime = match.match_time * 1000
    const timeDiff = matchTime - now
    const showTime = 10 * 60 * 1000 // 10 minutes

    setIsLive(timeDiff <= showTime && timeDiff > -2 * 60 * 60 * 1000)
  }, [match.match_time])

  const matchDate = new Date(match.match_time * 1000)
  const timeString = matchDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
  const dateString = matchDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })

  return (
    <Card className="relative overflow-hidden bg-gradient-to-r from-slate-800 to-slate-900 text-white">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: `url('/placeholder.svg?height=400&width=800&text=Stadium+Background')`,
        }}
      />

      <div className="relative p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-blue-600 text-white">
              {match.league}
            </Badge>
            {isLive && <Badge className="bg-red-600 text-white animate-pulse">LIVE</Badge>}
            {!isLive && (
              <Badge variant="outline" className="border-white text-white">
                <CountdownTimer targetTime={match.match_time * 1000} />
              </Badge>
            )}
          </div>

          <div className="flex items-center text-sm text-slate-300">
            <MapPin className="w-4 h-4 mr-1" />
            <span>Anfield Stadium, Liverpool</span>
          </div>
        </div>

        <div className="grid grid-cols-11 gap-4 items-center mb-6">
          <div className="col-span-4 text-center">
            <img
              src={match.home_img || "/placeholder.svg?height=80&width=80&text=Team"}
              alt={match.home_name}
              className="w-20 h-20 mx-auto mb-3 rounded-full bg-white p-2"
            />
            <h3 className="text-xl font-bold">{match.home_name}</h3>
            <p className="text-sm text-slate-300">Home</p>
          </div>

          <div className="col-span-3 text-center">
            <div className="text-4xl font-bold mb-2">{timeString}</div>
            <div className="text-sm text-slate-300 mb-2">{dateString}</div>
            {isLive && (
              <div className="flex items-center justify-center text-sm">
                <Users className="w-4 h-4 mr-1" />
                <span>12.5K watching</span>
              </div>
            )}
          </div>

          <div className="col-span-4 text-center">
            <img
              src={match.away_img || "/placeholder.svg?height=80&width=80&text=Team"}
              alt={match.away_name}
              className="w-20 h-20 mx-auto mb-3 rounded-full bg-white p-2"
            />
            <h3 className="text-xl font-bold">{match.away_name}</h3>
            <p className="text-sm text-slate-300">Away</p>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => router.push(`/player/${match.id}`)}
          >
            {isLive ? "Watch Live" : "Match Details"}
          </Button>
        </div>
      </div>
    </Card>
  )
}
