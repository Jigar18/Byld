import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { getUserAccessTokenById } from "@/lib/accessToken";
import { getSession } from "@/lib/session";
import {
  GitHubInstallationData,
  persistGitHubInstallation,
} from "@/lib/githubInstallation";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Authentication token is missing" }, { status: 401 });
    }
    const accessToken = await getUserAccessTokenById(session.userId);
    if (!accessToken) {
      return NextResponse.json({ error: "GitHub OAuth token is missing" }, { status: 401 });
    }

    const response = await axios.get<{ installations?: GitHubInstallationData[] }>("https://api.github.com/user/installations", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      params: { per_page: 100 },
      timeout: 10_000,
    });
    const installations = response.data.installations ?? [];
    if (installations.length > 0) {
      await persistGitHubInstallation(session.userId, installations[0]);
    }

    return NextResponse.json({ installations });
  } catch (error) {
    const status = axios.isAxiosError(error) && error.response?.status === 401 ? 401 : 502;
    return NextResponse.json({ error: "Unable to retrieve GitHub App installations" }, { status });
  }
}
