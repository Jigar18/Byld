import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getGitHubOAuthRedirectUri } from "@/lib/githubAuth";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 10 * 60,
  path: "/",
};

function safeReturnPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : null;
}

export async function GET(req: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_GITHUB_APP_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "GitHub OAuth is not configured" }, { status: 503 });
  }

  const state = randomBytes(32).toString("base64url");
  const oauthUrl = new URL("https://github.com/login/oauth/authorize");
  oauthUrl.searchParams.set("client_id", clientId);
  oauthUrl.searchParams.set("redirect_uri", getGitHubOAuthRedirectUri(req.url));
  oauthUrl.searchParams.set("scope", "read:user user:email");
  oauthUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(oauthUrl);
  response.cookies.set("github_oauth_state", state, COOKIE_OPTIONS);
  const returnTo = safeReturnPath(req.nextUrl.searchParams.get("return_to"));
  if (returnTo) {
    response.cookies.set("oauth_return_to", returnTo, COOKIE_OPTIONS);
  } else {
    response.cookies.set("oauth_return_to", "", { expires: new Date(0), path: "/" });
  }
  return response;
}
