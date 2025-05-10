import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/overview"
import { RecentTournaments } from "@/components/recent-tournaments"
import { DeckPerformance } from "@/components/deck-performance"
import { ProfitLossChart } from "@/components/profit-loss-chart"
import { getDashboardStats } from "@/app/actions/tournament-actions"
import { getDeckPerformance } from "@/app/actions/deck-actions"
import { getTournaments } from "@/app/actions/tournament-actions"

export default async function Dashboard() {
  const { success: statsSuccess, data: stats, error: statsError } = await getDashboardStats()
  const { success: deckSuccess, data: deckData, error: deckError } = await getDeckPerformance()
  const { success: tournamentsSuccess, data: tournaments, error: tournamentsError } = await getTournaments()

  const recentTournaments = tournamentsSuccess
    ? tournaments.slice(0, 4).map((t) => ({
        id: t.id,
        type: t.type,
        deck: t.deck,
        date: t.date,
        cost: Number.parseFloat(t.cost),
        wins: t.wins,
        losses: t.losses,
        prize: Number.parseFloat(t.prize),
      }))
    : []

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">MtGO League Tracker</h1>
          <Link href="/tournaments/new">
            <Button>Add Tournament</Button>
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tournaments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsSuccess ? stats.totalTournaments : 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsSuccess ? `${stats.winRate.toFixed(1)}%` : "0%"}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">PP {statsSuccess ? stats.totalSpent.toFixed(2) : "0.00"}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Prizes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">PP {statsSuccess ? stats.totalPrizes.toFixed(2) : "0.00"}</div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Profit/Loss Overview</CardTitle>
              <CardDescription>Your financial performance over time</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {statsSuccess ? (
                <ProfitLossChart data={stats.monthlyStats} />
              ) : (
                <div className="flex items-center justify-center h-[350px]">
                  <p className="text-muted-foreground">No data available</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Deck Performance</CardTitle>
              <CardDescription>Win rates by deck</CardDescription>
            </CardHeader>
            <CardContent>
              {deckSuccess && deckData.length > 0 ? (
                <DeckPerformance data={deckData} />
              ) : (
                <div className="flex items-center justify-center h-[300px]">
                  <p className="text-muted-foreground">No deck data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Tournament Results</CardTitle>
              <CardDescription>Your performance over time</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {statsSuccess ? (
                <Overview data={stats.monthlyStats} />
              ) : (
                <div className="flex items-center justify-center h-[350px]">
                  <p className="text-muted-foreground">No data available</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Tournaments</CardTitle>
              <CardDescription>Your latest entries</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentTournaments tournaments={recentTournaments} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
