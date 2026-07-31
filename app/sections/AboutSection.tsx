"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Edit3, Save } from "lucide-react";
import { Button, primaryActionButtonClass, secondaryActionButtonClass } from "@/components/ui/button";
import { useUser } from "../context/UserContext";

export default function About() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref as React.RefObject<HTMLElement>, {
    once: true,
    margin: "-100px",
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [aboutText, setAboutText] = useState("");
  const [tempAboutText, setTempAboutText] = useState(aboutText);
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const { userDetails, loading: userLoading, isOwner, updateUserDetails } = useUser();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (userDetails?.about) {
      setAboutText(userDetails.about);
    }
  }, [userDetails]);

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
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
        setAboutText(tempAboutText);
        updateUserDetails({ about: tempAboutText });
        setIsEditModalOpen(false);
      } else {
        console.error("Failed to update about text:", data.error);
      }
    } catch (error) {
      console.error("Error updating about text:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setTempAboutText(aboutText);
    setIsEditModalOpen(false);
  };

  const handleOpenModal = () => {
    setTempAboutText(aboutText);
    setIsEditModalOpen(true);
  };

  return (
    <>
      <div ref={ref} className="w-full">
        <motion.div
          {...{
            className:
              "profile-accent-rose profile-section-rule relative group border-l py-3 pl-4 pr-2 sm:pl-8 sm:pr-4",
            initial: { y: 50, opacity: 0 },
            animate: isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 },
            transition: { duration: 0.8, ease: "easeOut" },
            whileHover: { x: 4 },
          }}
        >
          {/* Edit Button */}
          {isOwner && <button
            className="absolute right-2 top-3 p-2 rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-300 hover:text-white border border-slate-600 opacity-100 sm:right-4 sm:top-4 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 hover:scale-105"
            onClick={handleOpenModal}
            type="button"
          >
            <Edit3 className="h-4 w-4" />
          </button>}

          <h2 className="profile-section-label mb-6 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.22em]">
            <span className="profile-icon inline-flex rounded-lg border p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-user"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            About Me
          </h2>

          {userLoading ? (
            <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              <div className="space-y-2">
                <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
                <div className="h-4 bg-slate-700 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-slate-700 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          ) : (
            <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {aboutText || (isOwner
                ? "Click the edit button to add information about yourself..."
                : "No about information has been added yet.")}
            </div>
          )}
        </motion.div>
      </div>

      {/* Edit Modal */}
      {mounted &&
        isOwner &&
        isEditModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={handleCloseModal}
          >
            <div
              className="relative max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 shadow-2xl animate-in zoom-in-95 duration-200 sm:max-h-[90vh]"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              {/* Close button */}
              <Button
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
                onClick={handleCloseModal}
                aria-label="Close modal"
                size="icon"
              >
                <X className="h-5 w-5" />
              </Button>

              <div className="p-4 sm:p-6">
                <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                  <span className="bg-zinc-900/20 p-1.5 rounded text-zinc-400">
                    <Edit3 className="h-5 w-5" />
                  </span>
                  Edit About Section
                </h2>

                {/* Text Area */}
                <div className="mb-6">
                  <label
                    htmlFor="about-text"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    About Me ({tempAboutText.length}/1000 characters)
                  </label>
                  <textarea
                    id="about-text"
                    value={tempAboutText}
                    onChange={(e) => {
                      if (e.target.value.length <= 1000) {
                        setTempAboutText(e.target.value);
                      }
                    }}
                    placeholder="Write something about yourself..."
                    className="w-full h-40 p-4 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent resize-none"
                    maxLength={1000}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Tip: Use line breaks to create paragraphs. Your formatting
                    will be preserved.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <Button
                    variant="outline"
                    onClick={handleCloseModal}
                    className={secondaryActionButtonClass}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveChanges}
                    disabled={saving}
                    className={primaryActionButtonClass}
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
