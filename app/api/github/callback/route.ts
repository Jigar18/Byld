import { timingSafeEqual } from "crypto";
import axios from "axios";
import { SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  GitHubInstallationData,
  persistGitHubInstallation,
} from "@/lib/githubInstallation";
import { getGitHubOAuthRedirectUri } from "@/lib/githubAuth";
import { hasCompletedPortfolioSetup } from "@/lib/portfolioSetup";
import { getSession, SESSION_COOKIE } from "@/lib/session";

function statesMatch(expected: string | undefined, actual: string | null) {
  if (!expected || !actual) return false;
  const left = Buffer.from(expected);
  const right = Buffer.from(actual);
  return left.length === right.length && timingSafeEqual(left, right);
}

function clearOAuthCookies(response: NextResponse) {
  for (const name of ["github_oauth_state", "oauth_return_to"]) {
    response.cookies.set(name, "", { expires: new Date(0), path: "/" });
  }
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const oauthError = req.nextUrl.searchParams.get("error");
  const installationId = req.nextUrl.searchParams.get("installation_id");
  const setupAction = req.nextUrl.searchParams.get("setup_action");
  
  if (installationId) {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: "Sign in before installing the GitHub App" }, { status: 401 });
    if (setupAction && !["install", "update"].includes(setupAction)) {
      return NextResponse.json({ error: "Invalid GitHub App setup action" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { accessToken: true },
    });
    if (!user?.accessToken) {
      return NextResponse.json({ error: "GitHub OAuth token is missing" }, { status: 401 });
    }

    try {
      const installationResponse = await axios.get<{
        installations?: GitHubInstallationData[];
      }>(
        "https://api.github.com/user/installations",
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
          params: { per_page: 100 },
          timeout: 10_000,
        }
      );
      const installation = (installationResponse.data.installations ?? []).find(
        (item) => String(item.id) === installationId
      );
      if (!installation) {
        return NextResponse.json(
          { error: "This GitHub installation does not belong to the signed-in user" },
          { status: 403 }
        );
      }

      await persistGitHubInstallation(session.userId, installation);
      const response = NextResponse.redirect(new URL("/app-installed", req.url));
      clearOAuthCookies(response);
      return response;
    } catch (error) {
      console.error("GitHub installation callback failed", error);
      return NextResponse.json({ error: "Unable to verify the GitHub App installation" }, { status: 502 });
    }
  }

  if (oauthError) {
    return NextResponse.json({ error: "GitHub authorization was declined" }, { status: 400 });
  }

  if (!code || !statesMatch(req.cookies.get("github_oauth_state")?.value, state)) {
    return NextResponse.json({ error: "Invalid or expired GitHub authorization request" }, { status: 400 });
  }

  const clientId = process.env.NEXT_PUBLIC_GITHUB_APP_CLIENT_ID;
  const clientSecret = process.env.GITHUB_APP_CLIENT_SECRET;
  const secret = process.env.JWT_SECRET;
  if (!clientId || !clientSecret || !secret) {
    return NextResponse.json({ error: "GitHub OAuth is not configured" }, { status: 503 });
  }

  try {
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: getGitHubOAuthRedirectUri(req.url),
      },
      { headers: { Accept: "application/json" }, timeout: 10_000 }
    );
    const accessToken = tokenResponse.data.access_token as string | undefined;
    if (!accessToken) {
      return NextResponse.json({ error: "GitHub did not return an access token" }, { status: 400 });
    }
    const refreshToken = tokenResponse.data.refresh_token as string | undefined;
    const expiresIn = Number(tokenResponse.data.expires_in);
    const refreshExpiresIn = Number(tokenResponse.data.refresh_token_expires_in);
    const issuedAt = Date.now();
    const tokenData = {
      accessToken,
      githubRefreshToken: refreshToken ?? null,
      githubAccessTokenUpdatedAt: new Date(issuedAt),
      githubAccessTokenExpiresAt: Number.isFinite(expiresIn)
        ? new Date(issuedAt + expiresIn * 1000)
        : null,
      githubRefreshTokenExpiresAt:
        refreshToken && Number.isFinite(refreshExpiresIn)
          ? new Date(issuedAt + refreshExpiresIn * 1000)
          : null,
    };

    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" },
      timeout: 10_000,
    });
    const user = userResponse.data as { id: number; login: string };
    if (!user.id || !user.login) {
      return NextResponse.json({ error: "GitHub returned an invalid user" }, { status: 502 });
    }

    const userDB = await db.user.upsert({
      where: { githubId: String(user.id) },
      update: { username: user.login, ...tokenData },
      create: {
        githubId: String(user.id),
        username: user.login,
        ...tokenData,
      },
      select: {
        id: true,
        username: true,
        details: {
          select: { imageUrl: true },
        },
      },
    });

    const session = await new SignJWT({ userId: userDB.id, username: userDB.username })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(new TextEncoder().encode(secret));

    const returnTo = req.cookies.get("oauth_return_to")?.value;
    const requestedTarget =
      returnTo?.startsWith("/") && !returnTo.startsWith("//") ? returnTo : null;
    const target = hasCompletedPortfolioSetup(userDB)
      ? `/${encodeURIComponent(userDB.username)}`
      : requestedTarget ?? "/app-install";
    const response = NextResponse.redirect(new URL(target, req.url));
    response.cookies.set(SESSION_COOKIE, session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    response.cookies.set("auth_token", "", { expires: new Date(0), path: "/" });
    clearOAuthCookies(response);
    return response;
  } catch (error) {
    console.error("GitHub OAuth callback failed", error);
    return NextResponse.json({ error: "GitHub authentication failed" }, { status: 502 });
  }
}
