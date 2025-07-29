"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import type { Match } from "@/types/match"
import { fetchMatches } from "@/lib/api"
import { formatMatchTime, getMatchStatus, getTimeUntilMatch } from "@/lib/utils"
import { CountdownTimer } from "@/components/countdown-timer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-2 sm:px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading match...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-2 sm:px-4 py-8">
          <div className="mb-6">
            <Button onClick={() => router.push("/")} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
          <Card>
            <CardContent className="p-6 sm:p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{error || "Match Not Found"}</h1>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                {error === "Match not found"
                  ? "The requested match could not be found."
                  : "There was an error loading the match data."}
              </p>
              <Button onClick={() => router.push("/")} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const { date, time } = formatMatchTime(match.match_time)
  const status = getMatchStatus(match.match_time)
  const timeUntilMatch = getTimeUntilMatch(match.match_time)
  const canWatch = status === "live" || timeUntilMatch <= 600000 // 10 minutes before

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <Button onClick={() => router.push("/")} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Matches
          </Button>
        </div>

        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <Badge variant="outline" className="text-xs sm:text-sm">{match.league || "Football"}</Badge>
              {status === "live" && (
                <Badge variant="destructive" className="animate-pulse flex items-center text-xs sm:text-sm">
                  <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                  LIVE
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-11 gap-4 items-center mb-4 sm:mb-6">
              <div className="col-span-1 sm:col-span-4 text-center flex flex-col items-center">
                <img
                  src={match.home_img || "/placeholder.svg?height=80&width=80"}
                  alt={match.home_name || "Home Team"}
                  className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=80&width=80"
                  }}
                />
                <h2 className="text-base sm:text-lg font-bold">{match.home_name || "Home Team"}</h2>
              </div>

              <div className="col-span-1 sm:col-span-3 text-center flex flex-col items-center">
                {status === "upcoming" ? (
                  <CountdownTimer targetTime={match.match_time} />
                ) : (
                  <>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">{date}</p>
                    <p className="text-lg sm:text-xl font-bold">{time}</p>
                  </>
                )}
              </div>

              <div className="col-span-1 sm:col-span-4 text-center flex flex-col items-center">
                <img
                  src={match.away_img || "/placeholder.svg?height=80&width=80"}
                  alt={match.away_name || "Away Team"}
                  className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=80&width=80"
                  }}
                />
                <h2 className="text-base sm:text-lg font-bold">{match.away_name || "Away Team"}</h2>
              </div>
            </div>
          </CardContent>
        </Card>

        {!canWatch && (
          <Card className="mb-4 sm:mb-6">
            <CardContent className="p-4 sm:p-6 text-center">
              <h3 className="text-base sm:text-lg font-semibold mb-2">Stream Not Available Yet</h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">The stream will be available 10 minutes before the match starts.</p>
              <CountdownTimer targetTime={match.match_time} />
            </CardContent>
          </Card>
        )}

        {canWatch && (
          <div className="rounded-lg overflow-hidden mb-4">
            <ArtPlayer
              streams={match.links || []}
              matchId={matchId}
              onStreamChange={(url) => console.log("Stream changed to:", url)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
