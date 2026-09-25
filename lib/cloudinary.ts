import { createHash } from "crypto";

const PROJECT_VIDEO_MAX_BYTES = 30 * 1024 * 1024;
const PROJECT_VIDEO_MAX_DURATION = 120;
const PROJECT_VIDEO_FORMATS = ["mp4", "webm"] as const;
const PROJECT_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
const PROJECT_IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp", "avif"] as const;

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

type ProjectAssetType = "image" | "video";

type CloudinaryAsset = {
  bytes?: number;
  duration?: number;
  format?: string;
  public_id?: string;
  secure_url?: string;
};

export function isOwnedProjectAsset(publicId: string, userId: string, type: ProjectAssetType) {
  return publicId.startsWith(`portfolio-${type}s/${userId}/`);
}

function isCloudinaryAssetUrl(url: string, type: ProjectAssetType) {
  const { cloudName } = getCloudinaryConfig();
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === "res.cloudinary.com" && parsed.pathname.startsWith(`/${cloudName}/${type}/upload/`);
  } catch {
    return false;
  }
}

export async function deleteProjectAsset(publicId: string, resourceType: ProjectAssetType) {
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
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`, {
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

  throw new Error(`Unable to remove the Cloudinary ${resourceType}`);
}

async function getVerifiedAsset(
  type: ProjectAssetType,
  publicId: string,
  userId: string,
  rules: {
    maxBytes: number;
    formats: readonly string[];
    invalidMessage: string;
    query?: string;
    isValid?: (asset: CloudinaryAsset) => boolean;
  },
) {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  if (!isOwnedProjectAsset(publicId, userId, type)) throw new Error(`Project ${type} not found`);

  const authorization = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/${type}/upload/${encodeURIComponent(publicId)}${rules.query ?? ""}`, {
    headers: { Authorization: `Basic ${authorization}` },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Cloudinary could not verify the project ${type}`);

  const asset = (await response.json()) as CloudinaryAsset;
  const format = asset.format?.toLowerCase();
  if (
    asset.public_id !== publicId ||
    !asset.secure_url ||
    !isCloudinaryAssetUrl(asset.secure_url, type) ||
    !Number.isInteger(asset.bytes) ||
    !asset.bytes ||
    asset.bytes > rules.maxBytes ||
    !format ||
    !rules.formats.includes(format) ||
    (rules.isValid && !rules.isValid(asset))
  ) {
    throw new Error(rules.invalidMessage);
  }

  return { url: asset.secure_url, bytes: asset.bytes, format, duration: asset.duration };
}

export async function getVerifiedProjectImage(publicId: string, userId: string) {
  const asset = await getVerifiedAsset("image", publicId, userId, {
    maxBytes: PROJECT_IMAGE_MAX_BYTES,
    formats: PROJECT_IMAGE_FORMATS,
    invalidMessage: "Project images must be JPG, PNG, WebP, or AVIF files up to 10 MB",
  });
  return { imageUrl: asset.url, imagePublicId: publicId };
}

export async function getVerifiedProjectVideo(publicId: string, userId: string) {
  const asset = await getVerifiedAsset("video", publicId, userId, {
    maxBytes: PROJECT_VIDEO_MAX_BYTES,
    formats: PROJECT_VIDEO_FORMATS,
    invalidMessage: "The project demo must be an MP4 or WebM video up to 2 minutes and 30 MB",
    query: "?media_metadata=true",
    isValid: ({ duration }) => Number.isFinite(duration) && Boolean(duration) && duration! <= PROJECT_VIDEO_MAX_DURATION,
  });
  return {
    videoUrl: asset.url,
    videoPublicId: publicId,
    videoDuration: asset.duration!,
    videoBytes: asset.bytes,
    videoFormat: asset.format,
  };
}
