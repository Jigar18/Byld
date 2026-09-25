import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { removeStoredFile } from "@/utils/uploadFiles";

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication token is missing" },
        { status: 401 }
      );
    }

    const certificateId = req.nextUrl.searchParams.get("id");
    if (!certificateId) {
      return NextResponse.json(
        { success: false, error: "Certificate ID is required" },
        { status: 400 }
      );
    }

    const certificate = await db.certifications.findFirst({
      where: { id: certificateId, userId: session.userId },
    });
    if (!certificate) {
      return NextResponse.json(
        { success: false, error: "Certificate not found" },
        { status: 404 }
      );
    }

    await removeStoredFile(certificate.pdfUrl, "certificates", `certifications/${session.userId}-`);
    await db.certifications.delete({ where: { id: certificateId } });

    return NextResponse.json({
      success: true,
      message: "Certificate deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting certificate:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete certificate" },
      { status: 500 }
    );
  }
}
