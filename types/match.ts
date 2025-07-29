export interface StreamLink {
  name: string
  url: string
}

export interface Match {
  id: string
  league: string
  home_name: string
  away_name: string
  home_img: string
  away_img: string
  match_time: number
  links: StreamLink[]
}

export type MatchStatus = "live" | "upcoming" | "finished"

export interface MatchFilters {
  league: string
  status: MatchStatus | "all"
  search: string
}
