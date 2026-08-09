"use client";

import { useRef, useState } from "react";
import { AlertCircle, CheckCircle2, ImagePlus, LoaderCircle, Trash2, X } from "lucide-react";

export interface ProjectImage {
  id?: string;
  imageUrl: string;
  imagePublicId: string;
  position: number;
}

interface ProjectImageUploaderProps {
  images: ProjectImage[];
  onUploaded: (image: ProjectImage) => Promise<void> | void;
  onReorder: (images: ProjectImage[]) => void;
  onRemove: (image: ProjectImage) => Promise<void> | void;
  disabled?: boolean;
}

type UploadSignature = { apiKey: string; cloudName: string; folder: string; timestamp: number; signature: string; error?: string };
type UploadResult = { secure_url?: string; public_id?: string; bytes?: number; format?: string; resource_type?: string; error?: { message?: string } };
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "webp", "avif"];

export async function removeUnsavedProjectImage(publicId: string) {
  const response = await fetch("/api/cloudinary/image", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ publicId }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(data?.error || "Unable to remove the project image");
  }
}

export default function ProjectImageUploader({ images, onUploaded, onReorder, onRemove, disabled }: ProjectImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const targetPositionRef = useRef(0);
  const draggedPositionRef = useRef<number | null>(null);
  const [uploadingPosition, setUploadingPosition] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; success: boolean } | null>(null);
  const byPosition = new Map(images.map((image) => [image.position, image]));

  const chooseImage = (position: number) => {
    if (disabled || uploadingPosition !== null) return;
    targetPositionRef.current = position;
    inputRef.current?.click();
  };

  const uploadImage = async (file?: File) => {
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !ALLOWED_FORMATS.includes(extension) || file.size > MAX_IMAGE_BYTES) {
      setToast({ message: "Use a JPG, PNG, WebP, or AVIF image up to 10 MB.", success: false });
      return;
    }

    const position = targetPositionRef.current;
    setUploadingPosition(position);
    try {
      const signatureResponse = await fetch("/api/cloudinary/image-signature", { method: "POST", credentials: "include" });
      const signature = await signatureResponse.json() as UploadSignature;
      if (!signatureResponse.ok) throw new Error(signature.error || "Unable to prepare the image upload");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signature.apiKey);
      formData.append("folder", signature.folder);
      formData.append("timestamp", String(signature.timestamp));
      formData.append("signature", signature.signature);
      const response = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, { method: "POST", body: formData });
      const result = await response.json() as UploadResult;
      if (!response.ok || !result.secure_url || !result.public_id) throw new Error(result.error?.message || "Unable to upload the image");
      if (result.resource_type !== "image" || !result.bytes || result.bytes > MAX_IMAGE_BYTES || !result.format || !ALLOWED_FORMATS.includes(result.format.toLowerCase())) {
        await removeUnsavedProjectImage(result.public_id);
        throw new Error("Use a JPG, PNG, WebP, or AVIF image up to 10 MB.");
      }

      await onUploaded({ imageUrl: result.secure_url, imagePublicId: result.public_id, position });
      setToast({ message: "Project image uploaded.", success: true });
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : "The image could not be uploaded.", success: false });
    } finally {
      setUploadingPosition(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const dropAt = (targetPosition: number) => {
    const sourcePosition = draggedPositionRef.current;
    draggedPositionRef.current = null;
    if (sourcePosition === null || sourcePosition === targetPosition) return;
    onReorder(images.map((image) => image.position === sourcePosition
      ? { ...image, position: targetPosition }
      : image.position === targetPosition
        ? { ...image, position: sourcePosition }
        : image));
  };

  const removeImage = async (image: ProjectImage) => {
    try {
      await onRemove(image);
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : "The image could not be removed.", success: false });
    }
  };

  return (
    <div>
      {toast && (
        <div role="alert" className={`fixed right-4 top-4 z-[220] flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-md ${toast.success ? "border-emerald-300/25 bg-emerald-950/90 text-emerald-100" : "border-red-300/25 bg-red-950/90 text-red-100"}`}>
          {toast.success ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
          <span>{toast.message}</span>
          <button type="button" onClick={() => setToast(null)} aria-label="Dismiss notification"><X className="h-4 w-4" /></button>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif" className="sr-only" onChange={(event) => uploadImage(event.target.files?.[0])} />
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {[0, 1, 2, 3, 4].map((position) => {
          const image = byPosition.get(position);
          return (
            <div
              key={position}
              className={`group relative aspect-[4/3] overflow-hidden rounded-lg border border-dashed transition ${image ? "cursor-grab border-white/20 bg-black/40" : "cursor-pointer border-white/15 bg-black/20 hover:border-white/35 hover:bg-white/[0.04]"}`}
              draggable={Boolean(image) && !disabled}
              onDragStart={() => { draggedPositionRef.current = position; }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => { event.preventDefault(); dropAt(position); }}
              onClick={() => !image && chooseImage(position)}
            >
              {image ? (
                <>
                  <img src={image.imageUrl} alt={`Project screenshot ${position + 1}`} draggable={false} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 grid place-items-center bg-black/60 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                    <button type="button" disabled={disabled} onClick={(event) => { event.stopPropagation(); void removeImage(image); }} className="grid h-9 w-9 place-items-center rounded-full border border-red-300/30 bg-red-950/85 text-red-200 transition hover:scale-105 hover:bg-red-900" aria-label={`Remove screenshot ${position + 1}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="grid h-full place-items-center text-zinc-600">
                  {uploadingPosition === position ? <LoaderCircle className="h-5 w-5 animate-spin text-zinc-300" /> : <ImagePlus className="h-5 w-5" />}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs leading-5 text-zinc-500">Click a slot to upload · drag images to reorder · up to 5 images</p>
    </div>
  );
}
