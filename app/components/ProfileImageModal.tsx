"use client";

import type { ChangeEvent, DragEvent } from "react";

import { useState, useEffect } from "react";
import { X, Upload, Camera, Loader2 } from "lucide-react";
import { Button, primaryActionButtonClass, secondaryActionButtonClass } from "@/components/ui/button";
import { createPortal } from "react-dom";

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

  const selectFile = (file: File) => {
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

    try {
      const formData = new FormData();
      formData.append("image", selectedFile, "profile-picture.jpg");

      const uploadResponse = await fetch("/api/uploadProfilePicture", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const result = await uploadResponse.json();
      const imageUrl = result.imageUrl;

      if (imageUrl) {
        onImageChange(imageUrl);
        onClose();
      } else {
        console.error("Upload failed: No image URL returned");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsUploading(false);
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 shadow-2xl sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <Button
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
          onClick={onClose}
          aria-label="Close modal"
          size="icon"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="p-4 sm:p-6">
          <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
            <span className="bg-zinc-600/20 p-1.5 rounded text-zinc-400">
              <Camera className="h-5 w-5" />
            </span>
            Change Profile Picture
          </h2>

          {/* Current image preview */}
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-slate-700">
              <img
                src={previewUrl || currentImage || "/placeholder.png"}
                alt="-"
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {/* Upload section */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 mb-6 text-center transition-colors ${
              isDragging
                ? "border-zinc-500 bg-zinc-500/10"
                : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              id="profile-image-upload"
            />
            <label
              htmlFor="profile-image-upload"
              className="flex flex-col items-center gap-2 cursor-pointer"
            >
              <div className="p-3 rounded-full bg-slate-700">
                <Upload className="h-6 w-6 text-zinc-400" />
              </div>
              <p className="text-slate-300 font-medium">Upload a photo</p>
              <p className="text-slate-500 text-sm">
                Drag and drop or click to browse
              </p>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isUploading}
              className={secondaryActionButtonClass}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!selectedFile || isUploading}
              className={primaryActionButtonClass}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
