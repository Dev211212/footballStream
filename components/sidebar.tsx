"use client"

import { Home, Calendar, Heart, Settings, User, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", icon: Home, href: "/", current: true },
  { name: "Schedule", icon: Calendar, href: "/schedule", current: false },
  { name: "Favorites", icon: Heart, href: "/favorites", current: false },
  { name: "Leagues", icon: Trophy, href: "/leagues", current: false },
  { name: "Profile", icon: User, href: "/profile", current: false },
  { name: "Settings", icon: Settings, href: "/settings", current: false },
]

export function Sidebar() {
  return (
    <div className="w-16 bg-slate-800 flex flex-col items-center py-4 space-y-4">
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">FB</span>
      </div>

      <nav className="flex flex-col space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.name}
              variant="ghost"
              size="sm"
              className={cn(
                "w-10 h-10 p-0 text-slate-400 hover:text-white hover:bg-slate-700",
                item.current && "text-white bg-slate-700",
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="sr-only">{item.name}</span>
            </Button>
          )
        })}
      </nav>
    </div>
  )
}
