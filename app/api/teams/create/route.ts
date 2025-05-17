import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const body = await req.json();
  const { name } = body;

  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if the user is already in a team
  const user = await prisma.users.findUnique({ where: { id: Number(userId) } });
  if (user?.team_id) {
    return NextResponse.json({ error: "You are already in a team" }, { status: 400 });
  }

  // Create the team and associate the user
  const team = await prisma.teams.create({
    data: {
      name,
      users: {
        connect: { id: Number(userId) },
      },
    },
  });

  return NextResponse.json(team, { status: 201 });
}