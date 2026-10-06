"use client";

import type { CSSProperties } from "react";
import { Building2, MapPin } from "lucide-react";
import EditProfile from "../components/EditProfile";
import PortfolioViewCount from "../components/PortfolioViewCount";
import ProfileImage from "../components/ProfileImage";
import { useUser } from "../context/UserContext";
import About from "./AboutSection";
import ProfileLinks from "./ProfileLinks";

const capitalizeWords = (text: string) => text.replace(/\b\w/g, (char) => char.toUpperCase());

// The hero's lines come in one after another when the page is ready; this sets a line's turn.
const riseTurn = (turn: number) => ({ "--rise": turn }) as CSSProperties;

// A dark sheet standing on the page with the owner's picture and the facts about them. It turns to face the pointer.
function IdentitySheet() {
  const { userDetails } = useUser();

  return (
    <div className="pf-pass-rig relative order-first lg:order-last">
      <div aria-hidden="true" className="pf-glow" />
      <div data-light data-tilt="9" className="pf-pass ui-sheet flex items-center gap-5 p-4 lg:block lg:p-6">
        <span aria-hidden="true" className="pf-pass-back" />

        <div className="pf-pass-photo relative size-[84px] flex-none lg:mx-auto lg:mb-9 lg:mt-5 lg:size-[212px]">
          <span aria-hidden="true" className="pf-pass-orbit" />
          <ProfileImage />
        </div>

        <div className="pf-pass-facts min-w-0 flex-1 lg:px-1">
          {(userDetails.location || userDetails.college) && (
            <ul className="mb-2.5 space-y-1.5 text-[15px] leading-snug lg:mb-4 lg:space-y-2.5 lg:text-base">
              {userDetails.college && (
                <li className="flex gap-2.5">
                  <Building2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink-soft lg:mt-[3px]" />
                  {userDetails.college}
                </li>
              )}
              {userDetails.location && (
                <li className="flex gap-2.5">
                  <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink-soft lg:mt-[3px]" />
                  {userDetails.location}
                </li>
              )}
            </ul>
          )}
          <PortfolioViewCount />
        </div>

        <span aria-hidden="true" className="pf-pass-glare" />
      </div>
    </div>
  );
}

export default function PortfolioHero() {
  const { userDetails, isOwner } = useUser();

  const displayName =
    [userDetails.firstName, userDetails.lastName].filter(Boolean).map(capitalizeWords).join(" ") || "Your name";

  return (
    <section
      aria-labelledby="portfolio-name"
      className="grid items-center gap-9 pb-14 pt-9 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_330px] lg:gap-20 lg:pb-24 lg:pt-20"
    >
      <div className="min-w-0">
        <h1
          id="portfolio-name"
          data-light
          className="pf-name pf-rise text-balance font-display text-[clamp(46px,7.6vw,104px)] font-semibold leading-[0.96] tracking-[-0.04em] [overflow-wrap:anywhere]"
        >
          {displayName}
        </h1>

        {userDetails.jobTitle && (
          <p
            className="pf-rise mt-4 font-display text-[22px] font-medium leading-snug tracking-[-0.01em] sm:mt-5 sm:text-[27px]"
            style={riseTurn(1)}
          >
            {capitalizeWords(userDetails.jobTitle)}
          </p>
        )}

        {isOwner && (
          <div className="pf-rise mt-5" style={riseTurn(1)}>
            <EditProfile />
          </div>
        )}

        <div className="pf-rise mt-6 sm:mt-7" style={riseTurn(2)}>
          <About />
        </div>

        <div className="pf-rise mt-7 sm:mt-9" style={riseTurn(3)}>
          <ProfileLinks />
        </div>
      </div>

      <IdentitySheet />
    </section>
  );
}
