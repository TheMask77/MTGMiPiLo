"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { calculateWinRate } from "@/lib/utils"

interface Deck {
  id: number
  name: string
  format: string
  tournamentCount: number
  wins: number
  losses: number
  avgProfit: number
}

interface DeckListProps {
  decks: Deck[]
}

export function DeckList({ decks }: DeckListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Format</TableHead>
            <TableHead>Tournaments</TableHead>
            <TableHead>Record</TableHead>
            <TableHead>Win Rate</TableHead>
            <TableHead>Avg. Profit</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {decks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center h-24">
                No decks found
              </TableCell>
            </TableRow>
          ) : (
            decks.map((deck) => (
              <TableRow key={deck.id}>
                <TableCell className="font-medium">{deck.name}</TableCell>
                <TableCell>{deck.format}</TableCell>
                <TableCell>{deck.tournamentCount}</TableCell>
                <TableCell>
                  {deck.wins}-{deck.losses}
                </TableCell>
                <TableCell>
                  <Badge variant={getWinRateVariant(calculateWinRate(deck.wins, deck.losses))}>
                    {calculateWinRate(deck.wins, deck.losses)}%
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getProfitVariant(deck.avgProfit)}>{getProfitLabel(deck.avgProfit)}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/decks/${deck.id}`}>
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

function getWinRateVariant(winRate: number): "default" | "success" | "destructive" {
  if (winRate >= 60) return "success"
  if (winRate < 40) return "destructive"
  return "default"
}

function getProfitVariant(profit: number): "default" | "success" | "destructive" {
  if (profit > 0) return "success"
  if (profit < 0) return "destructive"
  return "default"
}

function getProfitLabel(profit: number): string {
  if (profit > 0) return `+PP ${profit.toFixed(0)}`
  if (profit < 0) return `-PP ${Math.abs(profit).toFixed(0)}`
  return "PP 0"
}
