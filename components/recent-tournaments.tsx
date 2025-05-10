import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { calculateProfit, formatResult } from "@/lib/utils"

interface Tournament {
  id: number
  type: string
  deck: string
  date: string
  cost: number
  wins: number
  losses: number
  prize_play_points: number
}

interface RecentTournamentsProps {
  tournaments: Tournament[]
}

export function RecentTournaments({ tournaments }: RecentTournamentsProps) {
  return (
    <div className="space-y-4">
      {tournaments.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">No tournaments found</p>
      ) : (
        tournaments.map((tournament) => (
          <Link href={`/tournaments/${tournament.id}`} key={tournament.id}>
            <Card key={tournament.id} className="overflow-hidden hover:bg-accent/50 transition-colors">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{tournament.type}</div>
                    <Badge variant={getProfitVariant(tournament.cost, tournament.prize_play_points)}>
                      {getProfitLabel(tournament.cost, tournament.prize_play_points)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {tournament.deck} • {formatResult(tournament.wins, tournament.losses)}
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                    <div>{formatDistanceToNow(new Date(tournament.date), { addSuffix: true })}</div>
                    <div>
                      Cost: PP {tournament.cost.toFixed(0)} • Prize: PP {tournament.prize_play_points.toFixed(0)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))
      )}
    </div>
  )
}

function getProfitVariant(cost: number, prize: number): "default" | "destructive" | "secondary" {
  const profit = calculateProfit(cost, prize)
  if (profit > 0) return "secondary"
  if (profit < 0) return "destructive"
  return "default"
}

function getProfitLabel(cost: number, prize: number): string {
  const profit = calculateProfit(cost, prize)
  if (profit > 0) return `+PP ${profit.toFixed(2)}`
  if (profit < 0) return `-PP ${Math.abs(profit).toFixed(2)}`
  return "Break Even"
}
