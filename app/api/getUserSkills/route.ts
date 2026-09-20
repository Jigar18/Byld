import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { portfolioLookupStatus, resolvePortfolioUser } from "@/lib/publicPortfolio";

export async function GET(req: NextRequest) {
  try {
    const user = await resolvePortfolioUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Portfolio not found" },
        { status: portfolioLookupStatus(req) }
      );
    }

    const userSkills = await db.skill.findFirst({
      where: { userId: user.id },
      select: { skills: true, iconMap: true },
    });

    const skills = userSkills?.skills ?? [];
    const storedIconMap = userSkills?.iconMap;
    const iconMap =
      storedIconMap &&
      typeof storedIconMap === "object" &&
      !Array.isArray(storedIconMap)
        ? storedIconMap
        : {};

    return NextResponse.json({
      success: true,
      skills,
      iconMap,
    });
  } catch (error) {
    console.error("Error fetching user skills:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user skills" },
      { status: 500 }
    );
  }
}
