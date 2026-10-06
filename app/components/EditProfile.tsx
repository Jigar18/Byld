"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button, ButtonSpinner } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ProfileImageModal from "./ProfileImageModal";
import { useUser } from "../context/UserContext";

type EditableDetail = "firstName" | "lastName" | "email" | "location" | "jobTitle" | "college";

// The owner's "Edit profile" button on the profile sheet, with the dialog it opens.
export default function EditProfile() {
  const { userDetails, updateUserDetails } = useUser();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPictureModalOpen, setIsPictureModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [tempImagePreview, setTempImagePreview] = useState("");
  const [tempDetails, setTempDetails] = useState<Record<EditableDetail, string>>({
    firstName: "",
    lastName: "",
    email: "",
    location: "",
    jobTitle: "",
    college: "",
  });

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!tempDetails.firstName.trim()) {
      errors.push("First name is required");
    }

    if (tempDetails.email && !/\S+@\S+\.\S+/.test(tempDetails.email)) {
      errors.push("Please enter a valid email address");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleOpenModal = () => {
    setTempDetails({
      firstName: userDetails.firstName,
      lastName: userDetails.lastName,
      email: userDetails.email,
      location: userDetails.location,
      jobTitle: userDetails.jobTitle,
      college: userDetails.college,
    });
    setTempImagePreview(userDetails.imageUrl);
    setValidationErrors([]);
    setSaveFailed(false);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => setIsEditModalOpen(false);

  const handleImageChange = (newImageUrl: string) => {
    setTempImagePreview(newImageUrl);
    updateUserDetails({ imageUrl: newImageUrl });
  };

  // Only the validated fields (name and email) clear the error list while typing.
  const fieldProps = (field: EditableDetail, clearsErrors = false) => ({
    id: field,
    value: tempDetails[field],
    className: "mt-2",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setTempDetails((prev) => ({ ...prev, [field]: e.target.value }));
      if (clearsErrors && validationErrors.length > 0) setValidationErrors([]);
    },
  });

  const handleSaveChanges = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      setSaveFailed(false);
      const response = await fetch("/api/updateUserDetails", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(tempDetails),
      });

      const data = await response.json();

      if (data.success) {
        updateUserDetails({
          ...tempDetails,
          imageUrl: tempImagePreview || userDetails.imageUrl,
        });

        handleCloseModal();
      } else {
        console.error("Failed to update user details:", data.error);
        setSaveFailed(true);
      }
    } catch (error) {
      console.error("Error updating user details:", error);
      setSaveFailed(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button variant="secondary" size="sm" onClick={handleOpenModal}>
        <Pencil aria-hidden="true" />
        Edit profile
      </Button>

      <Dialog
        open={isEditModalOpen}
        onClose={handleCloseModal}
        title="Edit profile"
        busy={saving}
        onSubmit={handleSaveChanges}
        footer={
          <>
            <Button variant="ghost" onClick={handleCloseModal} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !tempDetails.firstName || validationErrors.length > 0}>
              {saving ? (
                <>
                  <ButtonSpinner />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-4">
          <img
            src={tempImagePreview || userDetails.imageUrl || "/placeholder.png"}
            alt="Profile picture"
            className="size-16 rounded-full object-cover shadow-[0_0_0_3px_rgb(var(--c-sheet-edge))]"
          />
          <Button variant="secondary" size="sm" onClick={() => setIsPictureModalOpen(true)}>
            Change picture
          </Button>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstName">First name</Label>
            <Input {...fieldProps("firstName", true)} placeholder="Enter your first name" autoComplete="given-name" />
          </div>
          <div>
            <Label htmlFor="lastName">
              Last name <span className="font-normal text-ink-soft">(optional)</span>
            </Label>
            <Input {...fieldProps("lastName", true)} placeholder="Enter your last name" autoComplete="family-name" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="email">Email address</Label>
            <Input {...fieldProps("email", true)} type="email" placeholder="your.email@example.com" autoComplete="email" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="jobTitle">Job title</Label>
            <Input {...fieldProps("jobTitle")} placeholder="e.g. Software Engineer" />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input {...fieldProps("location")} placeholder="City, Country" />
          </div>
          <div>
            <Label htmlFor="college">College or organization</Label>
            <Input {...fieldProps("college")} placeholder="e.g. University of Technology" />
          </div>
        </div>

        {(validationErrors.length > 0 || saveFailed) && (
          <ul role="alert" className="mt-5 space-y-1 text-[15px] font-medium text-danger">
            {validationErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
            {saveFailed && <li>Your profile wasn’t saved. Check your connection and try again.</li>}
          </ul>
        )}

        <ProfileImageModal
          isOpen={isPictureModalOpen}
          onClose={() => setIsPictureModalOpen(false)}
          onImageChange={handleImageChange}
          currentImage={tempImagePreview || userDetails.imageUrl || "/placeholder.png"}
        />
      </Dialog>
    </>
  );
}
