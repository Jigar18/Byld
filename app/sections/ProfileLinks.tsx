"use client";

import { useRef, useState } from "react";
import { Check, Copy, Pencil, Plus } from "lucide-react";
import { Button, ButtonSpinner } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SOCIAL_PLATFORMS, type SocialPlatform } from "@/types/portfolio";
import Toast, { type ToastState } from "../components/Toast";
import {
  platformLabel,
  SocialIcon,
  socialLinkHref,
  toSocialLinks,
  type SocialLink,
} from "../components/socialLinks";
import { useUser } from "../context/UserContext";

const linkBodyClass = "flex h-full items-center gap-2.5 rounded-l-full pl-4 pr-2 text-[15px] font-semibold";

// The one place on the portfolio where the owner's links live. Each opens on a press and has its own copy control.
export default function ProfileLinks() {
  const { isOwner, socialLinks, setSocialLinks } = useUser();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tempSocialLinks, setTempSocialLinks] = useState<Partial<Record<SocialPlatform, string>>>({});
  const [toast, setToast] = useState<ToastState>(null);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const toastTimer = useRef<number | undefined>(undefined);

  const copyToClipboard = async (link: SocialLink) => {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopiedPlatform(link.platform);
      setToast({
        message: link.platform === "email" ? "Email address copied." : `${platformLabel(link.platform)} link copied.`,
        success: true,
      });
    } catch (err) {
      console.error("Failed to copy: ", err);
      setCopiedPlatform(null);
      setToast({ message: "The link could not be copied.", success: false });
    }
    // Restart the timer so a second copy is not hidden early by the first one.
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => {
      setToast(null);
      setCopiedPlatform(null);
    }, 3000);
  };

  const handleOpenModal = () => {
    // Existing links first, then the remaining platforms as empty fields.
    setTempSocialLinks(Object.fromEntries([
      ...socialLinks.map((link) => [link.platform, link.url]),
      ...SOCIAL_PLATFORMS.filter((platform) => !socialLinks.some((link) => link.platform === platform)).map((platform) => [platform, ""]),
    ]));
    setSaveError("");
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => setIsEditModalOpen(false);

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      setSaveError("");
      const response = await fetch("/api/updateSocialLinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          socialLinks: Object.fromEntries(
            Object.entries(tempSocialLinks).map(([platform, url]) => [platform, url.trim()]),
          ),
        }),
      });
      const data = (await response.json()) as { error?: string; socialLinks?: Record<string, string | null> };

      if (!response.ok) {
        throw new Error(data.error || "Social links could not be saved");
      }

      setSocialLinks(toSocialLinks(data.socialLinks ?? {}));
      handleCloseModal();
    } catch (error) {
      console.error("Error saving social links:", error);
      setSaveError(
        error instanceof Error ? error.message : "Social links could not be saved",
      );
    } finally {
      setSaving(false);
    }
  };

  if (socialLinks.length === 0 && !isOwner) return null;

  return (
    <>
      {socialLinks.length === 0 && (
        <p className="mb-3 max-w-[62ch] text-ink-soft">No links yet. Add them so people can find your work and reach you.</p>
      )}

      <ul className="flex flex-wrap items-center gap-2.5">
        {socialLinks.map((link) => {
          const label = platformLabel(link.platform);
          const href = socialLinkHref(link);
          const opensNewTab = link.platform !== "email";
          const copied = copiedPlatform === link.platform;

          return (
            <li
              key={link.platform}
              className="flex h-11 items-center rounded-full bg-surface shadow-[var(--surface-shadow)] transition-transform duration-200 ease-out hover:-translate-y-0.5 motion-reduce:transform-none"
            >
              {href ? (
                <a
                  href={href}
                  target={opensNewTab ? "_blank" : undefined}
                  rel={opensNewTab ? "noopener noreferrer" : undefined}
                  aria-label={link.platform === "email" ? "Write an email" : `Open ${label}`}
                  className={`${linkBodyClass} transition-colors hover:text-brand-text`}
                >
                  <SocialIcon platform={link.platform} className="size-[18px]" />
                  {label}
                </a>
              ) : (
                <span className={linkBodyClass}>
                  <SocialIcon platform={link.platform} className="size-[18px]" />
                  {label}
                </span>
              )}
              <button
                type="button"
                onClick={() => copyToClipboard(link)}
                aria-label={link.platform === "email" ? "Copy email address" : `Copy ${label} link`}
                title={link.platform === "email" ? "Copy email address" : "Copy link"}
                className="mr-1.5 grid size-8 place-items-center rounded-full text-ink-faint transition-colors hover:bg-well hover:text-ink"
              >
                {copied ? (
                  <Check aria-hidden="true" className="size-4 text-brand-text" />
                ) : (
                  <Copy aria-hidden="true" className="size-[15px]" />
                )}
              </button>
            </li>
          );
        })}

        {isOwner && (
          <li>
            <Button variant="ghost" size="sm" onClick={handleOpenModal}>
              {socialLinks.length > 0 ? <Pencil aria-hidden="true" /> : <Plus aria-hidden="true" />}
              {socialLinks.length > 0 ? "Edit links" : "Add links"}
            </Button>
          </li>
        )}
      </ul>

      <Dialog
        open={isEditModalOpen}
        onClose={handleCloseModal}
        title="Edit social links"
        description="Leave a field empty to remove that link from your portfolio."
        size="lg"
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
        <div className="grid gap-5 md:grid-cols-2">
          {(Object.entries(tempSocialLinks) as Array<[SocialPlatform, string]>).map(([platform, url]) => (
            <div key={platform}>
              <Label htmlFor={`social-${platform}`} className="flex items-center gap-2">
                <SocialIcon platform={platform} className="size-4" />
                {platformLabel(platform)}
              </Label>
              <Input
                id={`social-${platform}`}
                type={platform === "email" ? "email" : "url"}
                value={url}
                onChange={(e) => setTempSocialLinks((prev) => ({ ...prev, [platform]: e.target.value }))}
                placeholder={platform === "email" ? "Enter email address" : `Enter ${platformLabel(platform)} URL`}
                className="mt-2"
              />
            </div>
          ))}
        </div>

        {saveError && (
          <p role="alert" className="mt-5 text-[15px] font-medium text-danger">
            {saveError}
          </p>
        )}
      </Dialog>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
