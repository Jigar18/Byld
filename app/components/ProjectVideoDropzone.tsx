"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Film, LoaderCircle, UploadCloud, X } from "lucide-react";
import { compressProjectVideo } from "@/lib/compressProjectVideo";

export interface ProjectVideo {
  videoUrl: string;
  videoPublicId: string;
  videoDuration: number;
  videoBytes: number;
  videoFormat: string;
}

interface ProjectVideoDropzoneProps {
  video?: ProjectVideo | null;
  onUploaded: (video: ProjectVideo) => Promise<void> | void;
  onRemove?: () => Promise<void> | void;
  disabled?: boolean;
}

const MAX_VIDEO_BYTES = 30 * 1024 * 1024;
const MAX_SOURCE_VIDEO_BYTES = 500 * 1024 * 1024;
const MAX_VIDEO_DURATION = 120;
const UPLOAD_CHUNK_BYTES = 6 * 1024 * 1024;

type CloudinarySignature = {
  apiKey: string;
  cloudName: string;
  folder: string;
  timestamp: number;
  uploadPreset: string;
  signature: string;
};

type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  duration: number;
  bytes: number;
  format: string;
  resource_type: string;
  error?: { message?: string };
};

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function uploadVideoToCloudinary(file: File, signature: CloudinarySignature) {
  const uploadUrl = `https://api.cloudinary.com/v1_1/${signature.cloudName}/video/upload`;
  const uploadId = crypto.randomUUID();
  let result: CloudinaryUploadResult | null = null;

  for (let start = 0; start < file.size; start += UPLOAD_CHUNK_BYTES) {
    const end = Math.min(start + UPLOAD_CHUNK_BYTES, file.size);
    const formData = new FormData();
    formData.append("file", file.slice(start, end, file.type), file.name);
    formData.append("api_key", signature.apiKey);
    formData.append("folder", signature.folder);
    formData.append("timestamp", String(signature.timestamp));
    formData.append("upload_preset", signature.uploadPreset);
    formData.append("signature", signature.signature);

    for (let attempt = 0; attempt < 3; attempt++) {
      let response: Response;
      try {
        response = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Range": `bytes ${start}-${end - 1}/${file.size}`,
            "X-Unique-Upload-Id": uploadId,
          },
          body: formData,
        });
      } catch (error) {
        if (attempt === 2) throw error;
        await wait(750 * 2 ** attempt);
        continue;
      }

      const data = await response.json().catch(() => null) as CloudinaryUploadResult | null;
      if (response.ok) {
        result = data;
        break;
      }
      if (attempt === 2 || (response.status !== 429 && response.status < 500)) {
        throw new Error(data?.error?.message || "Cloudinary could not upload the video");
      }
      await wait(750 * 2 ** attempt);
    }
  }

  if (!result?.secure_url) throw new Error("Cloudinary did not finish processing the video");
  return result;
}

export async function removeUnsavedProjectVideo(publicId: string) {
  const response = await fetch("/api/cloudinary/video", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ publicId }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(data?.error || "Unable to remove the project demo");
  }
}

function readDuration(file: File) {
  return new Promise<number>((resolve, reject) => {
    const previewUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(previewUrl);
      Number.isFinite(video.duration) ? resolve(video.duration) : reject(new Error("Unable to read the video duration"));
    };
    video.onerror = () => {
      URL.revokeObjectURL(previewUrl);
      reject(new Error("This video could not be read"));
    };
    video.src = previewUrl;
  });
}

export default function ProjectVideoDropzone({ video, onUploaded, onRemove, disabled }: ProjectVideoDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [optimizingProgress, setOptimizingProgress] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; success: boolean } | null>(null);

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const showToast = (message: string, success = false) => {
    setToast({ message, success });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const uploadFile = async (file?: File) => {
    if (!file || uploading || disabled) return;
    if (file.size > MAX_SOURCE_VIDEO_BYTES) {
      showToast("The original video file should not be greater than 500 MB.");
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !["mp4", "webm"].includes(extension)) {
      showToast("Upload an MP4 or WebM video.");
      return;
    }

    setUploading(true);
    try {
      const duration = await readDuration(file);
      if (duration > MAX_VIDEO_DURATION) throw new Error("The project demo should not be longer than 2 minutes.");

      let uploadFile = file;
      if (file.size > MAX_VIDEO_BYTES) {
        setOptimizingProgress(0);
        uploadFile = await compressProjectVideo(file, duration, setOptimizingProgress);
        if (uploadFile.size > MAX_VIDEO_BYTES) {
          throw new Error("The optimized video is still above 30 MB. Please choose a shorter video.");
        }
        setOptimizingProgress(null);
      }

      const signatureResponse = await fetch("/api/cloudinary/video-signature", { method: "POST", credentials: "include" });
      const signatureData = await signatureResponse.json() as CloudinarySignature & { error?: string };
      if (!signatureResponse.ok) throw new Error(signatureData.error || "Unable to prepare the video upload");

      const result = await uploadVideoToCloudinary(uploadFile, signatureData);

      const uploadedVideo: ProjectVideo = {
        videoUrl: result.secure_url,
        videoPublicId: result.public_id,
        videoDuration: result.duration,
        videoBytes: result.bytes,
        videoFormat: result.format,
      };
      if (
        result.resource_type !== "video" ||
        uploadedVideo.videoBytes > MAX_VIDEO_BYTES ||
        uploadedVideo.videoDuration > MAX_VIDEO_DURATION ||
        !["mp4", "webm"].includes(uploadedVideo.videoFormat)
      ) {
        await removeUnsavedProjectVideo(uploadedVideo.videoPublicId);
        throw new Error("The project demo must be an MP4 or WebM video up to 2 minutes and 30 MB.");
      }

      await onUploaded(uploadedVideo);
      showToast("Project demo uploaded.", true);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "The video could not be uploaded.");
    } finally {
      setOptimizingProgress(null);
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
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

      {video && (
        <div className="mb-3 overflow-hidden rounded-xl border border-white/10 bg-black/30">
          <video src={video.videoUrl} controls preload="metadata" playsInline className="aspect-video w-full bg-black object-contain" />
          {onRemove && (
            <div className="flex items-center justify-between gap-3 border-t border-white/10 px-3 py-2 text-xs text-zinc-400">
              <span>Current project demo</span>
              <button type="button" onClick={() => onRemove()} disabled={uploading || disabled} className="rounded-lg px-2 py-1 text-red-300 transition hover:bg-red-400/10 hover:text-red-200">Remove</button>
            </div>
          )}
        </div>
      )}

      <div
        onDragEnter={(event) => { event.preventDefault(); if (!disabled) setIsDragging(true); }}
        onDragOver={(event) => { event.preventDefault(); if (!disabled) setIsDragging(true); }}
        onDragLeave={(event) => { event.preventDefault(); if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsDragging(false); }}
        onDrop={(event) => { event.preventDefault(); setIsDragging(false); uploadFile(event.dataTransfer.files[0]); }}
        className={`relative grid min-h-40 place-items-center rounded-xl border border-dashed p-5 text-center transition duration-200 ${isDragging ? "border-rose-300 bg-rose-400/10 shadow-[0_0_30px_rgba(251,113,133,0.12)]" : "border-white/15 bg-black/20 hover:border-white/30 hover:bg-white/[0.04]"} ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept="video/mp4,video/webm,.mp4,.webm" className="sr-only" onChange={(event) => uploadFile(event.target.files?.[0])} disabled={disabled || uploading} />
        <div>
          <span className={`mx-auto grid h-11 w-11 place-items-center rounded-xl border ${isDragging ? "border-rose-200/40 bg-rose-300/10 text-rose-100" : "border-white/10 bg-white/[0.06] text-zinc-300"}`}>
            {uploading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : isDragging ? <Film className="h-5 w-5" /> : <UploadCloud className="h-5 w-5" />}
          </span>
          <p className={`mt-3 text-sm font-medium ${isDragging ? "text-rose-100" : "text-zinc-200"}`}>{optimizingProgress !== null ? `Optimizing video… ${optimizingProgress}%` : uploading ? "Uploading project demo…" : isDragging ? "Drop the video here" : video ? "Replace the demo video" : "Drag and drop the demo video"}</p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">or click to browse · MP4 or WebM · up to 2 minutes · optimized to 30 MB</p>
          {optimizingProgress !== null && (
            <div className="mx-auto mt-3 h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-rose-400 transition-[width]" style={{ width: `${optimizingProgress}%` }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
