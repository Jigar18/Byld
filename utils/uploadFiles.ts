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

// function for uploading images like in profile picture.
export async function uploadFile(
  fileBuffer: Buffer,
  _fileName: string,
  userId: string,
  contentType = "image/jpeg"
) {
  const supabase = getSupabase();
  const extension = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  const filePath = `user-image/${userId}-${randomUUID()}.${extension}`;
  const { data, error } = await supabase.storage
    .from("profile-picture")
    .upload(filePath, fileBuffer, {
      contentType,
      upsert: false,
    });
  if (error) {
    throw new Error(`Supabase profile image upload failed: ${error.message}`);
  }

  return supabase.storage.from("profile-picture").getPublicUrl(filePath).data
    .publicUrl;
}


// function for uploading pdf files like in certification section
export async function uploadPdfFile(
  fileBuffer: Buffer,
  _fileName: string,
  userId: string
) {
  const supabase = getSupabase();
  const filePath = `certifications/${userId}-${randomUUID()}.pdf`;

  try {
    const { data, error } = await supabase.storage
      .from("certificates")
      .upload(filePath, fileBuffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  
    const publicUrl = supabase.storage
      .from("certificates")
      .getPublicUrl(filePath).data.publicUrl;

    return publicUrl;
  } catch (uploadError) {
    console.error("Error in uploadPdfFile:", uploadError);
    throw uploadError;
  }
}
