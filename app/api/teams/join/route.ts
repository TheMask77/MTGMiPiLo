import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const body = await req.json();
  const { teamId } = body;

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

  // Add the user to the team
  const updatedUser = await prisma.users.update({
    where: { id: Number(userId) },
    data: { team_id: teamId },
  });

  return NextResponse.json(updatedUser, { status: 200 });
}