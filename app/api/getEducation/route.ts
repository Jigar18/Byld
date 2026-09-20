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

    const education = await db.education.findMany({
      where: { userId: user.id },
    });

    const sortedEducation = education.sort((a, b) => {
      if (a.isCurrently && !b.isCurrently) return -1;
      if (!a.isCurrently && b.isCurrently) return 1;

      const aEndYear = a.endYear || a.startYear;
      const bEndYear = b.endYear || b.startYear;

      if (aEndYear !== bEndYear) {
        return bEndYear - aEndYear;
      }

      return b.startYear - a.startYear;
    });

    if (education.length === 0) {
      const userDetails = await db.details.findUnique({
        where: { userId: user.id },
      });

      if (userDetails?.college) {
        const data = {
          school: userDetails.college,
          degree: "Bachelor of Technology",
          field: "Computer Science",
          startYear: userDetails.startYear,
          endYear: userDetails.endYear,
          isCurrently: userDetails.endYear > new Date().getFullYear(),
        };
        const defaultEducation = user.isOwner
          ? await db.education.create({ data: { ...data, userId: user.id } })
          : data;

        return NextResponse.json({
          success: true,
          education: [defaultEducation],
        });
      }
    }

    return NextResponse.json({
      success: true,
      education: sortedEducation,
    });
  } catch (error) {
    console.error("Error fetching education:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch education" },
      { status: 500 }
    );
  }
}
