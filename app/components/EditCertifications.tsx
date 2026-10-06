"use client";

import type { PortfolioCertificate } from "@/types/portfolio";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FileCheck2, FileUp, Plus, X } from "lucide-react";
import { Button, ButtonSpinner } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface FormValues {
  title: string;
  description: string;
  fileInput: FileList;
}

const fieldErrorClass = "mt-2 text-sm font-medium text-danger";

export default function EditCertifications({
  onAddCard,
}: {
  onAddCard: (card: PortfolioCertificate) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    resetField,
    watch,
  } = useForm<FormValues>();
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileName = watch("fileInput")?.[0]?.name ?? "";

  const onSubmit = async (data: FormValues) => {
    try {
      setIsUploading(true);
      setUploadError("");
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("pdf", data.fileInput[0]);

      const response = await fetch("/api/uploadCertificate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(
          errorData.error || `Upload failed with status ${response.status}`
        );
      }

      const responseData = await response.json();
      const newCard = responseData.certificate;
      if (!newCard) throw new Error("Certificate was uploaded but could not be saved");

      onAddCard(newCard);

      reset();
      setOpen(false);
    } catch (error) {
      console.error("Error during form submission:", error);
      setUploadError(error instanceof Error ? error.message : "The certificate could not be uploaded.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          setUploadError("");
          setOpen(true);
        }}
      >
        <Plus aria-hidden="true" />
        Add certificate
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Add certificate"
        description="Upload the PDF and say what it is for."
        size="md"
        busy={isUploading}
        onSubmit={() => void handleSubmit(onSubmit)()}
        footer={
          <>
            {uploadError && (
              <p role="alert" className="basis-full text-[15px] font-medium text-danger">
                {uploadError}
              </p>
            )}
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? (
                <>
                  <ButtonSpinner />
                  Uploading…
                </>
              ) : (
                "Add certificate"
              )}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="AWS Solutions Architect"
              aria-invalid={Boolean(errors.title)}
              className="mt-2"
              {...register("title", {
                required: "Title is required",
              })}
            />
            {errors.title && <p className={fieldErrorClass}>{errors.title.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What this certificate covers"
              aria-invalid={Boolean(errors.description)}
              className="mt-2"
              {...register("description", {
                required: "Description is required",
                validate: (value) =>
                  value.split(/\s+/).length <= 300 ||
                  "Maximum 300 words allowed",
              })}
            />
            {errors.description ? (
              <p className={fieldErrorClass}>{errors.description.message}</p>
            ) : (
              <p className="mt-2 text-sm text-ink-soft">Up to 300 words.</p>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold">Certificate file</p>
            {/* A label, so a click or a key press on the hidden input opens the file picker without any script. */}
            <label
              className={cn(
                "mt-2 flex min-h-24 cursor-pointer items-center justify-center gap-3 rounded-2xl border-[1.5px] border-dashed px-4 py-4 text-center transition-colors has-[:focus-visible]:border-ink",
                fileName ? "border-ink-faint bg-raised" : "border-line hover:border-ink-faint",
                errors.fileInput && "border-danger",
              )}
            >
              <input
                type="file"
                accept="application/pdf"
                aria-label="Upload a certificate PDF"
                className="sr-only"
                {...register("fileInput", {
                  required: "PDF file is required",
                })}
              />
              {fileName ? (
                <>
                  <FileCheck2 aria-hidden="true" className="size-5 shrink-0 text-brand-text" />
                  <span className="min-w-0 truncate font-medium">{fileName}</span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove the selected file"
                    onClick={(event) => {
                      // Otherwise the click also reaches the label and reopens the file picker.
                      event.preventDefault();
                      resetField("fileInput");
                    }}
                  >
                    <X aria-hidden="true" />
                  </Button>
                </>
              ) : (
                <>
                  <FileUp aria-hidden="true" className="size-5 shrink-0 text-ink-soft" />
                  <span className="text-ink-soft">Choose a PDF</span>
                </>
              )}
            </label>
            {errors.fileInput && <p className={fieldErrorClass}>{errors.fileInput.message}</p>}
          </div>
        </div>
      </Dialog>
    </>
  );
}
