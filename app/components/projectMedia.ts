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
