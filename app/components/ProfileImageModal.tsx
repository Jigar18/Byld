"use client";

import type { ChangeEvent, DragEvent } from "react";

import { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { Button, ButtonSpinner } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const MAX_DIMENSION = 800;
const UPLOAD_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

// The avatar is shown at 112px at most, so large photos are scaled down before upload.
// This also converts formats the server does not accept (such as GIF) to JPEG.
async function prepareImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && UPLOAD_TYPES.has(file.type) && file.size <= MAX_UPLOAD_BYTES) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const type = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.9));
  if (!blob || blob.size > MAX_UPLOAD_BYTES) throw new Error("Image is too large");
  return blob;
}

interface ProfileImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageChange: (imageUrl: string) => void;
  currentImage: string;
}

export default function ProfileImageModal({
  isOpen,
  onClose,
  onImageChange,
  currentImage,
}: ProfileImageModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const selectFile = (file: File) => {
    setError("");
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) selectFile(file);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) selectFile(file);
  };

  const handleSave = async () => {
    if (!selectedFile) {
      onClose();
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const image = await prepareImage(selectedFile).catch(() => {
        throw new Error("This image could not be read. Try a JPG, PNG, or WebP photo.");
      });
      const formData = new FormData();
      formData.append("image", image, "profile-picture.jpg");

      const uploadResponse = await fetch("/api/uploadProfilePicture", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        throw new Error(errorData.error || "Upload failed");
      }

      const result = await uploadResponse.json();
      const imageUrl = result.imageUrl;

      if (!imageUrl) throw new Error("Upload failed");
      onImageChange(imageUrl);
      onClose();
    } catch (error) {
      console.error("Error uploading image:", error);
      setError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsUploading(false);
    setError("");
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="Change profile picture"
      size="sm"
      busy={isUploading}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!selectedFile || isUploading}>
            {isUploading ? (
              <>
                <ButtonSpinner />
                Uploading…
              </>
            ) : (
              "Save picture"
            )}
          </Button>
        </>
      }
    >
      <img
        src={previewUrl || currentImage || "/placeholder.png"}
        alt={previewUrl ? "New profile picture" : "Current profile picture"}
        className="mx-auto size-32 rounded-full object-cover shadow-[0_0_0_4px_rgb(var(--c-sheet-edge))]"
      />

      <input
        type="file"
        onChange={handleFileChange}
        accept="image/*"
        className="peer sr-only"
        id="profile-image-upload"
      />
      <label
        htmlFor="profile-image-upload"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mt-7 flex cursor-pointer flex-col items-center gap-1 rounded-[18px] border-[1.5px] border-dashed px-5 py-7 text-center transition-colors peer-focus-visible:border-ink ${
          isDragging ? "border-brand-text bg-brand-text/10" : "border-line hover:border-ink-faint"
        }`}
      >
        <Upload aria-hidden="true" className="mb-2 size-6 text-ink-soft" />
        <span className="font-semibold">{selectedFile ? "Choose a different photo" : "Upload a photo"}</span>
        <span className="text-sm text-ink-soft">Drag and drop, or click to browse</span>
      </label>

      {error && (
        <p role="alert" className="mt-4 text-[15px] font-medium text-danger">
          {error}
        </p>
      )}
    </Dialog>
  );
}
