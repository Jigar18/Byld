import { NextRequest, NextResponse } from "next/server";
import { deleteProjectImage, isOwnedProjectImage } from "@/lib/cloudinary";
import { db } from "@/lib/db";
import { getRequestUserId } from "@/lib/session";

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getRequestUserId(request);
    const publicId = (await request.json() as { publicId?: unknown }).publicId;
    if (!userId || typeof publicId !== "string" || !isOwnedProjectImage(publicId, userId)) {
      return NextResponse.json({ success: false, error: "Image not found" }, { status: 404 });
    }

    const savedImage = await db.projectImage.findFirst({ where: { imagePublicId: publicId, project: { userId } }, select: { id: true } });
    if (savedImage) return NextResponse.json({ success: false, error: "A saved project is using this image" }, { status: 409 });

    await deleteProjectImage(publicId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unable to remove the image" }, { status: 500 });
  }
}
