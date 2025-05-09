"use server"

import { sql } from "@/lib/db"
import { parseResult } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getTournaments() {
  try {
    const tournaments = await sql`
      SELECT 
        t.id, 
        tt.name as type, 
        d.name as deck, 
        t.date, 
        t.cost, 
        t.wins, 
        t.losses, 
        t.prize, 
        t.notes,
        f.name as format
      FROM tournaments t
      JOIN tournament_types tt ON t.tournament_type_id = tt.id
      JOIN decks d ON t.deck_id = d.id
      JOIN formats f ON d.format_id = f.id
      ORDER BY t.date DESC
    `

    return { success: true, data: tournaments }
  } catch (error) {
    console.error("Error fetching tournaments:", error)
    return { success: false, error: "Failed to fetch tournaments" }
  }
}

export async function getTournamentById(id: number) {
  try {
    const [tournament] = await sql`
      SELECT 
        t.id, 
        tt.name as type, 
        tt.id as tournament_type_id,
        d.name as deck, 
        d.id as deck_id,
        t.date, 
        t.cost, 
        t.wins, 
        t.losses, 
        t.prize, 
        t.notes,
        f.name as format,
        f.id as format_id
      FROM tournaments t
      JOIN tournament_types tt ON t.tournament_type_id = tt.id
      JOIN decks d ON t.deck_id = d.id
      JOIN formats f ON d.format_id = f.id
      WHERE t.id = ${id}
    `

    return { success: true, data: tournament }
  } catch (error) {
    console.error("Error fetching tournament:", error)
    return { success: false, error: "Failed to fetch tournament" }
  }
}

export async function createTournament(formData: FormData) {
  try {
    const tournamentTypeId = Number.parseInt(formData.get("type") as string)
    const deckId = Number.parseInt(formData.get("deck") as string)
    const date = formData.get("date") as string
    const cost = Number.parseFloat(formData.get("cost") as string)
    const result = formData.get("result") as string
    const { wins, losses } = parseResult(result)
    const prize = Number.parseFloat(formData.get("prize") as string)
    const notes = formData.get("notes") as string

    const [newTournament] = await sql`
      INSERT INTO tournaments (
        tournament_type_id, 
        deck_id, 
        date, 
        cost, 
        wins, 
        losses, 
        prize, 
        notes
      ) 
      VALUES (
        ${tournamentTypeId}, 
        ${deckId}, 
        ${date}, 
        ${cost}, 
        ${wins}, 
        ${losses}, 
        ${prize}, 
        ${notes}
      )
      RETURNING id
    `

    revalidatePath("/tournaments")
    revalidatePath("/")

    return { success: true, data: newTournament }
  } catch (error) {
    console.error("Error creating tournament:", error)
    return { success: false, error: "Failed to create tournament" }
  }
}

export async function updateTournament(id: number, formData: FormData) {
  try {
    const tournamentTypeId = Number.parseInt(formData.get("type") as string)
    const deckId = Number.parseInt(formData.get("deck") as string)
    const date = formData.get("date") as string
    const cost = Number.parseFloat(formData.get("cost") as string)
    const result = formData.get("result") as string
    const { wins, losses } = parseResult(result)
    const prize = Number.parseFloat(formData.get("prize") as string)
    const notes = formData.get("notes") as string

    await sql`
      UPDATE tournaments 
      SET 
        tournament_type_id = ${tournamentTypeId},
        deck_id = ${deckId},
        date = ${date},
        cost = ${cost},
        wins = ${wins},
        losses = ${losses},
        prize = ${prize},
        notes = ${notes},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `

    revalidatePath("/tournaments")
    revalidatePath(`/tournaments/${id}`)
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Error updating tournament:", error)
    return { success: false, error: "Failed to update tournament" }
  }
}

export async function deleteTournament(id: number) {
  try {
    await sql`DELETE FROM tournaments WHERE id = ${id}`

    revalidatePath("/tournaments")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Error deleting tournament:", error)
    return { success: false, error: "Failed to delete tournament" }
  }
}

export async function getDashboardStats() {
  try {
    // Get total tournaments count
    const [totalTournaments] = await sql`SELECT COUNT(*) as count FROM tournaments`

    // Get win rate
    const [winRate] = await sql`
      SELECT 
        ROUND(SUM(wins)::numeric / NULLIF(SUM(wins) + SUM(losses), 0) * 100, 1) as win_rate
      FROM tournaments
    `

    // Get total spent
    const [totalSpent] = await sql`SELECT COALESCE(SUM(cost), 0) as total FROM tournaments`

    // Get total prizes
    const [totalPrizes] = await sql`SELECT COALESCE(SUM(prize), 0) as total FROM tournaments`

    // Get monthly stats for the last 6 months
    const monthlyStats = await sql`
      WITH months AS (
        SELECT generate_series(
          date_trunc('month', CURRENT_DATE - interval '5 months'),
          date_trunc('month', CURRENT_DATE),
          interval '1 month'
        ) as month
      )
      SELECT 
        to_char(months.month, 'Mon') as name,
        COALESCE(SUM(t.wins), 0) as wins,
        COALESCE(SUM(t.losses), 0) as losses,
        COALESCE(SUM(t.prize - t.cost), 0) as profit
      FROM months
      LEFT JOIN tournaments t ON 
        date_trunc('month', t.date) = months.month
      GROUP BY months.month
      ORDER BY months.month
    `

    return {
      success: true,
      data: {
        totalTournaments: Number.parseInt(totalTournaments.count),
        winRate: Number.parseFloat(winRate?.win_rate || "0"),
        totalSpent: Number.parseFloat(totalSpent.total),
        totalPrizes: Number.parseFloat(totalPrizes.total),
        monthlyStats,
      },
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return { success: false, error: "Failed to fetch dashboard stats" }
  }
}
