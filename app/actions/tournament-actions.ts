"use server"

import { sql } from "@/lib/db"
import { parseResult } from "@/lib/utils"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

export async function getTournaments() {
  try {
    const tournaments = await prisma.tournaments.findMany({
      orderBy: { date: "desc" },
      include: {
        tournament_types: { select: { name: true } },
        decks: {
          select: {
            name: true,
            formats: { select: { name: true } }
          }
        },
        user: { select: { username: true } },
      },
    });

    // Map the result to match your frontend expectations
    const mapped = tournaments.map(t => ({
      id: t.id,
      type: t.tournament_types?.name ?? "",
      deck: t.decks?.name ?? "",
      format: t.decks?.formats?.name ?? "",
      date: t.date,
      cost: t.cost,
      wins: t.wins,
      losses: t.losses,
      prize_play_points: t.prize_play_points,
      prize_chests: t.prize_chests,
      prize_qps: t.prize_qps,
      notes: t.notes,
      player_username: t.user?.username ?? "",
    }));

    return { success: true, data: mapped };
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    return { success: false, error: "Failed to fetch tournaments" };
  }
}

export async function getUserTournaments(userId: number) {
  try {
    const tournaments = await prisma.tournaments.findMany({
      where: { user_id: userId }, // Filter by user ID
      orderBy: { date: "desc" }, // Order by date (most recent first)
      include: {
        tournament_types: { select: { name: true } }, // Include tournament type name
        decks: {
          select: {
            name: true,
            formats: { select: { name: true } }, // Include deck format
          },
        },
      },
    });

    // Map the result to match your frontend expectations
    const mapped = tournaments.map((t) => ({
      id: t.id,
      type: t.tournament_types?.name ?? "",
      deck: t.decks?.name ?? "",
      format: t.decks?.formats?.name ?? "",
      date: t.date,
      cost: t.cost,
      wins: t.wins,
      losses: t.losses,
      prize_play_points: t.prize_play_points,
      prize_chests: t.prize_chests,
      prize_qps: t.prize_qps,
      notes: t.notes,
    }));

    return { success: true, data: mapped };
  } catch (error) {
    console.error("Error fetching user tournaments:", error);
    return { success: false, error: "Failed to fetch user tournaments" };
  }
}

export async function getTeamTournaments(teamId: number) {
  try {
    const tournaments = await prisma.tournaments.findMany({
      where: {
        user: {
          team_id: teamId, // Filter by team ID
        },
      },
      orderBy: { date: "desc" }, // Order by date (most recent first)
      include: {
        tournament_types: { select: { name: true } }, // Include tournament type name
        decks: {
          select: {
            name: true,
            formats: { select: { name: true } }, // Include deck format
          },
        },
        user: { select: { username: true } }, // Include the username of the player
      },
    });

    // Map the result to match your frontend expectations
    const mapped = tournaments.map((t) => ({
      id: t.id,
      type: t.tournament_types?.name ?? "",
      deck: t.decks?.name ?? "",
      format: t.decks?.formats?.name ?? "",
      date: t.date,
      cost: t.cost,
      wins: t.wins,
      losses: t.losses,
      prize_play_points: t.prize_play_points,
      prize_chests: t.prize_chests,
      prize_qps: t.prize_qps,
      notes: t.notes,
      player_username: t.user?.username ?? "Unknown", // Include the player's username
    }));

    return { success: true, data: mapped };
  } catch (error) {
    console.error("Error fetching team tournaments:", error);
    return { success: false, error: "Failed to fetch team tournaments" };
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
        t.prize_play_points,
        t.prize_chests,
        t.prize_qps,
        t.notes,
        f.name as format,
        f.id as format_id
        u.username as player_username,   
        u.email as player_email
      FROM tournaments t
      JOIN tournament_types tt ON t.tournament_type_id = tt.id
      JOIN decks d ON t.deck_id = d.id
      JOIN formats f ON d.format_id = f.id
      LEFT JOIN users u ON t.user_id = u.id    
      ORDER BY t.date DESC
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
    // Get user ID from cookie
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    // Parse form data as before
    const tournamentTypeId = Number.parseInt(formData.get("type") as string);
    const deckId = Number.parseInt(formData.get("deck") as string);
    const date = formData.get("date") as string;
    const result = formData.get("result") as string;
    const { wins, losses } = parseResult(result);

    const typeNameRecord = await prisma.tournament_types.findUnique({
      where: { id: tournamentTypeId },
      select: { name: true },
    });
    const typeName = typeNameRecord?.name || "";

    const cost = calculateCost(typeName);
    const prizes = calculatePrize(typeName, wins, losses);
    const playPointsWon = prizes?.playPoints || 0;
    const chestsWon = prizes?.chests || 0;
    const qpsWon = prizes?.qps || 0;
    const notes = formData.get("notes") as string;

    // Create tournament with Prisma
    const newTournament = await prisma.tournaments.create({
      data: {
        tournament_type_id: tournamentTypeId,
        deck_id: deckId,
        date: new Date(date),
        cost,
        wins,
        losses,
        prize_play_points: playPointsWon,
        prize_chests: chestsWon,
        prize_qps: qpsWon,
        notes,
        user_id: Number(userId), // Use the user ID from the cookie
      },
      select: { id: true },
    });

    revalidatePath("/tournaments");
    revalidatePath("/");

    return { success: true, data: newTournament };
  } catch (error) {
    console.error("Error creating tournament:", error);
    return { success: false, error: "Failed to create tournament" };
  }
}

function calculateCost(typeName: string): number {
  typeName = typeName.toLowerCase();
  var cost = 0;
  if (typeName.includes("league")) {
    cost = 100; // 10 Event Tickets
  } else if (typeName.includes("preliminary")) {
    cost = 200; // 20 Event Tickets
  } else if (typeName.includes("challenge")) {
    if (typeName.includes("32")) {
      cost = 250; // 25 Event Tickets
    }
    if (typeName.includes("64")) {
      cost = 300; // 30 Event Tickets
    }
  } else {
    cost = 0; // Default or unknown type
  }

  return cost;
}

function calculatePrize(typeName: string, wins: number, losses: number): Record<string, number> | undefined {
  typeName = typeName.toLowerCase();
  if (typeName.includes("league")) {
    // Constructed League prize structure
    const prizeTableLeagues: Record<number, { playPoints: number; chests: number; qps: number }> = {
      5: { playPoints: 150, chests: 10, qps: 3 },
      4: { playPoints: 120, chests: 5, qps: 2 },
      3: { playPoints: 100, chests: 1, qps: 1 },
      2: { playPoints: 0, chests: 0, qps: 0 },
      1: { playPoints: 0, chests: 0, qps: 0 },
      0: { playPoints: 0, chests: 0, qps: 0 },
    };
    return prizeTableLeagues[Math.min(wins, 5)] || { playPoints: 0, chests: 0, qps: 0 };
  }

  return { tix: 0, chests: 0, qps: 0 }; // Default return value
  /*
  } else if (typeName.includes("preliminary")) {
    // Constructed Preliminary prize structure
    const prizeTablePrelim: Record<number, number> = {
      4: 400,
      3: 200,
      2: 100,
      1: 0,
      0: 0,
    };
    return prizeTablePrelim[Math.min(wins, 4)] || 0;
  } else if (typeName.includes("challenge")) {
    // Challenge events have varying prize structures; implement as needed
    // For simplicity, return a placeholder value
    return 0;
  } else {
    return 0; // Default or unknown type
  }
    */
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
    const [totalPrizes] = await sql`SELECT COALESCE(SUM(prize_play_points), 0) as total FROM tournaments`

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
        COALESCE(SUM(t.prize_play_points - t.cost), 0) as profit
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
