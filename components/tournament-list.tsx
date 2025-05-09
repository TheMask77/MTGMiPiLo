"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { calculateProfit, formatResult } from "@/lib/db"

interface Tournament {
  id: number
  type: string
  deck: string
  format: string
  date: string
  cost: number
  wins: number
  losses: number
  prize: number
}

interface TournamentListProps {
  tournaments: Tournament[]
}

export function TournamentList({ tournaments }: TournamentListProps) {
  const [sortColumn, setSortColumn] = useState<string>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const sortedTournaments = [...tournaments].sort((a, b) => {
    if (sortColumn === "date") {
      return sortDirection === "asc"
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime()
    }
    if (sortColumn === "profit") {
      const profitA = calculateProfit(a.cost, a.prize)
      const profitB = calculateProfit(b.cost, b.prize)
      return sortDirection === "asc" ? profitA - profitB : profitB - profitA
    }
    return 0
  })

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("desc")
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Deck</TableHead>
            <TableHead>Format</TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
              Date {sortColumn === "date" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Result</TableHead>
            <TableHead>Prize</TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("profit")}>
              Profit/Loss {sortColumn === "profit" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTournaments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center h-24">
                No tournaments found
              </TableCell>
            </TableRow>
          ) : (
            sortedTournaments.map((tournament) => (
              <TableRow key={tournament.id}>
                <TableCell>{tournament.type}</TableCell>
                <TableCell>{tournament.deck}</TableCell>
                <TableCell>{tournament.format}</TableCell>
                <TableCell>{format(new Date(tournament.date), "MMM d, yyyy")}</TableCell>
                <TableCell>${tournament.cost.toFixed(2)}</TableCell>
                <TableCell>{formatResult(tournament.wins, tournament.losses)}</TableCell>
                <TableCell>${tournament.prize.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={getProfitVariant(tournament.cost, tournament.prize)}>
                    {getProfitLabel(tournament.cost, tournament.prize)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/tournaments/${tournament.id}`}>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function getProfitVariant(cost: number, prize: number): "default" | "success" | "destructive" {
  const profit = calculateProfit(cost, prize)
  if (profit > 0) return "success"
  if (profit < 0) return "destructive"
  return "default"
}

function getProfitLabel(cost: number, prize: number): string {
  const profit = calculateProfit(cost, prize)
  if (profit > 0) return `+$${profit.toFixed(2)}`
  if (profit < 0) return `-$${Math.abs(profit).toFixed(2)}`
  return "Break Even"
}
