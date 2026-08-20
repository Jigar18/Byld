import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

interface UpdateData {
  about?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  location?: string;
  jobTitle ?: string;
  college ?: string;
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      about,
      firstName,
      lastName,
      email,
      location,
      jobTitle,
      college,
    } = body;

    const values = { about, firstName, lastName, email, location, jobTitle, college };
    if (
      Object.values(values).some((value) => value !== undefined && typeof value !== "string") ||
      typeof about === "string" && about.length > 2_000 ||
      Object.entries(values).some(([key, value]) => key !== "about" && typeof value === "string" && value.length > 200)
    ) {
      return NextResponse.json({ success: false, error: "Profile fields are invalid" }, { status: 400 });
    }

    // Build the update data object dynamically
    const updateData: UpdateData = {};

    if (about !== undefined) updateData.about = about;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (location !== undefined) updateData.location = location;
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
    if (college !== undefined) updateData.college = college;

    // Ensure at least one field is being updated
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    const updatedDetails = await db.details.upsert({
      where: { userId: session.userId },
      update: updateData,
      create: {
        userId: session.userId,
        firstName: firstName || "",
        lastName: lastName || "",
        email: email || "",
        location: location || "",
        jobTitle: jobTitle || "",
        college: college || "",
        startYear: new Date().getFullYear(),
        endYear: new Date().getFullYear() + 4,
        about: about || "",
        imageUrl: "",
      },
    });

    return NextResponse.json({
      success: true,
      details: {
        firstName: updatedDetails.firstName,
        lastName: updatedDetails.lastName,
        email: updatedDetails.email,
        location: updatedDetails.location,
        jobTitle: updatedDetails.jobTitle,
        college: updatedDetails.college,
        about: updatedDetails.about,
        imageUrl: updatedDetails.imageUrl,
      },
    });
  } catch (error) {
    console.error("Error updating user details:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user details" },
      { status: 500 }
    );
  }
}
