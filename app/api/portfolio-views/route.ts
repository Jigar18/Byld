import { createHmac, randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolvePortfolioUser } from "@/lib/publicPortfolio";

const VISITOR_COOKIE = "portfolio_visitor_id";
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;
const ANONYMOUS_ID_PATTERN = /^[0-9a-f-]{36}$/i;
const BOT_PATTERN = /bot|crawler|spider|slurp|preview|facebookexternalhit|whatsapp/i;

function visitorHash(identifier: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is required to count portfolio views");
  return createHmac("sha256", secret).update(identifier).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const portfolioUser = await resolvePortfolioUser(request);
    if (!portfolioUser) {
      return NextResponse.json({ success: false, error: "Portfolio not found" }, { status: 404 });
    }

    const { session } = portfolioUser;
    const userAgent = request.headers.get("user-agent") ?? "";
    const isAutomatedTraffic = BOT_PATTERN.test(userAgent);
    let anonymousId = request.cookies.get(VISITOR_COOKIE)?.value;
    const clientAnonymousId = request.headers.get("x-portfolio-visitor-id");

    if (!anonymousId && clientAnonymousId && ANONYMOUS_ID_PATTERN.test(clientAnonymousId)) {
      anonymousId = clientAnonymousId;
    }
    if (!anonymousId || !ANONYMOUS_ID_PATTERN.test(anonymousId)) {
      anonymousId = randomUUID();
    }

    if (!portfolioUser.isOwner && !isAutomatedTraffic) {
      const view = {
        portfolioUserId: portfolioUser.id,
        visitorKeyHash: visitorHash(session ? `account:${session.userId}` : `anonymous:${anonymousId}`),
      };
      await db.portfolioView.upsert({
        where: { portfolioUserId_visitorKeyHash: view },
        update: { lastViewedAt: new Date() },
        create: view,
      });
    }

    const count = await db.portfolioView.count({
      where: { portfolioUserId: portfolioUser.id },
    });
    const response = NextResponse.json({ success: true, count });
    response.headers.set("Cache-Control", "no-store");

    if (!session) {
      response.cookies.set(VISITOR_COOKIE, anonymousId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: ONE_YEAR_IN_SECONDS,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Failed to count portfolio view", error);
    return NextResponse.json(
      { success: false, error: "Unable to load portfolio views" },
      { status: 500 }
    );
  }
}
