"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BarChart3, Home, ListPlus, Swords } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <Link href="/" className="font-bold text-xl flex items-center mr-8">
          <Swords className="h-6 w-6 mr-2" />
          MtGO Tracker
        </Link>
        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-primary flex items-center ${
              pathname === "/" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </Link>
          <Link
            href="/tournaments"
            className={`text-sm font-medium transition-colors hover:text-primary flex items-center ${
              pathname.startsWith("/tournaments") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <ListPlus className="h-4 w-4 mr-2" />
            Tournaments
          </Link>
          <Link
            href="/decks"
            className={`text-sm font-medium transition-colors hover:text-primary flex items-center ${
              pathname.startsWith("/decks") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Decks
          </Link>
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <Link href="/tournaments/new">
            <Button>Add Tournament</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
