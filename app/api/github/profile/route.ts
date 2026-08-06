import { NextRequest, NextResponse } from "next/server";
import { getUserAccessTokenById } from "@/lib/accessToken";
import { getSession } from "@/lib/session";

type GitHubProfile = {
  name?: string | null;
  location?: string | null;
};

function splitName(name: string | null | undefined) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  return {
    firstName: parts[0] ?? "",
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : "",
  };
}

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    const token = await getUserAccessTokenById(session.userId);
    if (!token) return NextResponse.json({ error: "GitHub profile is unavailable" }, { status: 404 });
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return NextResponse.json({ error: "GitHub profile is unavailable" }, { status: 502 });
    const profile = (await response.json()) as GitHubProfile;
    return NextResponse.json({ ...splitName(profile.name), location: profile.location?.trim() ?? "" });
  } catch {
    return NextResponse.json({ error: "GitHub profile is unavailable" }, { status: 502 });
  }
}
