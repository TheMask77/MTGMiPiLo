import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db"; // Replace with your Prisma client or database connection

export async function POST(req: Request) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;
  try {
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Remove the user from the team
    await prisma.users.update({
      where: { id: Number(userId) },
      data: { team_id: null },
    });

    return NextResponse.json({ message: "Successfully left the team" }, { status: 200 });
  } catch (error) {
    console.error("Error leaving team:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}