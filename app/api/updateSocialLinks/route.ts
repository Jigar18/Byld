import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { socialLinks } = body;

    if (!socialLinks || typeof socialLinks !== "object") {
      return NextResponse.json(
        { success: false, error: "Social links must be an object" },
        { status: 400 }
      );
    }

    // Prepare the data for upsert - only include defined platform columns
    const allowedPlatforms = [
      "email",
      "twitter",
      "linkedin",
      "instagram",
      "github",
      "medium",
      "blog",
      "leetcode",
      "youtube",
      "portfolio",
      "hackerrank",
    ];

    const updateData: Record<string, string | null> = {};

    // Only include platforms that are in our allowed list
    allowedPlatforms.forEach((platform) => {
      if (socialLinks.hasOwnProperty(platform)) {
        const value = socialLinks[platform];
        if (value === "" || value === null) {
          updateData[platform] = null;
          return;
        }
        if (typeof value !== "string" || value.length > 2_048) return;
        try {
          const url = new URL(value);
          const allowed = url.protocol === "https:" || url.protocol === "http:" ||
            (platform === "email" && url.protocol === "mailto:");
          if (allowed) updateData[platform] = value;
        } catch {
          // Invalid links are rejected below instead of being stored.
        }
      }
    });

    const suppliedValues = Object.entries(socialLinks).filter(([platform, value]) =>
      allowedPlatforms.includes(platform) && value !== "" && value !== null,
    );
    if (suppliedValues.some(([platform]) => !(platform in updateData))) {
      return NextResponse.json({ success: false, error: "Social links must use a valid web URL" }, { status: 400 });
    }

    // Upsert the social links record
    const updatedLinks = await db.socialLink.upsert({
      where: { userId: session.userId },
      update: updateData,
      create: {
        userId: session.userId,
        ...updateData,
      },
    });

    return NextResponse.json({
      success: true,
      socialLinks: updatedLinks,
    });
  } catch (error) {
    console.error("Error updating social links:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update social links" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  return POST(req); // Use the same logic for PUT requests
}
