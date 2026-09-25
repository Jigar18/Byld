import { NextRequest, NextResponse } from "next/server";
import { deleteProjectAsset, isOwnedProjectAsset } from "@/lib/cloudinary";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function DELETE(request: NextRequest) {
  try {
    const userId = (await getSession(request))?.userId;
    const publicId = (await request.json() as { publicId?: unknown }).publicId;
    if (!userId || typeof publicId !== "string" || !isOwnedProjectAsset(publicId, userId, "image")) {
      return NextResponse.json({ success: false, error: "Image not found" }, { status: 404 });
    }

    const savedImage = await db.projectImage.findFirst({ where: { imagePublicId: publicId, project: { userId } }, select: { id: true } });
    if (savedImage) return NextResponse.json({ success: false, error: "A saved project is using this image" }, { status: 409 });

    await deleteProjectAsset(publicId, "image");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unable to remove the image" }, { status: 500 });
  }
}
