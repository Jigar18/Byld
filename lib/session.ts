import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export const SESSION_COOKIE = "id&Uname";

export type Session = {
  userId: string;
  username: string;
};

export async function verifySessionToken(token: string | undefined): Promise<Session | null> {
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
    });
    if (typeof payload.userId !== "string" || typeof payload.username !== "string") return null;
    return { userId: payload.userId, username: payload.username };
  } catch {
    return null;
  }
}

export async function getSession(req: NextRequest): Promise<Session | null> {
  return verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
}

export async function getRequestUserId(request: NextRequest) {
  return (await getSession(request))?.userId ?? null;
}
