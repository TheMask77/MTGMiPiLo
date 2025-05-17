import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { TournamentList } from "@/components/tournament-list"
import { getTournaments } from "@/app/actions/tournament-actions"

export default async function TournamentsPage() {
  const { success, data: tournaments, error } = await getTournaments()

  const formattedTournaments = success
    ? (tournaments ?? []).map((t) => ({
        id: t.id,
        type: t.type,
        deck: t.deck,
        format: t.format,
        date: typeof t.date === "string" ? t.date : t.date.toISOString(),
        cost: typeof t.cost === "number" ? t.cost : Number(t.cost),
        wins: t.wins,
        losses: t.losses,
        prize_play_points: t.prize_play_points ?? 0,
        prize_chests: t.prize_chests ?? 0,
        prize_qps: t.prize_qps ?? 0,
        player_username: t.player_username,
      }))
    : []

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Tournaments</h1>
          <Link href="/tournaments/new">
            <Button>Add Tournament</Button>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Search tournaments..." className="max-w-sm" />
          <Button variant="outline">Filter</Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All Tournaments</CardTitle>
          </CardHeader>
          <CardContent>
            <TournamentList tournaments={formattedTournaments} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
