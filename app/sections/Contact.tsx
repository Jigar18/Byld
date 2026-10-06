"use client";

import { useRef, useState } from "react";
import { ArrowUpRight, Copy, Pencil } from "lucide-react";
import { Button, ButtonSpinner } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SOCIAL_PLATFORMS, type SocialPlatform } from "@/types/portfolio";
import PortfolioSection from "../components/PortfolioSection";
import Toast, { type ToastState } from "../components/Toast";
import {
  displaySocialLink,
  platformLabel,
  SocialIcon,
  socialLinkHref,
  toSocialLinks,
  type SocialLink,
} from "../components/socialLinks";
import { useUser } from "../context/UserContext";

export default function Contact() {
  const { isOwner, socialLinks, setSocialLinks } = useUser();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tempSocialLinks, setTempSocialLinks] = useState<Partial<Record<SocialPlatform, string>>>({});
  const [toast, setToast] = useState<ToastState>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const toastTimer = useRef<number | undefined>(undefined);

  const copyToClipboard = async (link: SocialLink) => {
    try {
      await navigator.clipboard.writeText(link.url);
      setToast({
        message: link.platform === "email" ? "Email address copied." : `${platformLabel(link.platform)} link copied.`,
        success: true,
      });
    } catch (err) {
      console.error("Failed to copy: ", err);
      setToast({ message: "The link could not be copied.", success: false });
    }
    // Restart the timer so a second copy is not hidden early by the first one.
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3000);
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

  return (
    <PortfolioSection
      id="contact"
      title="Contact"
      action={
        isOwner && (
          <Button variant="secondary" size="sm" onClick={handleOpenModal} aria-label="Edit social links">
            <Pencil aria-hidden="true" />
            Edit
          </Button>
        )
      }
    >
      {socialLinks.length === 0 ? (
        <p className="text-ink-soft">No links yet. Add them so people can find your work and reach you.</p>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {socialLinks.map((link) => {
            const label = platformLabel(link.platform);
            const href = socialLinkHref(link);
            const opensNewTab = link.platform !== "email";

            return (
              <li key={link.platform} className="flex items-center gap-3 py-3.5 sm:gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line">
                  <SocialIcon platform={link.platform} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-snug">{label}</p>
                  <p className="truncate font-mono text-[13px] text-ink-soft">{displaySocialLink(link)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(link)}
                  aria-label={link.platform === "email" ? "Copy email address" : `Copy ${label} link`}
                  className="max-sm:w-9 max-sm:px-0"
                >
                  <Copy aria-hidden="true" />
                  <span className="max-sm:hidden">Copy</span>
                </Button>
                {href && (
                  <Button asChild variant="secondary" size="sm" className="max-sm:w-9 max-sm:px-0">
                    <a
                      href={href}
                      target={opensNewTab ? "_blank" : undefined}
                      rel={opensNewTab ? "noopener noreferrer" : undefined}
                      aria-label={link.platform === "email" ? "Write an email" : `Open ${label}`}
                    >
                      <ArrowUpRight aria-hidden="true" />
                      <span className="max-sm:hidden">{link.platform === "email" ? "Write" : "Open"}</span>
                    </a>
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}

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
    </PortfolioSection>
  );
}
