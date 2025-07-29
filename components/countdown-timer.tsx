"use client"

import { useState, useEffect } from "react"
import { formatCountdown, getTimeUntilMatch } from "@/lib/utils"

interface CountdownTimerProps {
  targetTime: number
  onComplete?: () => void
}

export function CountdownTimer({ targetTime, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0)

  useEffect(() => {
    const updateTimer = () => {
      const remaining = getTimeUntilMatch(targetTime)
      setTimeLeft(remaining)

      if (remaining <= 0 && onComplete) {
        onComplete()
      }
    }

    // Update immediately
    updateTimer()

    // Then update every second
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [targetTime, onComplete])

  if (timeLeft <= 0) {
    return (
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">LIVE NOW</div>
        <div className="text-sm text-gray-600">Match is starting</div>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-blue-600 font-mono">{formatCountdown(timeLeft)}</div>
      <div className="text-sm text-gray-600">Until match starts</div>
    </div>
  )
}
