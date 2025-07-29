"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import type { Match } from "@/types/match"

interface UpcomingMatchesProps {
  matches: Match[]
}

export function UpcomingMatches({ matches }: UpcomingMatchesProps) {
  const router = useRouter()
  const now = Date.now()
  const showTime = 10 * 60 * 1000 // 10 minutes

  const todayMatches = matches.filter((match) => {
    const matchDate = new Date(match.match_time * 1000)
    const today = new Date()
    return matchDate.toDateString() === today.toDateString()
  })

  const tomorrowMatches = matches.filter((match) => {
    const matchDate = new Date(match.match_time * 1000)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return matchDate.toDateString() === tomorrow.toDateString()
  })

  const thisWeekMatches = matches.filter((match) => {
    const matchDate = new Date(match.match_time * 1000)
    const today = new Date()
    const weekFromNow = new Date()
    weekFromNow.setDate(today.getDate() + 7)
    return matchDate > today && matchDate <= weekFromNow
  })

  const MatchItem = ({ match }: { match: Match }) => {
    const matchTime = match.match_time * 1000
    const timeDiff = matchTime - now
    const isLive = timeDiff <= showTime && timeDiff > -2 * 60 * 60 * 1000

    const timeString = new Date(matchTime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })

    return (
      <div
        className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
        onClick={() => router.push(`/player/${match.id}`)}
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <img
              src={match.home_img || "/placeholder.svg?height=24&width=24&text=T"}
              alt={match.home_name}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm font-medium">{match.home_name?.slice(0, 3).toUpperCase()}</span>
          </div>

          <span className="text-xs text-slate-500">vs</span>

          <div className="flex items-center space-x-2">
            <img
              src={match.away_img || "/placeholder.svg?height=24&width=24&text=T"}
              alt={match.away_name}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm font-medium">{match.away_name?.slice(0, 3).toUpperCase()}</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-medium">{timeString}</div>
          <div className="text-xs text-slate-500">{match.league}</div>
          {isLive && <Badge className="bg-red-600 text-white text-xs mt-1">LIVE</Badge>}
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white border-l border-slate-200 p-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Upcoming matches</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="today" className="text-xs">
                Today
              </TabsTrigger>
              <TabsTrigger value="tomorrow" className="text-xs">
                Tomorrow
              </TabsTrigger>
              <TabsTrigger value="week" className="text-xs">
                This week
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="space-y-1 max-h-96 overflow-y-auto">
              {todayMatches.length > 0 ? (
                todayMatches.map((match) => <MatchItem key={match.id} match={match} />)
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No matches today</p>
              )}
            </TabsContent>

            <TabsContent value="tomorrow" className="space-y-1 max-h-96 overflow-y-auto">
              {tomorrowMatches.length > 0 ? (
                tomorrowMatches.map((match) => <MatchItem key={match.id} match={match} />)
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No matches tomorrow</p>
              )}
            </TabsContent>

            <TabsContent value="week" className="space-y-1 max-h-96 overflow-y-auto">
              {thisWeekMatches.length > 0 ? (
                thisWeekMatches.map((match) => <MatchItem key={match.id} match={match} />)
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No matches this week</p>
              )}
            </TabsContent>
          </Tabs>

          <div className="p-4 border-t">
            <Button className="w-full bg-transparent" variant="outline" size="sm">
              Full schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
