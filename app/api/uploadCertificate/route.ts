import { NextRequest, NextResponse } from "next/server";
import { removeStoredFile, uploadPdfFile } from "@/utils/uploadFiles";
import { PdfUploadRResponse } from "@/types/api";
import { db } from "@/lib/db";
import { isPdf } from "@/utils/fileValidation";
import { getSession } from "@/lib/session";

const MAX_CERTIFICATE_BYTES = 3 * 1024 * 1024;
const MAX_MULTIPART_BYTES = MAX_CERTIFICATE_BYTES + 1024 * 1024;

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
        { success: false, error: "File size must be less than 3MB" },
        { status: 413 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("pdf") as File | null;
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No pdf file provided" },
        { status: 400 }
      );
    }

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: "Certificate title and description are required" },
        { status: 400 }
      );
    }
    if (title.length > 200 || description.length > 2_000) {
      return NextResponse.json(
        { success: false, error: "Certificate details are too long" },
        { status: 400 },
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_CERTIFICATE_BYTES) {
      return NextResponse.json(
        { success: false, error: "File size must be less than 3MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    if (!isPdf(buffer)) {
      return NextResponse.json(
        { success: false, error: "The uploaded file is not a valid PDF" },
        { status: 400 },
      );
    }

    const pdfUrl = await uploadPdfFile(
      buffer,
      file.name || "certificate.pdf",
      userId
    );

    let certificate;
    try {
      certificate = await db.certifications.create({
        data: { userId, title, description, pdfUrl },
      });
    } catch (error) {
      await removeStoredFile(pdfUrl, "certificates", `certifications/${userId}-`).catch((cleanupError) =>
        console.error("Unable to clean up the unsaved certificate file:", cleanupError)
      );
      throw error;
    }

    const response: PdfUploadRResponse & { certificate: typeof certificate } = {
      success: true,
      pdfUrl,
      certificate,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error uploading certificate:", error);
    const errorResponse: PdfUploadRResponse = {
      success: false,
      error: "Unable to upload certificate",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
