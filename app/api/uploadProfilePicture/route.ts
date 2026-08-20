import { NextRequest, NextResponse } from "next/server";
import { removeStoredFile, uploadFile } from "@/utils/uploadFiles";
import { UploadResponse } from "@/types/api";
import { db } from "@/lib/db";
import { isSupportedImage } from "@/utils/fileValidation";
import { getSession } from "@/lib/session";

const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_MULTIPART_BYTES = MAX_PROFILE_IMAGE_BYTES + 1024 * 1024;
const PROFILE_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    const userId = session.userId;

    const contentLength = Number(req.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > MAX_MULTIPART_BYTES) {
      return NextResponse.json(
        { success: false, error: "Use a JPG, PNG, or WebP image up to 5 MB" },
        { status: 413 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided" },
        { status: 400 }
      );
    }

    if (!PROFILE_IMAGE_TYPES.has(file.type) || file.size > MAX_PROFILE_IMAGE_BYTES) {
      return NextResponse.json(
        { success: false, error: "Use a JPG, PNG, or WebP image up to 5 MB" },
        { status: 400 }
      );
    }

    const previousDetails = await db.details.findUnique({
      where: { userId },
      select: { imageUrl: true },
    });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    if (!isSupportedImage(buffer, file.type)) {
      return NextResponse.json(
        { success: false, error: "The uploaded file is not a valid image" },
        { status: 400 },
      );
    }

    const imageUrl = await uploadFile(
      buffer,
      file.name || "profile-picture.jpg",
      userId,
      file.type
    );

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });
    if (!user) {
      throw new Error("Authenticated user was not found");
    }

    try {
      await db.details.update({
        where: { userId },
        data: { imageUrl },
      });
    } catch (error) {
      await removeStoredFile(imageUrl, "profile-picture", `user-image/${userId}-`).catch((cleanupError) =>
        console.error("Unable to clean up the new profile image:", cleanupError)
      );
      throw error;
    }

    if (previousDetails?.imageUrl && previousDetails.imageUrl !== imageUrl) {
      await removeStoredFile(previousDetails.imageUrl, "profile-picture", `user-image/${userId}-`).catch((cleanupError) =>
        console.error("Unable to clean up the previous profile image:", cleanupError)
      );
    }

    const response: UploadResponse = {
      success: true,
      imageUrl,
      username: user.username,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    const errorResponse: UploadResponse = {
      success: false,
      error: "Profile image upload failed",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
