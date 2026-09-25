"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";

export type UploadToastState = { message: string; success: boolean } | null;

// Deletes a Cloudinary upload that was never saved to a project.
export async function removeUnsavedProjectMedia(type: "image" | "video", publicId: string) {
  const response = await fetch(`/api/cloudinary/${type}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ publicId }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(data?.error || `Unable to remove the project ${type === "video" ? "demo" : "image"}`);
  }
}

export function UploadToast({ toast, onDismiss }: { toast: UploadToastState; onDismiss: () => void }) {
  if (!toast) return null;

  return (
    <div role="alert" className={`fixed right-4 top-4 z-[220] flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-md ${toast.success ? "border-emerald-300/25 bg-emerald-950/90 text-emerald-100" : "border-red-300/25 bg-red-950/90 text-red-100"}`}>
      {toast.success ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
      <span>{toast.message}</span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss notification"><X className="h-4 w-4" /></button>
    </div>
  );
}
