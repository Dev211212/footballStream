import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { MatchStatus } from "@/types/match"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMatchTime(timestamp: number) {
  const date = new Date(timestamp * 1000)

  return {
    date: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    full: date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  }
}

export function getMatchStatus(timestamp: number): MatchStatus {
  const now = Date.now()
  const matchTime = timestamp * 1000
  const timeDiff = matchTime - now

  // Consider live if within 10 minutes before to 2 hours after
  if (timeDiff <= 10 * 60 * 1000 && timeDiff >= -2 * 60 * 60 * 1000) {
    return "live"
  }

  if (timeDiff > 0) {
    return "upcoming"
  }

  return "finished"
}

export function getTimeUntilMatch(timestamp: number): number {
  const now = Date.now()
  const matchTime = timestamp * 1000
  return matchTime - now
}

export function formatCountdown(milliseconds: number): string {
  if (milliseconds <= 0) return "00:00:00"

  const hours = Math.floor(milliseconds / (1000 * 60 * 60))
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

export function getViewerCount(): number {
  return Math.floor(Math.random() * 10000) + 1000
}

export function isMatchLive(timestamp: number): boolean {
  return getMatchStatus(timestamp) === "live"
}
