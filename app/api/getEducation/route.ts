import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { compareEducation, defaultEducation } from "@/lib/portfolioData";
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

    const education = await db.education.findMany({ where: { userId: user.id } });
    if (education.length === 0) {
      const userDetails = await db.details.findUnique({ where: { userId: user.id } });
      if (userDetails?.college) {
        const data = defaultEducation(userDetails);
        return NextResponse.json({
          success: true,
          education: [user.isOwner ? await db.education.create({ data: { ...data, userId: user.id } }) : data],
        });
      }
    }

    return NextResponse.json({ success: true, education: education.sort(compareEducation) });
  } catch (error) {
    console.error("Error fetching education:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch education" },
      { status: 500 }
    );
  }
}
