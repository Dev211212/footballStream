export function generateAuthKey(): string {
  const date = new Date()
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Baku",
    hour12: false,
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    ...options,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  const parts = formatter.formatToParts(date)
  const dateTime: Record<string, string> = {}

  parts.forEach(({ type, value }) => {
    dateTime[type] = value
  })

  const adenDate = new Date(
    `${dateTime.year}-${dateTime.month}-${dateTime.day}T${dateTime.hour}:${dateTime.minute}:${dateTime.second}+03:00`,
  )

  const timestamp = Math.floor(adenDate.getTime() / 1000)
  const randomNumber = Math.floor(Math.random() * 9000000000) + 1000000000
  const constant = "0-0"
  const hash = md5(`${timestamp}${randomNumber}`)

  return `${timestamp}-${constant}-${hash}`
}

export function detectAppleDevice(): boolean {
  if (typeof window === "undefined") return false

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera

  if (/Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent)) return false
  if (/iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1))
    return false

  return true
}

export function generateStreamUrl(url: string, name: string, authKey: string): string {
  let btnUrl = ""
  const deviceType = detectAppleDevice()

  if (url.includes("http")) {
    if (url.includes("pull.niur.live")) {
      btnUrl = deviceType ? url.replace(".m3u8", ".flv") : url
    } else {
      btnUrl = url
    }
  } else if (name.includes("V HD")) {
    btnUrl = `https://pull.niues.live/live/stream-${url}_lhd.m3u8?auth_key=${authKey}`
  } else if (name.includes("V SD")) {
    btnUrl = `https://pull.niues.live/live/stream-${url}_lsd.m3u8?auth_key=${authKey}`
  } else if (name.includes("C HD")) {
    btnUrl = deviceType
      ? `https://pull.dangaoka.com/live/stream-${url}_lhd.flv?auth_key=${authKey}`
      : `https://pull.dangaoka.com/live/stream-${url}_lhd.m3u8?auth_key=${authKey}`
  } else if (name.includes("C SD")) {
    btnUrl = deviceType
      ? `https://pull.dangaoka.com/live/stream-${url}_lsd.flv?auth_key=${authKey}`
      : `https://pull.dangaoka.com/live/stream-${url}_lsd.m3u8?auth_key=${authKey}`
  } else {
    btnUrl = url
  }

  return btnUrl
}

// Simple MD5 implementation for auth key generation
function md5(string: string): string {
  // This is a simplified version - in production, use a proper crypto library
  let hash = 0
  if (string.length === 0) return hash.toString()

  for (let i = 0; i < string.length; i++) {
    const char = string.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(16)
}
