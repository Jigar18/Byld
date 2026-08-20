import { createHash } from "crypto";

export const PROJECT_VIDEO_MAX_BYTES = 30 * 1024 * 1024;
export const PROJECT_VIDEO_MAX_DURATION = 120;
export const PROJECT_VIDEO_FORMATS = ["mp4", "webm"] as const;
export const PROJECT_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const PROJECT_IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp", "avif"] as const;

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary uploads are not configured");
  }
  return { cloudName, apiKey, apiSecret };
}

function signCloudinaryParams(params: Record<string, string | number | boolean>, apiSecret: string) {
  const serialized = Object.entries(params)
    .filter(([, value]) => value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1").update(`${serialized}${apiSecret}`).digest("hex");
}

export function createProjectVideoUploadSignature(userId: string) {
  const config = getCloudinaryConfig();
  const uploadPreset = process.env.CLOUDINARY_VIDEO_UPLOAD_PRESET;
  if (!uploadPreset) throw new Error("Cloudinary video uploads are not configured");
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `portfolio-videos/${userId}`;
  const params = { folder, timestamp, upload_preset: uploadPreset };

  return {
    apiKey: config.apiKey,
    cloudName: config.cloudName,
    folder,
    timestamp,
    uploadPreset,
    signature: signCloudinaryParams(params, config.apiSecret),
  };
}

export function createProjectImageUploadSignature(userId: string) {
  const config = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `portfolio-images/${userId}`;
  const allowedFormats = PROJECT_IMAGE_FORMATS.join(",");
  return {
    apiKey: config.apiKey,
    cloudName: config.cloudName,
    folder,
    allowedFormats,
    timestamp,
    signature: signCloudinaryParams({ allowed_formats: allowedFormats, folder, timestamp }, config.apiSecret),
  };
}

export function isOwnedProjectImage(publicId: string, userId: string) {
  return publicId.startsWith(`portfolio-images/${userId}/`);
}

export function isCloudinaryImageUrl(url: string) {
  const { cloudName } = getCloudinaryConfig();
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === "res.cloudinary.com" && parsed.pathname.startsWith(`/${cloudName}/image/upload/`);
  } catch {
    return false;
  }
}

export function isOwnedProjectVideo(publicId: string, userId: string) {
  return publicId.startsWith(`portfolio-videos/${userId}/`);
}

export function isCloudinaryVideoUrl(url: string) {
  const { cloudName } = getCloudinaryConfig();
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === "res.cloudinary.com" && parsed.pathname.startsWith(`/${cloudName}/video/upload/`);
  } catch {
    return false;
  }
}

export async function deleteProjectVideo(publicId: string) {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { invalidate: true, public_id: publicId, timestamp };
  const body = new URLSearchParams({
    api_key: apiKey,
    invalidate: "true",
    public_id: publicId,
    signature: signCloudinaryParams(params, apiSecret),
    timestamp: String(timestamp),
  });

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/destroy`, {
        method: "POST",
        body,
        signal: AbortSignal.timeout(10_000),
      });
      const result = response.ok ? await response.json() as { result?: string } : null;
      if (result?.result === "ok" || result?.result === "not found") return;
    } catch (error) {
      if (attempt === 2) throw error;
    }
    if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
  }

  throw new Error("Unable to remove the Cloudinary video");
}

export async function deleteProjectImage(publicId: string) {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { invalidate: true, public_id: publicId, timestamp };
  const body = new URLSearchParams({
    api_key: apiKey,
    invalidate: "true",
    public_id: publicId,
    signature: signCloudinaryParams(params, apiSecret),
    timestamp: String(timestamp),
  });

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
        method: "POST",
        body,
        signal: AbortSignal.timeout(10_000),
      });
      const result = response.ok ? await response.json() as { result?: string } : null;
      if (result?.result === "ok" || result?.result === "not found") return;
    } catch (error) {
      if (attempt === 2) throw error;
    }
    if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
  }

  throw new Error("Unable to remove the Cloudinary image");
}

export async function getVerifiedProjectImage(publicId: string, userId: string) {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  if (!isOwnedProjectImage(publicId, userId)) throw new Error("Project image not found");

  const authorization = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload/${encodeURIComponent(publicId)}`, {
    headers: { Authorization: `Basic ${authorization}` },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("Cloudinary could not verify the project image");

  const asset = (await response.json()) as { bytes?: number; format?: string; public_id?: string; secure_url?: string };
  const format = asset.format?.toLowerCase();
  if (
    asset.public_id !== publicId ||
    !asset.secure_url ||
    !isCloudinaryImageUrl(asset.secure_url) ||
    !Number.isInteger(asset.bytes) ||
    !asset.bytes ||
    asset.bytes > PROJECT_IMAGE_MAX_BYTES ||
    !format ||
    !PROJECT_IMAGE_FORMATS.includes(format as (typeof PROJECT_IMAGE_FORMATS)[number])
  ) {
    throw new Error("Project images must be JPG, PNG, WebP, or AVIF files up to 10 MB");
  }

  return { imageUrl: asset.secure_url, imagePublicId: publicId };
}

export async function getVerifiedProjectVideo(publicId: string, userId: string) {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  if (!isOwnedProjectVideo(publicId, userId)) throw new Error("Project video not found");

  const authorization = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/video/upload/${encodeURIComponent(publicId)}?media_metadata=true`, {
    headers: { Authorization: `Basic ${authorization}` },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("Cloudinary could not verify the project video");

  const asset = (await response.json()) as {
    bytes?: number;
    duration?: number;
    format?: string;
    public_id?: string;
    secure_url?: string;
  };
  const format = asset.format?.toLowerCase();
  if (
    asset.public_id !== publicId ||
    !asset.secure_url ||
    !isCloudinaryVideoUrl(asset.secure_url) ||
    !Number.isInteger(asset.bytes) ||
    !asset.bytes ||
    asset.bytes > PROJECT_VIDEO_MAX_BYTES ||
    !Number.isFinite(asset.duration) ||
    !asset.duration ||
    asset.duration > PROJECT_VIDEO_MAX_DURATION ||
    !format ||
    !PROJECT_VIDEO_FORMATS.includes(format as (typeof PROJECT_VIDEO_FORMATS)[number])
  ) {
    throw new Error("The project demo must be an MP4 or WebM video up to 2 minutes and 30 MB");
  }

  return {
    videoUrl: asset.secure_url,
    videoPublicId: publicId,
    videoDuration: asset.duration,
    videoBytes: asset.bytes,
    videoFormat: format,
  };
}
