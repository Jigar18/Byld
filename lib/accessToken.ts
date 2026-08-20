import { db } from "@/lib/db";
import axios from "axios";
import { NextRequest } from "next/server";
import { getGitHubAppJwt } from "@/lib/github";
import { getSession } from "@/lib/session";

export async function getInstallationAccessTokenById(installationId: string) {
  const jwtToken = await getGitHubAppJwt();

  const tokenResponse = await axios.post(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {},
    {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      timeout: 10_000,
    }
  );

  const accessToken = tokenResponse.data.token as string | undefined;
  if (!accessToken) {
    throw new Error("No access token returned from GitHub API");
  }

  return accessToken;
}

type RefreshedGitHubToken = {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
};

export async function getUserAccessTokenById(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      accessToken: true,
      githubRefreshToken: true,
      githubAccessTokenExpiresAt: true,
      githubRefreshTokenExpiresAt: true,
    },
  });
  if (!user?.accessToken) return null;

  const refreshThreshold = Date.now() + 60_000;
  if (
    !user.githubAccessTokenExpiresAt ||
    user.githubAccessTokenExpiresAt.getTime() > refreshThreshold
  ) {
    return user.accessToken;
  }
  if (
    !user.githubRefreshToken ||
    (user.githubRefreshTokenExpiresAt &&
      user.githubRefreshTokenExpiresAt.getTime() <= refreshThreshold)
  ) {
    return user.accessToken;
  }

  const clientId = process.env.NEXT_PUBLIC_GITHUB_APP_CLIENT_ID;
  const clientSecret = process.env.GITHUB_APP_CLIENT_SECRET;
  if (!clientId || !clientSecret) return user.accessToken;

  try {
    const tokenResponse = await axios.post<RefreshedGitHubToken>(
      "https://github.com/login/oauth/access_token",
      {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: user.githubRefreshToken,
      },
      { headers: { Accept: "application/json" }, timeout: 10_000 },
    );
    const refreshed = tokenResponse.data;
    if (!refreshed.access_token || !refreshed.refresh_token) {
      throw new Error("GitHub did not return refreshed user credentials");
    }

    const refreshedAt = Date.now();
    await db.user.update({
      where: { id: userId },
      data: {
        accessToken: refreshed.access_token,
        githubRefreshToken: refreshed.refresh_token,
        githubAccessTokenUpdatedAt: new Date(refreshedAt),
        githubAccessTokenExpiresAt: refreshed.expires_in
          ? new Date(refreshedAt + refreshed.expires_in * 1000)
          : null,
        githubRefreshTokenExpiresAt: refreshed.refresh_token_expires_in
          ? new Date(refreshedAt + refreshed.refresh_token_expires_in * 1000)
          : null,
      },
    });
    return refreshed.access_token;
  } catch (error) {
    const latestUser = await db.user.findUnique({
      where: { id: userId },
      select: { accessToken: true },
    });
    if (latestUser?.accessToken && latestUser.accessToken !== user.accessToken) {
      return latestUser.accessToken;
    }
    throw error;
  }
}

// Function to get installation token for repositories and other GitHub App scopes
// this function access token scope is to get the details that app has of account like repos, pr's etc.,
export async function getInstallationAccessToken(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    throw new Error("Authentication token is missing");
  }

  try {
    const userInfo = await db.user.findUnique({
      where: { id: session.userId },
      select: { installationId: true },
    });

    if (!userInfo || !userInfo.installationId) {
      throw new Error("User installation ID not found");
    }

    return await getInstallationAccessTokenById(userInfo.installationId);
  } catch (error) {
    console.error("Error getting installation access token:", error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("GitHub API response:", {
        status: error.response.status,
        data: error.response.data,
      });
      throw new Error(
        `GitHub API error: ${error.response.status} - ${error.response.statusText}`
      );
    }
    throw new Error("Failed to get GitHub installation access token");
  }
}


//this function access token is for the scope for fetching details like email or /user things etc.,
// Storing this in the database
export async function getAccessToken(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    throw new Error("Authentication token is missing");
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { accessToken: true },
  });

  if (!user?.accessToken) {
    throw new Error("GitHub OAuth token is missing");
  }

  return user.accessToken;
}
