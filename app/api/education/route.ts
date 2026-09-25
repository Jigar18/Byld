import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { compareEducation, defaultEducation } from "@/lib/portfolioData";
import { getSession } from "@/lib/session";

const MAX_EDUCATION = 2;

type EducationInput = {
  id?: unknown;
  school?: unknown;
  degree?: unknown;
  field?: unknown;
  startYear?: unknown;
  endYear?: unknown;
  isCurrently?: unknown;
};

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

// Replaces the owner's education list in one request and returns it in display order.
export async function PUT(req: NextRequest) {
  try {
    const userId = (await getSession(req))?.userId;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication token is missing" },
        { status: 401 },
      );
    }

    const body = (await req.json()) as { education?: unknown };
    if (!Array.isArray(body.education) || body.education.length > MAX_EDUCATION) {
      return NextResponse.json(
        { success: false, error: `You can add up to ${MAX_EDUCATION} education entries` },
        { status: 400 },
      );
    }

    const entries = (body.education as EducationInput[]).map((entry) => ({
      id: typeof entry.id === "string" ? entry.id : undefined,
      school: text(entry.school),
      degree: text(entry.degree),
      field: text(entry.field),
      startYear: Number(entry.startYear),
      endYear: entry.endYear ? Number(entry.endYear) : null,
      isCurrently: entry.isCurrently === true,
    }));
    // Incomplete rows are left untouched, as the editor has always done.
    const complete = entries.filter((entry) => entry.school && entry.degree && entry.field);
    if (complete.some((entry) =>
      !Number.isInteger(entry.startYear) ||
      (entry.endYear !== null && !Number.isInteger(entry.endYear)) ||
      [entry.school, entry.degree, entry.field].some((value) => value.length > 200),
    )) {
      return NextResponse.json({ success: false, error: "Education details are invalid" }, { status: 400 });
    }

    const education = await db.$transaction(async (tx) => {
      const existingIds = new Set(
        (await tx.education.findMany({ where: { userId }, select: { id: true } })).map(({ id }) => id),
      );
      const keptIds = entries.flatMap(({ id }) => (id && existingIds.has(id) ? [id] : []));
      await tx.education.deleteMany({ where: { userId, id: { notIn: keptIds } } });

      for (const { id, ...data } of complete) {
        if (id && existingIds.has(id)) {
          await tx.education.update({ where: { id, userId }, data });
        } else {
          await tx.education.create({ data: { ...data, userId } });
        }
      }

      const saved = await tx.education.findMany({ where: { userId } });
      if (saved.length) return saved.sort(compareEducation);

      // Portfolios always show at least the college from onboarding.
      const details = await tx.details.findUnique({ where: { userId } });
      return details?.college
        ? [await tx.education.create({ data: { ...defaultEducation(details), userId } })]
        : [];
    });

    return NextResponse.json({ success: true, education });
  } catch (error) {
    console.error("Error saving education:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save education" },
      { status: 500 },
    );
  }
}
