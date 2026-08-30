import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getInstallationAccessTokenById,
  getUserAccessTokenById,
} from "@/lib/accessToken";
import { resolvePortfolioUser } from "@/lib/publicPortfolio";
import { getSession } from "@/lib/session";

const CONTRIBUTIONS_QUERY = `
  query ContributionCalendar(
    $login: String!
    $calendarFrom: DateTime!
    $yearFrom: DateTime!
    $to: DateTime!
  ) {
    user(login: $login) {
      calendar: contributionsCollection(from: $calendarFrom, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              color
              contributionCount
              contributionLevel
              date
              weekday
            }
          }
        }
      }
      year: contributionsCollection(from: $yearFrom, to: $to) {
        contributionCalendar {
          totalContributions
        }
      }
    }
  }
`;

type ContributionDay = {
  color: string;
  contributionCount: number;
  contributionLevel:
    | "NONE"
    | "FIRST_QUARTILE"
    | "SECOND_QUARTILE"
    | "THIRD_QUARTILE"
    | "FOURTH_QUARTILE";
  date: string;
  weekday: number;
};

type GitHubContributionResponse = {
  data?: {
    user?: {
      calendar: {
        contributionCalendar: {
          totalContributions: number;
          weeks: Array<{ contributionDays: ContributionDay[] }>;
        };
      };
      year: {
        contributionCalendar: {
          totalContributions: number;
        };
      };
    } | null;
  };
  errors?: Array<{ message: string }>;
};

const fetchContributionCalendar = async (
  accessToken: string,
  username: string,
  calendarFrom: string,
  yearFrom: string,
  to: string,
) => {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "User-Agent": "portfolio-creator",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      query: CONTRIBUTIONS_QUERY,
      variables: { login: username, calendarFrom, yearFrom, to },
    }),
    cache: "no-store",
  });

  return {
    response,
    data: (await response.json()) as GitHubContributionResponse,
  };
};

export async function GET(request: NextRequest) {
  try {
    const portfolioUser = await resolvePortfolioUser(request);
    if (!portfolioUser) {
      return NextResponse.json({ success: false, error: "Portfolio not found" }, { status: 404 });
    }

    const user = await db.user.findUnique({
      where: { id: portfolioUser.id },
      select: {
        username: true,
        installationId: true,
        showGitHubHeatmap: true,
      },
    });
    if (!user) {
      return NextResponse.json({ success: false, error: "Portfolio not found" }, { status: 404 });
    }
    if (!portfolioUser.isOwner && !user.showGitHubHeatmap) {
      return NextResponse.json({ success: true, visible: false });
    }
    let githubAccessToken: string | null = null;
    try {
      githubAccessToken = await getUserAccessTokenById(portfolioUser.id);
    } catch (error) {
      console.error(
        "Unable to refresh the GitHub user token for contributions",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
    if (!githubAccessToken && user.installationId) {
      try {
        githubAccessToken = await getInstallationAccessTokenById(user.installationId);
      } catch (error) {
        console.error(
          "Unable to create GitHub installation token for contributions",
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }

    if (!githubAccessToken) {
      return NextResponse.json({ success: true, visible: user.showGitHubHeatmap, available: false });
    }

    const now = new Date();
    const contributionYear = now.getUTCFullYear();
    const calendarStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    calendarStart.setUTCDate(calendarStart.getUTCDate() - 364);
    const calendarFrom = calendarStart.toISOString();
    const yearFrom = `${contributionYear}-01-01T00:00:00.000Z`;
    const to = now.toISOString();
    let result = await fetchContributionCalendar(
      githubAccessToken,
      user.username,
      calendarFrom,
      yearFrom,
      to,
    );

    if (result.response.status === 401 && user.installationId) {
      try {
        const installationToken = await getInstallationAccessTokenById(user.installationId);
        result = await fetchContributionCalendar(
          installationToken,
          user.username,
          calendarFrom,
          yearFrom,
          to,
        );
      } catch (error) {
        console.error(
          "Unable to retry GitHub contributions with an installation token",
          error instanceof Error ? error.message : "Unknown error",
        );
      }
    }

    const { response: githubResponse, data: githubData } = result;
    const calendar = githubData.data?.user?.calendar.contributionCalendar;
    const currentYearContributions =
      githubData.data?.user?.year.contributionCalendar.totalContributions;
    if (
      !githubResponse.ok ||
      githubData.errors?.length ||
      !calendar ||
      currentYearContributions === undefined
    ) {
      console.error("GitHub contribution query failed", githubData.errors ?? githubResponse.status);
      return NextResponse.json(
        { success: false, error: "GitHub contribution activity is unavailable" },
        { status: 502 }
      );
    }

    const response = NextResponse.json({
      success: true,
      visible: user.showGitHubHeatmap,
      available: true,
      contributionYear,
      currentYearContributions,
      calendar,
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("Failed to load GitHub contributions", error);
    return NextResponse.json(
      { success: false, error: "Unable to load GitHub contribution activity" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { visible?: unknown };
    if (typeof body.visible !== "boolean") {
      return NextResponse.json({ success: false, error: "Visibility must be a boolean" }, { status: 400 });
    }

    await db.user.update({
      where: { id: session.userId },
      data: { showGitHubHeatmap: body.visible },
    });
    return NextResponse.json({ success: true, visible: body.visible });
  } catch (error) {
    console.error("Failed to update GitHub heatmap visibility", error);
    return NextResponse.json({ success: false, error: "Unable to update visibility" }, { status: 500 });
  }
}
