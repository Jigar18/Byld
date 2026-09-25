import { NextRequest, NextResponse } from "next/server";
import { deleteProjectAsset, isOwnedProjectAsset } from "@/lib/cloudinary";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function DELETE(request: NextRequest) {
  try {
    const userId = (await getSession(request))?.userId;
    const publicId = (await request.json() as { publicId?: unknown }).publicId;
    if (!userId || typeof publicId !== "string" || !isOwnedProjectAsset(publicId, userId, "video")) {
      return NextResponse.json({ success: false, error: "Video not found" }, { status: 404 });
    }

    const savedProject = await db.project.findFirst({ where: { userId, videoPublicId: publicId }, select: { id: true } });
    if (savedProject) {
      return NextResponse.json({ success: false, error: "A saved project is using this video" }, { status: 409 });
    }

    await deleteProjectAsset(publicId, "video");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unable to remove the video" },
      { status: 500 }
    );
  }
}
