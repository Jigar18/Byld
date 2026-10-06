"use client";

import { Building2, MapPin } from "lucide-react";
import EditProfile from "../components/EditProfile";
import LogoutButton from "../components/LogoutButton";
import PortfolioViewCount from "../components/PortfolioViewCount";
import ProfileImage from "../components/ProfileImage";
import SectionIndex, { type SectionLink } from "../components/SectionIndex";
import ThemeToggle from "../components/ThemeToggle";
import { platformLabel, SocialIcon, socialLinkHref } from "../components/socialLinks";
import { useUser } from "../context/UserContext";

const capitalizeWords = (text: string) => text.replace(/\b\w/g, (char) => char.toUpperCase());

// Who the portfolio belongs to. It is pinned beside the work on wide screens and opens the page on narrow ones.
export default function ProfileSheet({ sections }: { sections: SectionLink[] }) {
  const { userDetails, isOwner, portfolioUsername, socialLinks } = useUser();

  const displayName =
    [userDetails.firstName, userDetails.lastName].filter(Boolean).map(capitalizeWords).join(" ") || "Your name";

  return (
    <aside className="ui-sheet pf-sheet ui-scroll-quiet flex flex-col rounded-[28px] p-6 sm:p-8 lg:sticky lg:top-7 lg:h-[calc(100dvh-56px)] lg:overflow-y-auto">
      <div className="flex items-center justify-between gap-4">
        <span className="min-w-0 truncate font-mono text-sm text-ink-soft">/{portfolioUsername}</span>
        <div className="flex shrink-0 items-center gap-4">
          <PortfolioViewCount />
          <ThemeToggle />
        </div>
      </div>

      <div className="mt-9 lg:mt-11">
        <ProfileImage />
        <h1 className="mt-6 font-display text-[36px] font-semibold leading-[1.05] tracking-[-0.03em] [overflow-wrap:anywhere] sm:text-[40px]">
          {displayName}
        </h1>
        {userDetails.jobTitle && (
          <p className="mt-2.5 text-lg leading-snug text-ink-soft">{capitalizeWords(userDetails.jobTitle)}</p>
        )}

        {(userDetails.location || userDetails.college) && (
          <ul className="mt-5 space-y-2 text-[15px] leading-snug text-ink-soft">
            {userDetails.location && (
              <li className="flex gap-2.5">
                <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                {userDetails.location}
              </li>
            )}
            {userDetails.college && (
              <li className="flex gap-2.5">
                <Building2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                {userDetails.college}
              </li>
            )}
          </ul>
        )}

        {isOwner && (
          <div className="mt-6 flex flex-wrap items-center gap-1.5">
            <EditProfile />
            <LogoutButton />
          </div>
        )}
      </div>

      <SectionIndex sections={sections} />

      {socialLinks.length > 0 && (
        <ul className="mt-auto flex flex-wrap gap-2 pt-9">
          {socialLinks.map((link) => {
            const href = socialLinkHref(link);
            if (!href) return null;
            const opensNewTab = link.platform !== "email";

            return (
              <li key={link.platform}>
                <a
                  href={href}
                  target={opensNewTab ? "_blank" : undefined}
                  rel={opensNewTab ? "noopener noreferrer" : undefined}
                  aria-label={platformLabel(link.platform)}
                  title={platformLabel(link.platform)}
                  className="grid size-11 place-items-center rounded-full border border-line text-ink-soft transition-colors hover:border-ink hover:text-ink"
                >
                  <SocialIcon platform={link.platform} />
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
