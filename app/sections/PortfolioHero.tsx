"use client";

import type { CSSProperties } from "react";
import { Building2, MapPin } from "lucide-react";
import EditProfile from "../components/EditProfile";
import ProfileImage from "../components/ProfileImage";
import { useUser } from "../context/UserContext";
import About from "./AboutSection";
import ProfileLinks from "./ProfileLinks";

const capitalizeWords = (text: string) => text.replace(/\b\w/g, (char) => char.toUpperCase());

// The hero's lines come in one after another when the page is ready; this sets a line's turn.
const riseTurn = (turn: number) => ({ "--rise": turn }) as CSSProperties;

// The owner's picture stands on the page by itself, inside a thin ring. On wide screens it leans toward
// the pointer, and the ring is lit where the pointer is near it.
function Portrait() {
  return (
    <div className="pf-portrait-rig relative order-first w-max lg:order-last lg:mr-6">
      <div aria-hidden="true" className="pf-glow" />
      <div
        data-light
        data-tilt="12"
        className="pf-portrait relative size-[104px] sm:size-[124px] lg:size-[290px] xl:size-[320px]"
      >
        <span aria-hidden="true" className="pf-portrait-ring" />
        <span aria-hidden="true" className="pf-portrait-orbit" />
        <div className="pf-portrait-photo size-full">
          <ProfileImage />
        </div>
      </div>
    </div>
  );
}

const factClass = "flex items-center gap-2 [&_svg]:size-4 [&_svg]:shrink-0";

function ProfileFacts() {
  const { userDetails } = useUser();
  if (!userDetails.college && !userDetails.location) return null;

  return (
    <ul
      className="pf-rise mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-ink-soft sm:mt-5 sm:text-base"
      style={riseTurn(2)}
    >
      {userDetails.college && (
        <li className={factClass}>
          <Building2 aria-hidden="true" />
          {userDetails.college}
        </li>
      )}
      {userDetails.location && (
        <li className={factClass}>
          <MapPin aria-hidden="true" />
          {userDetails.location}
        </li>
      )}
    </ul>
  );
}

export default function PortfolioHero() {
  const { userDetails, isOwner } = useUser();

  const displayName =
    [userDetails.firstName, userDetails.lastName].filter(Boolean).map(capitalizeWords).join(" ") || "Your name";

  return (
    <section
      aria-labelledby="portfolio-name"
      className="grid items-center gap-7 pb-14 pt-9 sm:gap-8 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-20 lg:pb-24 lg:pt-20"
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

        <ProfileFacts />

        {isOwner && (
          <div className="pf-rise mt-5" style={riseTurn(2)}>
            <EditProfile />
          </div>
        )}

        <div className="pf-rise mt-6 sm:mt-7" style={riseTurn(3)}>
          <About />
        </div>

        <div className="pf-rise mt-7 sm:mt-9" style={riseTurn(4)}>
          <ProfileLinks />
        </div>
      </div>

      <Portrait />
    </section>
  );
}
