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

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Only include platforms that are in our allowed list
    allowedPlatforms.forEach((platform) => {
      if (Object.prototype.hasOwnProperty.call(socialLinks, platform)) {
        const value = socialLinks[platform];
        if (value === "" || value === null) {
          updateData[platform] = null;
          return;
        }
        if (typeof value !== "string" || value.length > 2_048) return;

        const trimmedValue = value.trim();
        if (platform === "email") {
          const email = trimmedValue.startsWith("mailto:")
            ? trimmedValue.slice("mailto:".length)
            : trimmedValue;
          if (emailPattern.test(email)) updateData.email = email;
          return;
        }

        try {
          const url = new URL(trimmedValue);
          if (url.protocol === "https:" || url.protocol === "http:") {
            updateData[platform] = trimmedValue;
          }
        } catch {
          // Invalid links are rejected below instead of being stored.
        }
      }
    });

    const suppliedValues = Object.entries(socialLinks).filter(([platform, value]) =>
      allowedPlatforms.includes(platform) && value !== "" && value !== null,
    );
    if (suppliedValues.some(([platform]) => !(platform in updateData))) {
      return NextResponse.json(
        {
          success: false,
          error: "Enter a valid email address and use http:// or https:// for links",
        },
        { status: 400 },
      );
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

export { POST as PUT };
