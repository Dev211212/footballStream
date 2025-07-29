import { decryptString } from "./crypto"
import type { Match } from "@/types/match"

const ENCRYPTION_KEY = "devxseven"
const GITHUB_REPO = "devxseven/mdata"
const FILE_NAME = "matches.json"

export async function fetchMatches(): Promise<Match[]> {
  try {
    // Try GitHub API first
    const apiResponse = await fetchFromGitHubAPI()
    if (apiResponse.length > 0) {
      return apiResponse
    }
  } catch (error) {
    console.warn("GitHub API failed, trying raw fetch:", error)
  }

  try {
    // Fallback to raw GitHub
    return await fetchFromRawGitHub()
  } catch (error) {
    console.error("All fetch methods failed:", error)
    return getMockMatches()
  }
}

async function fetchFromGitHubAPI(): Promise<Match[]> {
  const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_NAME}`, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "FBStream-App",
    },
  })

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }

  const data = await response.json()
  const content = JSON.parse(atob(data.content))

  return decryptMatchData(content)
}

async function fetchFromRawGitHub(): Promise<Match[]> {
  const response = await fetch(`https://raw.githubusercontent.com/${GITHUB_REPO}/main/${FILE_NAME}`)

  if (!response.ok) {
    throw new Error(`Raw GitHub error: ${response.status}`)
  }

  const encryptedData = await response.json()
  return decryptMatchData(encryptedData)
}

function decryptMatchData(encryptedData: any): Match[] {
  try {
    const decryptedObj: any = {}

    for (const [key, value] of Object.entries(encryptedData)) {
      try {
        const decryptedKey = decryptString(key, ENCRYPTION_KEY)
        const decryptedValue = JSON.parse(decryptString(value as string, ENCRYPTION_KEY))
        decryptedObj[decryptedKey] = decryptedValue
      } catch (error) {
        console.warn("Failed to decrypt entry:", key, error)
        decryptedObj[key] = value
      }
    }

    return decryptedObj.context || decryptedObj.matches || []
  } catch (error) {
    console.error("Failed to decrypt match data:", error)
    return []
  }
}

function getMockMatches(): Match[] {
  const now = Date.now()
  const oneHour = 60 * 60 * 1000

  return [
    {
      id: "295987",
      league: "Premier League",
      home_name: "Liverpool",
      away_name: "Arsenal",
      home_img: "/placeholder.svg?height=80&width=80&text=LIV",
      away_img: "/placeholder.svg?height=80&width=80&text=ARS",
      match_time: Math.floor((now + oneHour) / 1000),
      links: [
        { name: "HD Stream 1", url: "https://example.com/stream1.m3u8" },
        { name: "SD Stream 1", url: "https://example.com/stream1_sd.m3u8" },
        { name: "HD Stream 2", url: "https://example.com/stream2.m3u8" },
      ],
    },
    {
      id: "295988",
      league: "La Liga",
      home_name: "Real Madrid",
      away_name: "Barcelona",
      home_img: "/placeholder.svg?height=80&width=80&text=RMA",
      away_img: "/placeholder.svg?height=80&width=80&text=BAR",
      match_time: Math.floor((now + 2 * oneHour) / 1000),
      links: [
        { name: "HD Stream 1", url: "https://example.com/stream3.m3u8" },
        { name: "SD Stream 1", url: "https://example.com/stream3_sd.m3u8" },
      ],
    },
  ]
}
