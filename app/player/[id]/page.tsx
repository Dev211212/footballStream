"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import type { Match } from "@/types/match"
import { fetchMatches } from "@/lib/api"
import { formatMatchTime, getMatchStatus, getTimeUntilMatch } from "@/lib/utils"
import { CountdownTimer } from "@/components/countdown-timer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { ArtPlayer } from "@/components/art-player"

export default function PlayerPage() {
  const params = useParams()
  const router = useRouter()
  const matchId = params.id as string

  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMatch = async () => {
      try {
        setLoading(true)
        setError(null)
        const matches = await fetchMatches()
        const foundMatch = matches.find((m) => m.id === matchId)

        if (!foundMatch) {
          setError("Match not found")
        } else {
          setMatch(foundMatch)
        }
      } catch (error) {
        console.error("Error loading match:", error)
        setError("Failed to load match data")
      } finally {
        setLoading(false)
      }
    }

    if (matchId) {
      loadMatch()
    }
  }, [matchId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading match...</p>
        </div>
      </div>
    )
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{error || "Match Not Found"}</h1>
          <p className="text-gray-600 mb-4">
            {error === "Match not found"
              ? "The requested match could not be found."
              : "There was an error loading the match data."}
          </p>
          <Button onClick={() => router.push("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  const status = getMatchStatus(match.match_time)
  const timeUntilMatch = getTimeUntilMatch(match.match_time)
  const canWatch = status === "live" || timeUntilMatch <= 600000 // 10 minutes before

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl px-2 sm:px-4 py-4 sm:py-8">
        <div className="mb-6 flex items-center">
          <Button onClick={() => router.push("/")} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Matches
          </Button>
          <div className="ml-4">
            <Badge variant="outline" className="text-xs sm:text-sm">{match.league || "Football"}</Badge>
            {status === "live" && (
              <Badge variant="destructive" className="animate-pulse ml-2 flex items-center text-xs sm:text-sm">
                <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                LIVE
              </Badge>
            )}
          </div>
        </div>

        {/* Show only timer view if not live or no links */}
        {!canWatch || !match.links || match.links.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-lg p-8 sm:p-12">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">
              {match.home_name || "Home Team"} <span className="text-gray-400">vs</span> {match.away_name || "Away Team"}
            </h2>
            <img
              src={match.home_img || "/placeholder.svg?height=80&width=80"}
              alt={match.home_name || "Home Team"}
              className="w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-2 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=80&width=80"
              }}
            />
            <img
              src={match.away_img || "/placeholder.svg?height=80&width=80"}
              alt={match.away_name || "Away Team"}
              className="w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-6 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=80&width=80"
              }}
            />
            <div className="mb-4">
              <span className="block text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                {status === "upcoming" ? "Match starts in:" : "Match starts soon"}
              </span>
              <div className="flex justify-center">
                <CountdownTimer
                  targetTime={match.match_time}
                />
              </div>
            </div>
            <p className="text-gray-600 text-base sm:text-lg">
              {match.links && match.links.length > 0
                ? "The stream will be available 10 minutes before the match starts."
                : "No stream link available for this match."}
            </p>
          </div>
        ) : (
          <div className="rounded-lg overflow-hidden mb-4 bg-black">
            <ArtPlayer
              streams={match.links}
              matchId={matchId}
              onStreamChange={(url) => console.log("Stream changed to:", url)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
