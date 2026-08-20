import "server-only";

import { db } from "@/lib/db";
import { isStoredFileUrl } from "@/utils/uploadFiles";

const MAX_CERTIFICATE_BYTES = 3 * 1024 * 1024;

export async function getCertificateFile(id: string) {
  const certificate = await db.certifications.findUnique({
    where: { id },
    select: { title: true, pdfUrl: true, userId: true },
  });
  if (
    !certificate ||
    !isStoredFileUrl(
      certificate.pdfUrl,
      "certificates",
      `certifications/${certificate.userId}-`,
    )
  ) {
    return null;
  }

  const response = await fetch(certificate.pdfUrl, {
    headers: { Accept: "application/pdf" },
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
    next: { revalidate: 3600 },
  });
  const contentLength = Number(response.headers.get("content-length"));
  if (
    !response.ok ||
    !response.body ||
    (Number.isFinite(contentLength) && contentLength > MAX_CERTIFICATE_BYTES)
  ) {
    throw new Error("Certificate file is unavailable");
  }

  return { certificate, body: response.body };
}
