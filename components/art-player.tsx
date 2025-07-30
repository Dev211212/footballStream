"use client";
import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, RefreshCw, AlertCircle } from "lucide-react"
import type { StreamLink } from "@/types/match"

interface ArtPlayerProps {
  streams: StreamLink[]
  matchId: string
  onStreamChange?: (streamUrl: string) => void
}

declare global {
  interface Window {
    Artplayer: any
    Hls: any
    flvjs: any
    CryptoJS: any
    Telegram?: {
      WebApp: any
    }
  }
}

export function ArtPlayer({ streams, matchId, onStreamChange }: ArtPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null)
  const artPlayerRef = useRef<any>(null)
  const [selectedStream, setSelectedStream] = useState<string>("")
  const [authKey, setAuthKey] = useState<string>("")
  const [scriptsLoaded, setScriptsLoaded] = useState(false)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [dataUsage, setDataUsage] = useState<number>(0)
  const [realDataUsage, setRealDataUsage] = useState<number>(0)
  const [playStartTime, setPlayStartTime] = useState<number | null>(null)
  const BITRATE_MBPS = 2 // Estimated bitrate in Mbps

  // Generate authentication key
  const generateAuthKey = () => {
    const date = new Date()
    const timestamp = Math.floor(date.getTime() / 1000)
    const randomNumber = Math.floor(Math.random() * 9000000000) + 1000000000
    const constant = "0-0"

    // Simple hash function since CryptoJS might not be available
    const simpleHash = (str: string) => {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash
      }
      return Math.abs(hash).toString(16)
    }

    const hash = simpleHash(`${timestamp}${randomNumber}`)
    return `${timestamp}-${constant}-${hash}`
  }

  // Detect Apple device for format selection
  const detectAppleDevice = () => {
    if (typeof window === "undefined") return false
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
    if (/Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent)) return false
    if (/iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1))
      return false
    return true
  }

  // Generate stream URL based on device and stream type
  const generateStreamUrl = (url: string, name: string) => {
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

  // Load external scripts with better error handling
  useEffect(() => {
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        // Check if script already exists
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve()
          return
        }

        const script = document.createElement("script")
        script.src = src
        script.async = true
        script.crossOrigin = "anonymous"

        script.onload = () => {
          console.log(`Successfully loaded: ${src}`)
          resolve()
        }

        script.onerror = (error) => {
          console.error(`Failed to load script: ${src}`, error)
          reject(new Error(`Failed to load script: ${src}`))
        }

        document.head.appendChild(script)
      })
    }

    const loadAllScripts = async () => {
      try {
        setLoadingError(null)

        // Load scripts sequentially to avoid conflicts
        await loadScript("https://cdn.jsdelivr.net/npm/artplayer/dist/artplayer.js")
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.4.10/hls.min.js")
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/flv.js/1.6.2/flv.min.js")

        // Wait a bit for scripts to initialize
        await new Promise((resolve) => setTimeout(resolve, 100))

        setScriptsLoaded(true)
        setAuthKey(generateAuthKey())
      } catch (error) {
        console.error("Failed to load scripts:", error)
        setLoadingError("Failed to load video player. Please refresh the page.")
      }
    }

    loadAllScripts()
  }, [])

  // Initialize ArtPlayer with better error handling
  const initializePlayer = (streamUrl: string) => {
    if (!scriptsLoaded || !window.Artplayer || !playerRef.current) {
      console.warn("Player not ready:", {
        scriptsLoaded,
        Artplayer: !!window.Artplayer,
        playerRef: !!playerRef.current,
      })
      return
    }

    try {
      if (artPlayerRef.current) {
        artPlayerRef.current.destroy()
      }

      artPlayerRef.current = new window.Artplayer({
        container: playerRef.current,
        url: streamUrl,
        autoplay: false, // Changed to false to avoid autoplay issues
        isLive: true,
        fullscreenWeb: true,
        autoOrientation: true,
        volume: 0.7,
        muted: false,
        layers: [
          {
            html: '<span style="color:yellow; font-weight: 700; font-size: smaller;">FBStream</span>',
            style: { position: "absolute", top: "10px", right: "10px", opacity: "0.8" },
          },
        ],
        controls: [
          {
            position: "left",
            html: '<svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="#FFF"><path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z"/></svg>',
            index: 20,
            tooltip: "Reload Stream",
            click: () => {
              if (artPlayerRef.current) {
                artPlayerRef.current.url = streamUrl
              }
            },
          },
          {
            position: "left",
            html: '<span style="display: flex; align-items: center; color: white; font-size: 12px;"><span style="height: 6px; width: 6px; background-color: red; border-radius: 50%; margin-right: 5px;"></span>LIVE</span>',
            index: 40,
          },
        ],
        customType: {
          m3u8: (video: HTMLVideoElement, url: string, art: any) => {
            if (window.Hls && window.Hls.isSupported()) {
              if (art.hls) art.hls.destroy()
              const hls = new window.Hls({
                enableWorker: false,
                lowLatencyMode: true,
              })
              hls.loadSource(url)
              hls.attachMedia(video)
              art.hls = hls
              art.on("destroy", () => {
                if (hls) hls.destroy()
              })
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
              video.src = url
            } else {
              console.error("HLS not supported")
            }
          },
          flv: (video: HTMLVideoElement, url: string, art: any) => {
            if (window.flvjs && window.flvjs.isSupported()) {
              if (art.flv) art.flv.destroy()
              const flv = window.flvjs.createPlayer({
                type: "flv",
                url: url,
                isLive: true,
              })
              flv.attachMediaElement(video)
              flv.load()
              art.flv = flv
              art.on("destroy", () => {
                if (flv) flv.destroy()
              })
            } else {
              console.error("FLV not supported")
            }
          },
        },
      })

      // Add event listeners
      artPlayerRef.current.on("ready", () => {
        console.log("Player ready")
      })

      artPlayerRef.current.on("error", (error: any) => {
        console.error("Player error:", error)
      })

      onStreamChange?.(streamUrl)
    } catch (error) {
      console.error("Failed to initialize player:", error)
      setLoadingError("Failed to initialize video player")
    }
  }

  // Detect theme from document
  const getCurrentTheme = () => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark") ? "dark" : "light"
    }
    return "light"
  }

  // Listen for theme changes and update ArtPlayer background
  useEffect(() => {
    const updateTheme = () => {
      const theme = getCurrentTheme()
      if (playerRef.current) {
        playerRef.current.style.background = theme === "dark" ? "#18181b" : "#fff"
      }
    }
    updateTheme()
    document.documentElement.addEventListener("classlistchange", updateTheme)
    return () => {
      document.documentElement.removeEventListener("classlistchange", updateTheme)
    }
  }, [])

  // Track playback time for data usage
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (artPlayerRef.current) {
      artPlayerRef.current.on("play", () => {
        setPlayStartTime(Date.now())
      })
      artPlayerRef.current.on("pause", () => {
        setPlayStartTime(null)
      })
      artPlayerRef.current.on("destroy", () => {
        setPlayStartTime(null)
      })
    }
    if (playStartTime) {
      interval = setInterval(() => {
        const elapsedSec = (Date.now() - playStartTime) / 1000
        // Data usage in MB: bitrate(Mbps) * seconds / 8 (bits to bytes)
        setDataUsage((prev) => prev + (BITRATE_MBPS * (1 / 8)))
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [playStartTime, selectedStream, scriptsLoaded])

  // Track real downloaded data from video element
  useEffect(() => {
    let videoEl: HTMLVideoElement | null = null
    let lastBytesLoaded = 0

    const updateUsage = () => {
      if (!videoEl) return
      try {
        // For most browsers, video.buffered and video.seekable are available
        // But bytes loaded is not directly exposed, so we estimate using buffer ranges
        if (videoEl.buffered.length > 0) {
          // Estimate bytes loaded by duration buffered * bitrate
          const bufferedSeconds = videoEl.buffered.end(videoEl.buffered.length - 1) - videoEl.buffered.start(0)
          // Use actual bitrate if available, else fallback to BITRATE_MBPS
          const bitrate = BITRATE_MBPS * 1024 * 1024 // bits per second
          const bytesLoaded = bufferedSeconds * bitrate / 8 // bytes
          if (bytesLoaded > lastBytesLoaded) {
            lastBytesLoaded = bytesLoaded
            setRealDataUsage(bytesLoaded / (1024 * 1024)) // MB
          }
        }
      } catch (e) {
        // ignore errors
      }
    }

    if (playerRef.current) {
      // Find video element inside player
      videoEl = playerRef.current.querySelector("video")
      if (videoEl) {
        videoEl.addEventListener("progress", updateUsage)
        videoEl.addEventListener("loadeddata", updateUsage)
      }
    }

    return () => {
      if (videoEl) {
        videoEl.removeEventListener("progress", updateUsage)
        videoEl.removeEventListener("loadeddata", updateUsage)
      }
    }
  }, [selectedStream, scriptsLoaded])

  // Handle stream selection
  const handleStreamSelect = (stream: StreamLink) => {
    const streamUrl = generateStreamUrl(stream.url, stream.name)
    setSelectedStream(streamUrl)
    initializePlayer(streamUrl)
  }

  // Initialize with first stream
  useEffect(() => {
    if (scriptsLoaded && streams && streams.length > 0 && !selectedStream && !loadingError) {
      const firstStream = streams.find((s) => s.name.includes("HD")) || streams[0]
      handleStreamSelect(firstStream)
    }
  }, [scriptsLoaded, streams, selectedStream, loadingError])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (artPlayerRef.current) {
        try {
          artPlayerRef.current.destroy()
        } catch (error) {
          console.error("Error destroying player:", error)
        }
      }
    }
  }, [])

  if (!streams || streams.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No streams available for this match</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loadingError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{loadingError}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Refresh Page
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!scriptsLoaded) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading video player...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <Card>
        <CardContent className="p-0">
          <div
            ref={playerRef}
            className="w-full rounded-lg overflow-hidden"
            style={{
              aspectRatio: "16/9",
              minHeight: "300px",
              background: getCurrentTheme() === "dark" ? "#18181b" : "#fff",
            }}
          />
        </CardContent>
      </Card>

      {/* Stream Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Available Streams</h3>
            <Badge variant="outline">{streams.length} streams</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {streams.map((stream, index) => {
              const streamUrl = generateStreamUrl(stream.url, stream.name)
              const isSelected = selectedStream === streamUrl
              return (
                <Button
                  key={index}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => handleStreamSelect(stream)}
                  className="h-auto py-3 flex flex-col items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  <span className="text-xs font-medium">{stream.name}</span>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stream Info */}
      {selectedStream && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Current Stream</h4>
              <Button onClick={() => selectedStream && initializePlayer(selectedStream)} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload
              </Button>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <code className="text-xs break-all">{selectedStream}</code>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
