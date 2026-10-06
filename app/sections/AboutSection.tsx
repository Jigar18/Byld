"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button, ButtonSpinner } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import PortfolioSection from "../components/PortfolioSection";
import { useUser } from "../context/UserContext";

const MAX_ABOUT_LENGTH = 1000;

export default function About() {
  const { userDetails, isOwner, updateUserDetails } = useUser();
  const aboutText = userDetails.about ?? "";
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tempAboutText, setTempAboutText] = useState(aboutText);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      setSaveFailed(false);
      const response = await fetch("/api/updateUserDetails", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ about: tempAboutText }),
      });

      const data = await response.json();

      if (data.success) {
        updateUserDetails({ about: tempAboutText });
        setIsEditModalOpen(false);
      } else {
        console.error("Failed to update about text:", data.error);
        setSaveFailed(true);
      }
    } catch (error) {
      console.error("Error updating about text:", error);
      setSaveFailed(true);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => setIsEditModalOpen(false);

  const handleOpenModal = () => {
    setTempAboutText(aboutText);
    setSaveFailed(false);
    setIsEditModalOpen(true);
  };

  return (
    <PortfolioSection
      id="about"
      title="About"
      action={
        isOwner && (
          <Button variant="secondary" size="sm" onClick={handleOpenModal} aria-label="Edit about">
            <Pencil aria-hidden="true" />
            Edit
          </Button>
        )
      }
    >
      {aboutText ? (
        <p className="max-w-[68ch] whitespace-pre-wrap text-[17px] leading-[1.7] sm:text-lg sm:leading-[1.7]">
          {aboutText}
        </p>
      ) : (
        <p className="text-ink-soft">
          Nothing here yet. Tell visitors who you are, what you work on and what you’re looking for.
        </p>
      )}

      <Dialog
        open={isEditModalOpen}
        onClose={handleCloseModal}
        title="Edit about"
        busy={saving}
        onSubmit={handleSaveChanges}
        footer={
          <>
            <Button variant="ghost" onClick={handleCloseModal} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
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
        <Label htmlFor="about-text">About you</Label>
        <Textarea
          id="about-text"
          value={tempAboutText}
          onChange={(e) => setTempAboutText(e.target.value)}
          placeholder="Write something about yourself…"
          className="mt-2 min-h-[240px]"
          maxLength={MAX_ABOUT_LENGTH}
        />
        <div className="mt-2 flex justify-between gap-4 text-sm text-ink-soft">
          <span>Line breaks are kept, so you can write in paragraphs.</span>
          <span className="shrink-0 tabular-nums">
            {tempAboutText.length}/{MAX_ABOUT_LENGTH}
          </span>
        </div>

        {saveFailed && (
          <p role="alert" className="mt-4 text-[15px] font-medium text-danger">
            Your changes weren’t saved. Check your connection and try again.
          </p>
        )}
      </Dialog>
    </PortfolioSection>
  );
}
