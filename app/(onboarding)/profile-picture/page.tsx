"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Upload, Check } from "lucide-react";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { UploadResponse } from "@/types/api";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button, ButtonSpinner } from "@/components/ui/button";

export default function ProfilePicturePage() {
  const [image, setImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);

  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
          setCroppedImage(null);
          setUploadSuccess(false);
          setUploadError(null);
          setIsCropping(true);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Start with the largest centred square, which the circular crop turns into a circle.
  const onImageLoad = (img: HTMLImageElement) => {
    const minSize = Math.min(img.width, img.height);
    const initialCrop = {
      unit: "px" as const,
      width: minSize,
      height: minSize,
      x: (img.width - minSize) / 2,
      y: (img.height - minSize) / 2,
    };
    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
  };

  const handleDone = () => {
    const cropToUse = completedCrop || crop;
    if (!imgRef.current) return;

    const canvas = document.createElement("canvas");
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

    const outputSize = 400;
    canvas.width = outputSize;
    canvas.height = outputSize;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
    ctx.clip();

    const cropX = cropToUse.x * scaleX;
    const cropY = cropToUse.y * scaleY;
    const cropWidth = cropToUse.width * scaleX;
    const cropHeight = cropToUse.height * scaleY;

    ctx.drawImage(
      imgRef.current,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      outputSize,
      outputSize
    );

    setCroppedImage(canvas.toDataURL("image/jpeg"));
    setIsCropping(false);
  };

  const handleRecrop = () => {
    setIsCropping(true);
    setCroppedImage(null);
  };

  const handleCancel = () => {
    setImage(null);
    setCroppedImage(null);
    setIsCropping(false);
  };

  const handleSubmit = async () => {
    if (!croppedImage) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const response = await fetch(croppedImage);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("image", blob, "profile-picture.jpg");

      const uploadResponse = await fetch("/api/uploadProfilePicture", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData: UploadResponse = await uploadResponse.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const result: UploadResponse = await uploadResponse.json();
      const { imageUrl, username } = result;

      if (imageUrl && username) {
        setUploadSuccess(true);
        router.push(`/${encodeURIComponent(username)}`);
      } else {
        throw new Error("Upload completed without profile information");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadError(error instanceof Error ? error.message : "Upload failed");
      setIsUploading(false);
    }
  };

  const hint = !image
    ? "A clear photo of your face works best. You can change it from your portfolio at any time."
    : isCropping
      ? "Drag the circle to choose what shows. The picture is cropped to a circle."
      : "This is how it appears on your portfolio.";

  return (
    <main className="mx-auto grid w-full max-w-[1180px] flex-1 items-center gap-10 px-5 pb-20 pt-6 sm:px-10 lg:grid-cols-2 lg:gap-14">
      <div className="max-w-[500px]">
        <h1 className="font-display text-[38px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[52px]">
          Add your profile picture.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">{hint}</p>

        {uploadError && (
          <p role="alert" className="mt-6 text-[15px] font-medium text-danger">
            The picture wasn’t uploaded: {uploadError}. Try again.
          </p>
        )}
        {uploadSuccess && (
          <p role="status" className="mt-6 text-[15px] font-medium text-ink-soft">
            Picture uploaded. Opening your portfolio…
          </p>
        )}

        <div className="mt-9 flex flex-wrap items-center gap-3">
          {!image && (
            <Button size="lg" onClick={() => inputRef.current?.click()}>
              <Upload aria-hidden="true" />
              Choose a picture
            </Button>
          )}
          {image && isCropping && (
            <>
              <Button variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleDone}>Use this crop</Button>
            </>
          )}
          {image && !isCropping && (
            <>
              <Button variant="secondary" onClick={handleRecrop} disabled={isUploading}>
                Adjust crop
              </Button>
              <Button onClick={handleSubmit} disabled={isUploading || uploadSuccess}>
                {isUploading ? (
                  <>
                    <ButtonSpinner />
                    Uploading…
                  </>
                ) : uploadSuccess ? (
                  <>
                    <Check aria-hidden="true" />
                    Uploaded
                  </>
                ) : (
                  "Save and open my portfolio"
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="ui-sheet ob-sheet grid min-h-[360px] place-items-center rounded-[28px] p-6 sm:min-h-[440px] sm:p-10">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />

        {!image && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="grid size-60 place-items-center rounded-full border-2 border-dashed border-line text-ink-soft transition-colors hover:border-ink hover:text-ink sm:size-72"
          >
            <span className="flex flex-col items-center gap-3 text-[15px] font-medium">
              <Upload aria-hidden="true" className="size-8" />
              Choose a picture
            </span>
          </button>
        )}

        {image && isCropping && (
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={setCompletedCrop}
            circularCrop
            aspect={1}
            className="crop-circle"
          >
            <Image
              ref={imgRef}
              src={image}
              alt="Upload preview"
              width={400}
              height={400}
              onLoad={(e) => onImageLoad(e.currentTarget)}
              className="w-[400px] max-w-full"
            />
          </ReactCrop>
        )}

        {image && !isCropping && (
          <div className="size-60 overflow-hidden rounded-full shadow-[0_0_0_4px_rgb(var(--c-sheet-edge))] sm:size-72">
            <Image
              src={croppedImage || "/placeholder.svg"}
              alt="Cropped preview"
              width={320}
              height={320}
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </div>
    </main>
  );
}
