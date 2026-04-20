import { NextResponse } from "next/server";
import { signSession, COOKIE_NAME, MAX_AGE } from "@/lib/auth";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (
    username !== process.env.AUTH_USERNAME ||
    password !== process.env.AUTH_PASSWORD
  ) {
    return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
  }

  const token = await signSession(username);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/"
  });

  return response;
}
