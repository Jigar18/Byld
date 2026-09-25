import { NextRequest, NextResponse } from "next/server";
import { getUserAccessTokenById } from "@/lib/accessToken";
import { getSession } from "@/lib/session";

type GitHubProfile = {
  name?: string | null;
  location?: string | null;
};

type GitHubEmail = {
  email: string;
  primary: boolean;
  verified: boolean;
};

const githubGet = (path: string, token: string) =>
  fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    signal: AbortSignal.timeout(10_000),
  });

// Prefills onboarding with the GitHub name, location and primary email.
export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    const token = await getUserAccessTokenById(session.userId);
    if (!token) return NextResponse.json({ error: "GitHub profile is unavailable" }, { status: 404 });
    const [profileResponse, emailsResponse] = await Promise.all([
      githubGet("/user", token),
      githubGet("/user/emails", token),
    ]);
    if (!profileResponse.ok && !emailsResponse.ok) {
      return NextResponse.json({ error: "GitHub profile is unavailable" }, { status: 502 });
    }

    const profile: GitHubProfile = profileResponse.ok ? await profileResponse.json() : {};
    const emailData: unknown = emailsResponse.ok ? await emailsResponse.json() : [];
    const emails = Array.isArray(emailData) ? (emailData as GitHubEmail[]) : [];
    const parts = profile.name?.trim().split(/\s+/).filter(Boolean) ?? [];
    return NextResponse.json({
      firstName: parts[0] ?? "",
      lastName: parts.slice(1).join(" "),
      location: profile.location?.trim() ?? "",
      email: (emails.find((item) => item.primary) ?? emails.find((item) => item.verified))?.email ?? "",
    });
  } catch {
    return NextResponse.json({ error: "GitHub profile is unavailable" }, { status: 502 });
  }
}
