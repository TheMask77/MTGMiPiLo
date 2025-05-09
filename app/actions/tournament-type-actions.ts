"use server"

import { sql } from "@/lib/db"

export async function getTournamentTypes() {
  try {
    const tournamentTypes = await sql`SELECT id, name FROM tournament_types ORDER BY name`
    return { success: true, data: tournamentTypes }
  } catch (error) {
    console.error("Error fetching tournament types:", error)
    return { success: false, error: "Failed to fetch tournament types" }
  }
}
