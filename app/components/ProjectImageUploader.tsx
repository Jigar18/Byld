"use client";

import type { PortfolioProjectData } from "@/types/portfolio";
import { useRef, useState } from "react";
import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { removeUnsavedProjectMedia } from "./projectMedia";
import Toast, { type ToastState } from "./Toast";

export type ProjectImage = PortfolioProjectData["images"][number];

interface ProjectImageUploaderProps {
  images: ProjectImage[];
  onUploaded: (image: ProjectImage) => Promise<void> | void;
  onReorder: (images: ProjectImage[]) => void;
  onRemove: (image: ProjectImage) => Promise<void> | void;
  disabled?: boolean;
}

type UploadSignature = { apiKey: string; cloudName: string; folder: string; allowedFormats: string; timestamp: number; signature: string; error?: string };
type UploadResult = { secure_url?: string; public_id?: string; bytes?: number; format?: string; resource_type?: string; error?: { message?: string } };
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "webp", "avif"];

export default function ProjectImageUploader({ images, onUploaded, onReorder, onRemove, disabled }: ProjectImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const targetPositionRef = useRef(0);
  const draggedPositionRef = useRef<number | null>(null);
  const [uploadingPosition, setUploadingPosition] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
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
      formData.append("allowed_formats", signature.allowedFormats);
      formData.append("timestamp", String(signature.timestamp));
      formData.append("signature", signature.signature);
      const response = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, { method: "POST", body: formData });
      const result = await response.json() as UploadResult;
      if (!response.ok || !result.secure_url || !result.public_id) throw new Error(result.error?.message || "Unable to upload the image");
      if (result.resource_type !== "image" || !result.bytes || result.bytes > MAX_IMAGE_BYTES || !result.format || !ALLOWED_FORMATS.includes(result.format.toLowerCase())) {
        await removeUnsavedProjectMedia("image", result.public_id);
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
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      {/* Opened from the slot buttons below, so it stays out of the tab order. */}
      <input ref={inputRef} type="file" tabIndex={-1} aria-hidden="true" accept="image/jpeg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif" className="sr-only" onChange={(event) => uploadImage(event.target.files?.[0])} />
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
        {[0, 1, 2, 3, 4].map((position) => {
          const image = byPosition.get(position);
          return image ? (
            <div
              key={position}
              className="relative aspect-[4/3] cursor-grab overflow-hidden rounded-xl border border-line bg-black"
              draggable={!disabled}
              onDragStart={() => { draggedPositionRef.current = position; }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => { event.preventDefault(); dropAt(position); }}
            >
              <img src={image.imageUrl} alt={`Project screenshot ${position + 1}`} draggable={false} className="size-full object-cover" />
              <button
                type="button"
                disabled={disabled}
                onClick={() => void removeImage(image)}
                className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-black/70 text-white transition-colors hover:bg-[#c0362c]"
                aria-label={`Remove screenshot ${position + 1}`}
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ) : (
            <button
              key={position}
              type="button"
              disabled={disabled}
              onClick={() => chooseImage(position)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => { event.preventDefault(); dropAt(position); }}
              className="grid aspect-[4/3] place-items-center rounded-xl border-[1.5px] border-dashed border-line text-ink-faint transition-colors hover:border-ink-faint hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={`Add screenshot ${position + 1}`}
            >
              {uploadingPosition === position ? <LoaderCircle className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
            </button>
          );
        })}
      </div>
      <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">Click a slot to upload. Drag images to change their order. Up to 5 images.</p>
    </div>
  );
}
