import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

const MAX_SKILLS = 50;
const MAX_SKILL_LENGTH = 80;

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const rawSkills = Array.isArray(body) ? body : body.skills;
    const selectedSkills: string[] = Array.isArray(rawSkills)
      ? Array.from(new Set(rawSkills.map((skill: unknown) => {
          const value = typeof skill === "string" ? skill.trim() : "";
          return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
        })))
      : [];

    if (
      selectedSkills.length > MAX_SKILLS ||
      selectedSkills.some((skill) => !skill || skill.length > MAX_SKILL_LENGTH)
    ) {
      return NextResponse.json({ success: false, error: "Skills must be a list of names" }, { status: 400 });
    }

    const requestedIconMap =
      !Array.isArray(body) && body.iconMap && typeof body.iconMap === "object"
        ? body.iconMap
        : {};
    const iconMap: Record<string, string | null> = {};
    selectedSkills.forEach((skill) => {
      const icon = requestedIconMap[skill];
      if (icon === null) {
        iconMap[skill] = null;
      } else if (
        typeof icon === "string" &&
        /^[a-z0-9-]+:[a-z0-9-]+$/.test(icon) &&
        icon.length <= 120
      ) {
        iconMap[skill] = icon;
      }
    });

    const existingSkill = await db.skill.findFirst({
      where: {
        userId: session.userId,
      },
    });

    if (existingSkill) {
      await db.skill.update({
        where: {
          id: existingSkill.id,
        },
        data: {
          skills: selectedSkills,
          iconMap,
        },
      });
    } else {
      await db.skill.create({
        data: {
          skills: selectedSkills,
          iconMap,
          userId: session.userId,
        },
      });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error updating skills:", error);
    return NextResponse.json(
      { success: false, error: "Unable to update skills" },
      { status: 500 }
    );
  }
}
