"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, Play } from "lucide-react"
import { fetchMatches } from "@/lib/api"
import type { Match } from "@/types/match"
import Link from "next/link"

export default function HomePage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLeague, setSelectedLeague] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true)
        const data = await fetchMatches()
        setMatches(data)
        setFilteredMatches(data)
      } catch (err) {
        setError("Failed to load matches")
        console.error("Error loading matches:", err)
      } finally {
        setLoading(false)
      }
    }

    loadMatches()
  }, [])

  useEffect(() => {
    let filtered = matches

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (match) =>
          match.home_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          match.away_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          match.league.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by league
    if (selectedLeague !== "all") {
      filtered = filtered.filter((match) => match.league === selectedLeague)
    }

    // Filter by status
    if (statusFilter !== "all") {
      const now = Date.now()
      const showTime = 10 * 60 * 1000 // 10 minutes

      filtered = filtered.filter((match) => {
        const matchTime = match.match_time * 1000
        const timeDiff = matchTime - now

        if (statusFilter === "live") {
          return timeDiff <= showTime && timeDiff > -2 * 60 * 60 * 1000
        } else if (statusFilter === "upcoming") {
          return timeDiff > showTime
        } else if (statusFilter === "finished") {
          return timeDiff <= -2 * 60 * 60 * 1000
        }
        return true
      })
    }

    setFilteredMatches(filtered)
  }, [matches, searchTerm, selectedLeague, statusFilter])

  const getMatchStatus = (match: Match) => {
    const now = Date.now()
    const matchTime = match.match_time * 1000
    const timeDiff = matchTime - now
    const showTime = 10 * 60 * 1000

    if (timeDiff <= showTime && timeDiff > -2 * 60 * 60 * 1000) {
      return { status: "live", label: "LIVE", variant: "destructive" as const }
    } else if (timeDiff > showTime) {
      return { status: "upcoming", label: "UPCOMING", variant: "secondary" as const }
    } else {
      return { status: "finished", label: "FINISHED", variant: "outline" as const }
    }
  }

  const formatMatchTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleString()
  }

  const getUniqueLeagues = () => {
    const leagues = [...new Set(matches.map((match) => match.league))]
    return leagues.sort()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading matches...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Football Matches</h1>
          <p className="text-gray-600 text-sm sm:text-base">Watch live football matches from around the world</p>
        </div>

        {/* Filters */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search teams or leagues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>

              <Select value={selectedLeague} onValueChange={setSelectedLeague}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="All Leagues" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leagues</SelectItem>
                  {getUniqueLeagues().map((league) => (
                    <SelectItem key={league} value={league}>
                      {league}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="All Matches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Matches</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="finished">Finished</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                className="text-sm"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedLeague("all")
                  setStatusFilter("all")
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-2 sm:mb-4">
          <p className="text-gray-600 text-sm">
            Showing {filteredMatches.length} of {matches.length} matches
          </p>
        </div>

        {/* Matches List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredMatches.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No matches found matching your filters</p>
              </CardContent>
            </Card>
          ) : (
            filteredMatches.map((match) => {
              const matchStatus = getMatchStatus(match)
              return (
                <Card key={match.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 w-full">
                        {/* Teams */}
                        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <img
                              src={match.home_img || "/placeholder.svg"}
                              alt={match.home_name}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded object-contain"
                            />
                            <span className="font-medium text-sm sm:text-base">{match.home_name}</span>
                          </div>
                          <span className="text-gray-400 text-xs sm:text-base">vs</span>
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <img
                              src={match.away_img || "/placeholder.svg"}
                              alt={match.away_name}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded object-contain"
                            />
                            <span className="font-medium text-sm sm:text-base">{match.away_name}</span>
                          </div>
                        </div>

                        {/* League & Status */}
                        <div className="flex flex-row items-center space-x-2">
                          <Badge variant="outline" className="text-xs sm:text-sm">{match.league}</Badge>
                          <Badge variant={matchStatus.variant} className="text-xs sm:text-sm">{matchStatus.label}</Badge>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                        {/* Match Time */}
                        <div className="flex items-center space-x-1 text-gray-500 text-xs sm:text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>{formatMatchTime(match.match_time)}</span>
                        </div>

                        {/* Watch Button */}
                        <Link href={`/player/${match.id}`} className="w-full sm:w-auto">
                          <Button size="sm" className="flex items-center space-x-1 w-full sm:w-auto">
                            <Play className="w-4 h-4" />
                            <span>Watch</span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
