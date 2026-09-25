import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function DELETE(req: NextRequest) {
  try {
    const educationId = req.nextUrl.searchParams.get("id");
    if (!educationId) {
      return NextResponse.json(
        { success: false, error: "Education ID is required" },
        { status: 400 }
      );
    }

    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication token is missing" },
        { status: 401 }
      );
    }

    const { count } = await db.education.deleteMany({
      where: { id: educationId, userId: session.userId },
    });
    if (!count) {
      return NextResponse.json(
        { success: false, error: "Education not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Education deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting education:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete education" },
      { status: 500 }
    );
  }
}
