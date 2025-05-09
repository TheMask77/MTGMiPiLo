"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getDecks() {
  try {
    const decks = await sql`
      SELECT 
        d.id, 
        d.name, 
        f.name as format,
        f.id as format_id,
        d.description
      FROM decks d
      JOIN formats f ON d.format_id = f.id
      ORDER BY d.name
    `

    return { success: true, data: decks }
  } catch (error) {
    console.error("Error fetching decks:", error)
    return { success: false, error: "Failed to fetch decks" }
  }
}

export async function getDeckById(id: number) {
  try {
    const [deck] = await sql`
      SELECT 
        d.id, 
        d.name, 
        f.name as format,
        f.id as format_id,
        d.description
      FROM decks d
      JOIN formats f ON d.format_id = f.id
      WHERE d.id = ${id}
    `

    return { success: true, data: deck }
  } catch (error) {
    console.error("Error fetching deck:", error)
    return { success: false, error: "Failed to fetch deck" }
  }
}

export async function getDeckStats(id: number) {
  try {
    // Get tournament count
    const [tournamentCount] = await sql`
      SELECT COUNT(*) as count FROM tournaments WHERE deck_id = ${id}
    `

    // Get win/loss record
    const [record] = await sql`
      SELECT 
        COALESCE(SUM(wins), 0) as wins,
        COALESCE(SUM(losses), 0) as losses
      FROM tournaments 
      WHERE deck_id = ${id}
    `

    // Get financial stats
    const [financials] = await sql`
      SELECT 
        COALESCE(SUM(cost), 0) as total_cost,
        COALESCE(SUM(prize), 0) as total_prize,
        COALESCE(SUM(prize - cost), 0) as total_profit,
        COALESCE(AVG(prize - cost), 0) as avg_profit
      FROM tournaments 
      WHERE deck_id = ${id}
    `

    // Get recent tournaments
    const recentTournaments = await sql`
      SELECT 
        t.id, 
        tt.name as type, 
        t.date, 
        t.cost, 
        t.wins, 
        t.losses, 
        t.prize
      FROM tournaments t
      JOIN tournament_types tt ON t.tournament_type_id = tt.id
      WHERE t.deck_id = ${id}
      ORDER BY t.date DESC
      LIMIT 5
    `

    return {
      success: true,
      data: {
        tournamentCount: Number.parseInt(tournamentCount.count),
        wins: Number.parseInt(record.wins),
        losses: Number.parseInt(record.losses),
        totalCost: Number.parseFloat(financials.total_cost),
        totalPrize: Number.parseFloat(financials.total_prize),
        totalProfit: Number.parseFloat(financials.total_profit),
        avgProfit: Number.parseFloat(financials.avg_profit),
        recentTournaments,
      },
    }
  } catch (error) {
    console.error("Error fetching deck stats:", error)
    return { success: false, error: "Failed to fetch deck stats" }
  }
}

export async function getDecksWithStats() {
  try {
    // SQL query to fetch decks along with tournament count, wins, losses, and average profit
    const decksWithStats = await sql`
      SELECT 
        d.id, 
        d.name, 
        f.name as format,
        COUNT(t.id) as tournament_count,
        COALESCE(SUM(t.wins), 0) as wins,
        COALESCE(SUM(t.losses), 0) as losses,
        COALESCE(AVG(t.prize - t.cost), 0) as avg_profit
      FROM decks d
      JOIN formats f ON d.format_id = f.id
      LEFT JOIN tournaments t ON d.id = t.deck_id
      GROUP BY d.id, d.name, f.name
      ORDER BY d.name
    `;

    return { success: true, data: decksWithStats };
  } catch (error) {
    console.error("Error fetching decks with stats:", error);
    return { success: false, error: "Failed to fetch decks with stats" };
  }
}

export async function createDeck(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const formatId = Number.parseInt(formData.get("format") as string)
    const description = formData.get("description") as string

    const [newDeck] = await sql`
      INSERT INTO decks (name, format_id, description)
      VALUES (${name}, ${formatId}, ${description})
      RETURNING id
    `

    revalidatePath("/decks")

    return { success: true, data: newDeck }
  } catch (error) {
    console.error("Error creating deck:", error)
    return { success: false, error: "Failed to create deck" }
  }
}

export async function updateDeck(id: number, formData: FormData) {
  try {
    const name = formData.get("name") as string
    const formatId = Number.parseInt(formData.get("format") as string)
    const description = formData.get("description") as string

    await sql`
      UPDATE decks
      SET 
        name = ${name},
        format_id = ${formatId},
        description = ${description},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `

    revalidatePath("/decks")
    revalidatePath(`/decks/${id}`)

    return { success: true }
  } catch (error) {
    console.error("Error updating deck:", error)
    return { success: false, error: "Failed to update deck" }
  }
}

export async function deleteDeck(id: number) {
  try {
    // Check if deck is used in tournaments
    const [usageCount] = await sql`
      SELECT COUNT(*) as count FROM tournaments WHERE deck_id = ${id}
    `

    if (Number.parseInt(usageCount.count) > 0) {
      return {
        success: false,
        error: "Cannot delete deck that is used in tournaments. Remove the tournaments first.",
      }
    }

    await sql`DELETE FROM decks WHERE id = ${id}`

    revalidatePath("/decks")

    return { success: true }
  } catch (error) {
    console.error("Error deleting deck:", error)
    return { success: false, error: "Failed to delete deck" }
  }
}

export async function getFormats() {
  try {
    const formats = await sql`SELECT id, name FROM formats ORDER BY name`
    return { success: true, data: formats }
  } catch (error) {
    console.error("Error fetching formats:", error)
    return { success: false, error: "Failed to fetch formats" }
  }
}

export async function getDeckPerformance() {
  try {
    const deckPerformance = await sql`
      WITH deck_stats AS (
        SELECT 
          d.id,
          d.name,
          COUNT(t.id) as tournament_count,
          COALESCE(SUM(t.wins), 0) as total_wins,
          COALESCE(SUM(t.losses), 0) as total_losses,
          CASE 
            WHEN SUM(t.wins) + SUM(t.losses) > 0 
            THEN ROUND((SUM(t.wins)::numeric / (SUM(t.wins) + SUM(t.losses))) * 100, 1)
            ELSE 0
          END as win_rate
        FROM decks d
        LEFT JOIN tournaments t ON d.id = t.deck_id
        GROUP BY d.id, d.name
        HAVING COUNT(t.id) > 0
        ORDER BY tournament_count DESC
        LIMIT 5
      )
      SELECT 
        id,
        name,
        tournament_count as value,
        win_rate as winRate
      FROM deck_stats
    `

    return { success: true, data: deckPerformance }
  } catch (error) {
    console.error("Error fetching deck performance:", error)
    return { success: false, error: "Failed to fetch deck performance" }
  }
}
