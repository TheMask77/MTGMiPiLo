"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BarChart3, Home, ListPlus, Swords, Menu, X } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = (
    <>
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
    </>
  )

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 justify-between">
        <Link href="/" className="font-bold text-xl flex items-center">
          <Swords className="h-6 w-6 mr-2" />
          MtGO Tracker
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center space-x-6 mx-6">
          <nav className="flex items-center space-x-6">
            {navLinks}
          </nav>
          <Link href="/login">
            <Button variant="outline" size="sm">Log In</Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile nav dropdown */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          {navLinks}
          <Link href="/login">
            <Button variant="outline" className="w-full">Log In</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
