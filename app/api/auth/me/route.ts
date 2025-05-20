import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch user details, including team and tournaments
  const user = await prisma.users.findUnique({
    where: { id: Number(userId) },
    include: {
      team: { select: { id: true, name: true } },
      tournaments: {
        select: {
          id: true,
          date: true,
          cost: true,
          wins: true,
          losses: true,
          prize_play_points: true,
          prize_chests: true,
          prize_qps: true,
          notes: true,
          decks: { select: { name: true, formats: true } },
          tournament_types: { select: { name: true } },
          team: { select: { id: true, name: true } },
          user: { select: { id: true, username: true } },
        },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({
    id: user.id,
    username: user.username,
    email: user.email,
    team: user.team ? { id: user.team.id, name: user.team.name } : null,
    tournaments: user.tournaments.map((t) => ({
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
      player_username: t.user?.username ?? "Unknown",
    })),
  });
}