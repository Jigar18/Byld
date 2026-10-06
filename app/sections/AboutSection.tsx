"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { Button, ButtonSpinner } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useUser } from "../context/UserContext";

const MAX_ABOUT_LENGTH = 1000;

// The hero's lead paragraph. Long ones are cut to a few lines, with the rest a press away.
export default function About() {
  const { userDetails, isOwner, updateUserDetails } = useUser();
  const aboutText = userDetails.about ?? "";
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tempAboutText, setTempAboutText] = useState(aboutText);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isCutShort, setIsCutShort] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  // Measured while collapsed only: once expanded, nothing is cut and the "Show less" control has to stay.
  useEffect(() => {
    const text = textRef.current;
    if (!text || expanded) return;

    const measure = () => setIsCutShort(text.scrollHeight > text.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(text);
    return () => observer.disconnect();
  }, [aboutText, expanded]);

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

  if (!aboutText && !isOwner) return null;

  return (
    <div className="max-w-[62ch]">
      {aboutText ? (
        <p
          ref={textRef}
          id="about-lead"
          className={cn(
            "whitespace-pre-wrap text-[17px] leading-[1.65] text-ink-soft sm:text-lg sm:leading-[1.65]",
            !expanded && "line-clamp-4",
          )}
        >
          {aboutText}
        </p>
      ) : (
        <p className="text-ink-soft">
          Nothing here yet. Tell visitors who you are, what you work on and what you’re looking for.
        </p>
      )}

      {(isCutShort || isOwner) && (
        <div className="-ml-3.5 mt-2 flex flex-wrap items-center gap-1">
          {isCutShort && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded((current) => !current)}
              aria-expanded={expanded}
              aria-controls="about-lead"
              className="font-semibold text-ink"
            >
              {expanded ? "Show less" : "Read more"}
            </Button>
          )}
          {isOwner && (
            <Button variant="ghost" size="sm" onClick={handleOpenModal}>
              <Pencil aria-hidden="true" />
              Edit about
            </Button>
          )}
        </div>
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
    </div>
  );
}
