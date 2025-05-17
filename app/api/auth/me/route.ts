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
          decks: { select: { name: true } },
          tournament_types: { select: { name: true } },
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
    team: user.team_id, 
    tournaments: user.tournaments,
  });
}