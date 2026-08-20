import { NextRequest, NextResponse } from "next/server";
import { getCertificateFile } from "@/lib/certificateFile";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ error: "Certificate ID is required" }, { status: 400 });
  }

  try {
    const file = await getCertificateFile(id);
    if (!file) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    return new NextResponse(file.body, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "Content-Security-Policy": "sandbox",
        "Content-Type": "application/pdf",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Certificate is unavailable" }, { status: 502 });
  }
}
