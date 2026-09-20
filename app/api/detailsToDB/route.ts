import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });

  try {
    const form = await req.json() as Record<string, string>;
    const startYear = Number(form.startYear);
    const endYear = Number(form.endYear);
    const school = form.school?.trim();
    const degree = form.degree?.trim();
    const field = form.field?.trim();
    if (!form.firstName?.trim() || !form.lastName?.trim() || !form.email?.trim() || !form.jobTitle?.trim() || !school || !degree || !field || !Number.isInteger(startYear) || !Number.isInteger(endYear)) {
      return NextResponse.json({ success: false, error: "Please complete all required details" }, { status: 400 });
    }

    await db.$transaction(async (tx) => {
      const details = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        location: form.location?.trim() ?? "",
        jobTitle: form.jobTitle.trim(),
        college: school,
        startYear,
        endYear,
      };
      await tx.details.upsert({
        where: { userId: session.userId },
        update: details,
        create: { ...details, userId: session.userId },
      });

      const existingEducation = await tx.education.findFirst({
        where: { userId: session.userId },
        orderBy: { createdAt: "asc" },
      });
      const educationData = {
        school,
        degree,
        field,
        startYear,
        endYear,
        isCurrently: endYear > new Date().getFullYear(),
      };

      if (existingEducation) {
        await tx.education.update({
          where: { id: existingEducation.id },
          data: educationData,
        });
      } else {
        await tx.education.create({
          data: { ...educationData, userId: session.userId },
        });
      }
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to save profile details" }, { status: 500 });
  }
}
