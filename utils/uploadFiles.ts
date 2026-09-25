import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

function getSupabase() {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL;
  const apiKey = process.env.SUPABASE_API_KEY;
  if (!projectUrl || !apiKey) {
    throw new Error("File storage is not configured");
  }
  return createClient(projectUrl, apiKey);
}

function getStoragePath(publicUrl: string, bucket: string) {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL;
  if (!projectUrl) throw new Error("File storage is not configured");

  try {
    const asset = new URL(publicUrl);
    const project = new URL(projectUrl);
    const prefix = `/storage/v1/object/public/${bucket}/`;
    if (asset.origin !== project.origin || !asset.pathname.startsWith(prefix)) return null;
    return decodeURIComponent(asset.pathname.slice(prefix.length));
  } catch {
    return null;
  }
}

export function isStoredFileUrl(publicUrl: string, bucket: string, ownerPrefix?: string) {
  const filePath = getStoragePath(publicUrl, bucket);
  return Boolean(filePath && (!ownerPrefix || filePath.startsWith(ownerPrefix)));
}

export async function removeStoredFile(publicUrl: string, bucket: string, ownerPrefix: string) {
  const filePath = getStoragePath(publicUrl, bucket);
  if (!filePath) return false;
  if (!filePath.startsWith(ownerPrefix)) throw new Error("Stored file does not belong to this user");

  const { error } = await getSupabase().storage.from(bucket).remove([filePath]);
  if (error) throw new Error(`Supabase file deletion failed: ${error.message}`);
  return true;
}

async function uploadToBucket(bucket: string, filePath: string, fileBuffer: Buffer, contentType: string) {
  const supabase = getSupabase();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, fileBuffer, { contentType, upsert: false });
  if (error) throw new Error(`Supabase ${bucket} upload failed: ${error.message}`);

  return supabase.storage.from(bucket).getPublicUrl(filePath).data.publicUrl;
}

export async function uploadFile(fileBuffer: Buffer, userId: string, contentType = "image/jpeg") {
  const extension = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  return uploadToBucket("profile-picture", `user-image/${userId}-${randomUUID()}.${extension}`, fileBuffer, contentType);
}

export async function uploadPdfFile(fileBuffer: Buffer, userId: string) {
  return uploadToBucket("certificates", `certifications/${userId}-${randomUUID()}.pdf`, fileBuffer, "application/pdf");
}
