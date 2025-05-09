import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DeckList } from "@/components/deck-list"
import { getDecksWithStats } from "@/app/actions/deck-actions" // Import the function for fetching decks


export default async function DecksPage() {
  // Fetch decks using the getDecks function from deck-actions
  const {success, data: decksWithStats, error} = await getDecksWithStats()

  const formattedDecks = decksWithStats.map((deck) => ({
    id: deck.id,
    name: deck.name,
    format: deck.format,
    tournamentCount: Number.parseInt(deck.tournament_count),
    wins: Number.parseInt(deck.wins),
    losses: Number.parseInt(deck.losses),
    avgProfit: Number.parseFloat(deck.avg_profit),
  }))

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Decks</h1>
          <Link href="/decks/new">
            <Button>Add Deck</Button>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Search decks..." className="max-w-sm" />
          <Button variant="outline">Filter</Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All Decks</CardTitle>
          </CardHeader>
          <CardContent>
            <DeckList decks={formattedDecks} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}