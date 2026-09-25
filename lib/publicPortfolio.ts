import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function resolvePortfolioUser(request: NextRequest) {
  const requestedUsername = request.nextUrl.searchParams.get("username")?.trim();
  const session = await getSession(request);

  const select = { id: true, username: true, installationId: true, showGitHubHeatmap: true };
  const user = requestedUsername
    ? await db.user.findFirst({
        where: { username: { equals: requestedUsername, mode: "insensitive" } },
        select,
      })
    : session
      ? await db.user.findUnique({
          where: { id: session.userId },
          select,
        })
      : null;

  if (!user) return null;

  return {
    ...user,
    session,
    isOwner: session?.userId === user.id,
  };
}
