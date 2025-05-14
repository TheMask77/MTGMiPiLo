import { NextResponse } from "next/server";

export async function POST() {
  // Remove the user_id cookie
  return NextResponse.json(
    { message: "Logged out" },
    {
      status: 200,
      headers: {
        "Set-Cookie": "user_id=; Path=/; HttpOnly; Max-Age=0;",
      },
    }
  );
}