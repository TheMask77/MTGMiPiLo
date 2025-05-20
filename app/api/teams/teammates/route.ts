import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  console.log("User ID from cookies:", userId);

  if (!userId) {
    console.error("Unauthorized request: No user ID found");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch the logged-in user's team
  const user = await prisma.users.findUnique({
    where: { id: Number(userId) },
    select: { team_id: true },
  });

  console.log("User's team ID:", user?.team_id);

  if (!user?.team_id) {
    console.error("User is not in a team");
    return NextResponse.json({ error: "You are not in a team" }, { status: 400 });
  }

  // Fetch teammates (exclude the logged-in user)
  const teammates = await prisma.users.findMany({
    where: {
      team_id: user.team_id,
      NOT: { id: Number(userId) }, // Exclude the logged-in user
    },
    select: {
      id: true,
      username: true,
    },
  });

  console.log("Teammates fetched:", teammates);

  return NextResponse.json(teammates);
}