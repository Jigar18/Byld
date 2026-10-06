"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import ProfileImageModal from "./ProfileImageModal";
import { useUser } from "../context/UserContext";

// Fills whatever box it is placed in; the initials scale with that box.
// Always a circle: pictures cropped during onboarding are saved as one, with the corners blacked out.
export default function ProfileImage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { userDetails, isOwner, updateUserDetails } = useUser();

  const initials = [userDetails.firstName, userDetails.lastName]
    .map((name) => name?.trim().charAt(0).toUpperCase() ?? "")
    .join("");

  return (
    <div className="relative size-full [container-type:inline-size]">
      {userDetails.imageUrl ? (
        <img src={userDetails.imageUrl} alt="Profile picture" className="size-full rounded-full object-cover" />
      ) : (
        <div
          aria-hidden="true"
          className="grid size-full place-items-center rounded-full bg-brand font-display text-[length:38cqw] font-semibold text-white"
        >
          {initials}
        </div>
      )}

      {isOwner && (
        <>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            aria-label="Edit profile picture"
            className="absolute -bottom-1.5 -right-1.5 grid size-9 place-items-center rounded-full border border-sheet-edge bg-sheet-raised text-ink transition-colors hover:bg-ink hover:text-on-ink lg:bottom-1.5 lg:right-1.5 lg:size-10"
          >
            <Camera className="size-4" />
          </button>
          <ProfileImageModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onImageChange={(imageUrl) => updateUserDetails({ imageUrl })}
            currentImage={userDetails.imageUrl || ""}
          />
        </>
      )}
    </div>
  );
}
