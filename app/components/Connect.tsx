"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Edit3, Copy, Check, Share2 } from "lucide-react";
import { Button, primaryActionButtonClass, secondaryActionButtonClass } from "@/components/ui/button";
import CredentialCardHeader, { credentialEditButtonClass } from "./CredentialCardHeader";
import { useUser } from "../context/UserContext";

interface SocialLink {
  name: string;
  icon: React.ReactElement;
  url: string;
}

interface SocialLinkData {
  email?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  github?: string;
  medium?: string;
  blog?: string;
  leetcode?: string;
  youtube?: string;
  portfolio?: string;
  hackerrank?: string;
}

const arrangeSocialLinks = (links: SocialLink[]) => {
  const sorted = [...links].sort((a, b) => b.name.length - a.name.length);
  const arranged: SocialLink[] = [];

  while (sorted.length) {
    const longest = sorted.shift();
    if (longest) arranged.push(longest);
    const shortest = sorted.pop();
    if (shortest) arranged.push(shortest);
  }

  return arranged;
};

const getSocialIconColor = (_platform: string) => "#d4d4d8";

export default function Connect() {
  const { isOwner, portfolioApiUrl } = useUser();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [tempSocialLinks, setTempSocialLinks] = useState<{
    [key: string]: string;
  }>({});
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showCopyToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const copyToClipboard = async (url: string, linkName: string) => {
    try {
      await navigator.clipboard.writeText(url);
      showCopyToast(`${linkName} link copied to clipboard!`);
    } catch (err) {
      console.error("Failed to copy: ", err);
      showCopyToast("Failed to copy link");
    }
  };

  const fetchSocialLinks = useCallback(async () => {
    try {
      const response = await fetch(portfolioApiUrl("/api/getSocialLinks"));
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const socialLinksData: SocialLinkData = data.socialLinks;
          const linksArray: SocialLink[] = [];

          // Convert object format to array of links for display
          Object.entries(socialLinksData).forEach(([platform, url]) => {
            if (
              url &&
              platform !== "id" &&
              platform !== "userId" &&
              platform !== "createdAt" &&
              platform !== "updatedAt"
            ) {
              linksArray.push({
                name: platform.charAt(0).toUpperCase() + platform.slice(1),
                icon: getIconForPlatform(platform),
                url: url as string,
              });
            }
          });

          setSocialLinks(linksArray);
        }
      }
    } catch (error) {
      console.error("Error fetching social links:", error);
      setSocialLinks([]);
    }
  }, [portfolioApiUrl]);

  useEffect(() => {
    setMounted(true);
    fetchSocialLinks();
    return () => setMounted(false);
  }, [fetchSocialLinks]);

  const getIconForPlatform = (platform: string) => {
    const platformLower = platform.toLowerCase();
    switch (platformLower) {
      case "email":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
            />
          </svg>
        );
      case "twitter":
        return (
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="size-5"
          >
            <path
              fill="currentColor"
              d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
            />
          </svg>
        );
      case "linkedin":
        return (
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="size-5"
          >
            <path
              fill="currentColor"
              d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
            />
          </svg>
        );
      case "instagram":
        return (
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="size-5"
          >
            <path
              fill="currentColor"
              d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
            />
          </svg>
        );
      case "github":
        return (
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="size-5"
          >
            <path
              fill="currentColor"
              d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
            />
          </svg>
        );
      case "medium":
        return (
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="size-5"
          >
            <path
              fill="currentColor"
              d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"
            />
          </svg>
        );
      case "blog":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h6.75"
            />
          </svg>
        );
      case "leetcode":
        return (
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="size-5"
          >
            <path
              fill="currentColor"
              d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"
            />
          </svg>
        );
      case "youtube":
        return (
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="size-5"
          >
            <path
              fill="currentColor"
              d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
            />
          </svg>
        );
      case "portfolio":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3s-4.5 4.03-4.5 9 2.015 9 4.5 9z"
            />
          </svg>
        );
      case "hackerrank":
        return (
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="size-5"
          >
            <path
              fill="currentColor"
              d="M12 0c1.285 0 9.75 4.886 10.392 6 .645 1.115.645 10.885 0 12S13.287 24 12 24s-9.75-4.885-10.395-6c-.641-1.115-.641-10.885 0-12C2.25 4.886 10.715 0 12 0zm2.295 6.799c-.141 0-.258.115-.258.258v3.875H9.963V6.799c0-.141-.115-.258-.258-.258H8.684c-.141 0-.258.115-.258.258v10.402c0 .141.115.258.258.258h1.021c.141 0 .258-.115.258-.258V12.82h4.074v4.381c0 .141.115.258.258.258h1.021c.141 0 .258-.115.258-.258V6.799c0-.141-.115-.258-.258-.258H14.295z"
            />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
            />
          </svg>
        );
    }
  };

  const handleOpenModal = () => {
    // Initialize temp social links with current values
    const tempLinks: { [key: string]: string } = {};
    socialLinks.forEach((link) => {
      tempLinks[link.name] = link.url;
    });
    // Add all possible platforms
    const allPlatforms = [
      "Email",
      "Twitter",
      "Linkedin",
      "Instagram",
      "Github",
      "Medium",
      "Blog",
      "Leetcode",
      "Youtube",
      "Portfolio",
      "Hackerrank",
    ];
    allPlatforms.forEach((platform) => {
      if (!tempLinks[platform]) {
        tempLinks[platform] = "";
      }
    });
    setTempSocialLinks(tempLinks);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setTempSocialLinks({});
    setIsEditModalOpen(false);
  };

  const handleSaveChanges = async () => {
    try {
      // Convert temp links to the format expected by the API
      const socialLinksData: { [key: string]: string } = {};

      Object.entries(tempSocialLinks).forEach(([platform, url]) => {
        const platformKey = platform.toLowerCase();
        socialLinksData[platformKey] = url.trim() || "";
      });

      const response = await fetch("/api/updateSocialLinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ socialLinks: socialLinksData }),
      });

      if (response.ok) {
        // Refetch the updated data
        await fetchSocialLinks();
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error saving social links:", error);
    }
  };

  const handleUrlChange = (platform: string, url: string) => {
    setTempSocialLinks((prev) => ({
      ...prev,
      [platform]: url,
    }));
  };

  const arrangedSocialLinks = arrangeSocialLinks(socialLinks);

  return (
    <>
      <div className="relative group">
        <motion.div
          {...{
            className:
              "profile-card profile-surface-neutral profile-card-lift relative flex h-[250px] flex-col overflow-hidden rounded-xl border p-5 shadow-md",
            whileHover: { y: -5 },
            transition: { duration: 0.3 },
          }}
        >
          <CredentialCardHeader
            title="Connect"
            icon={<Share2 className="h-5 w-5" />}
            action={isOwner ?
              <button
                className={credentialEditButtonClass}
                onClick={handleOpenModal}
                type="button"
                aria-label="Edit social links"
                title="Edit social links"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            : undefined}
          />

          <div className="credential-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto pt-3 pr-1">
          <div className="flex flex-wrap content-start gap-2.5">
            {arrangedSocialLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => copyToClipboard(link.url, link.name)}
                className="inline-flex h-10 w-fit items-center gap-2.5 whitespace-nowrap rounded-xl border border-white/10 bg-white/[0.025] px-3.5 text-sm font-medium text-zinc-300 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                title={`Copy ${link.name} link`}
              >
                <span style={{ color: getSocialIconColor(link.name) }}>
                  {link.icon}
                </span>
                <span>{link.name}</span>
              </button>
            ))}
            {socialLinks.length === 0 && (
              <p className="py-2 text-sm text-slate-500">Add links so people can find your work.</p>
            )}
          </div>
          </div>
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
                  Edit Social Links
                </h2>

                {/* Social Links Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {Object.entries(tempSocialLinks).map(([platform, url]) => (
                    <div key={platform} className="space-y-2">
                      <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <span style={{ color: getSocialIconColor(platform) }}>
                          {getIconForPlatform(platform)}
                        </span>
                        {platform}
                      </label>
                      <input
                        type="url"
                        value={url}
                        onChange={(e) =>
                          handleUrlChange(platform, e.target.value)
                        }
                        placeholder={`Enter ${platform} URL`}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      />
                    </div>
                  ))}
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
                    className={primaryActionButtonClass}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9"
                      />
                    </svg>
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Toast Notification */}
      {mounted &&
        showToast &&
        createPortal(
          <AnimatePresence>
            <motion.div
              {...{
                className:
                  "fixed top-4 right-4 z-[60000] bg-slate-800 border border-slate-600 rounded-lg shadow-lg p-4 max-w-sm",
              }}
              initial={{ opacity: 0, y: -50, x: 50 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -50, x: 50 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-zinc-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-200">
                    {toastMessage}
                  </p>
                </div>
                <button
                  onClick={() => setShowToast(false)}
                  className="flex-shrink-0 text-slate-400 hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
