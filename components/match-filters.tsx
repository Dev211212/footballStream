"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { FilterOptions } from "@/types/match"
import { Search, Filter } from "lucide-react"

interface MatchFiltersProps {
  leagues: string[]
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
}

export function MatchFilters({ leagues, filters, onFiltersChange }: MatchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      league: "",
      status: "all",
      search: "",
    })
  }

  const activeFiltersCount = [filters.league, filters.status !== "all" ? filters.status : "", filters.search].filter(
    Boolean,
  ).length

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search matches..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10"
          />
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-gray-50"
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
          <div>
            <label className="block text-sm font-medium mb-2">League</label>
            <Select value={filters.league} onValueChange={(value) => handleFilterChange("league", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All leagues" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All leagues</SelectItem>
                {leagues.map((league) => (
                  <SelectItem key={league} value={league}>
                    {league}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value as FilterOptions["status"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All matches</SelectItem>
                <SelectItem value="live">Live now</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-800">
              Clear all filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
