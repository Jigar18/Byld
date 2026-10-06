"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useUser } from "../context/UserContext";
import LogoutButton from "./LogoutButton";
import ThemeToggle from "./ThemeToggle";

export interface SectionLink {
  id: string;
  label: string;
}

// Stays with the reader down the page: whose portfolio this is, where they are in it, and the theme.
export default function PortfolioTopBar({ sections }: { sections: SectionLink[] }) {
  const { isOwner, portfolioUsername } = useUser();
  // Null while the hero is still on screen, before the first section is reached.
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [marker, setMarker] = useState<{ left: number; width: number } | null>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const pressed = useRef<{ until: number; restY: number | null } | null>(null);

  useEffect(() => {
    const markCurrentSection = () => {
      // A pressed link stays marked while the page scrolls to its section, and after that until the reader
      // scrolls on. Without the second part, a section beside another one would hand the marker to its neighbour.
      const press = pressed.current;
      if (press) {
        if (performance.now() < press.until) return;
        press.restY ??= window.scrollY;
        if (Math.abs(window.scrollY - press.restY) < 160) return;
        pressed.current = null;
      }

      // The current section is the lowest one whose top has passed the upper third of the window.
      // Sections can sit side by side, and then the first of them counts.
      const readingLine = window.innerHeight * 0.3;
      let current: string | null = null;
      let currentTop = Number.NEGATIVE_INFINITY;
      for (const { id } of sections) {
        const top = document.getElementById(id)?.getBoundingClientRect().top;
        if (top !== undefined && top <= readingLine && top > currentTop + 1) {
          current = id;
          currentTop = top;
        }
      }

      // Short sections at the end can never reach the reading line, so the bottom of the page counts as the last one.
      const atPageEnd =
        window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      setCurrentId(atPageEnd ? (sections[sections.length - 1]?.id ?? null) : current);
    };

    markCurrentSection();
    window.addEventListener("scroll", markCurrentSection, { passive: true });
    window.addEventListener("resize", markCurrentSection);
    return () => {
      window.removeEventListener("scroll", markCurrentSection);
      window.removeEventListener("resize", markCurrentSection);
    };
  }, [sections]);

  // The marker slides to sit behind the current section's link.
  useLayoutEffect(() => {
    const placeMarker = () => {
      const link = linksRef.current?.querySelector<HTMLElement>('[aria-current="true"]');
      setMarker(link ? { left: link.offsetLeft, width: link.offsetWidth } : null);
    };

    placeMarker();
    window.addEventListener("resize", placeMarker);
    return () => window.removeEventListener("resize", placeMarker);
  }, [currentId, sections]);

  const markPressedLink = (id: string) => {
    setCurrentId(id);
    pressed.current = { until: performance.now() + 900, restY: null };
  };

  return (
    <header className="sticky top-3 z-40 flex h-[58px] items-center gap-3 rounded-full bg-surface/75 pl-5 pr-2 shadow-[var(--surface-shadow)] backdrop-blur-xl sm:top-4 sm:pl-6">
      <div className="flex min-w-0 flex-1">
        <a
          href="#top"
          aria-label={`${portfolioUsername}, back to the top`}
          className="truncate rounded-full font-mono text-sm font-medium text-ink-soft transition-colors hover:text-ink"
        >
          /{portfolioUsername}
        </a>
      </div>

      {sections.length > 1 && (
        <nav aria-label="Sections" className="hidden lg:block">
          <div ref={linksRef} className="relative flex items-center">
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 rounded-full bg-ink transition-[transform,width,opacity] duration-300 ease-out motion-reduce:transition-none"
              style={{
                width: marker?.width ?? 0,
                opacity: marker ? 1 : 0,
                transform: `translateX(${marker?.left ?? 0}px)`,
              }}
            />
            {sections.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={id === currentId ? "true" : undefined}
                onClick={() => markPressedLink(id)}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-sm transition-colors duration-300",
                  id === currentId ? "font-semibold text-on-ink" : "font-medium text-ink-soft hover:text-ink",
                )}
              >
                {label}
              </a>
            ))}
          </div>
        </nav>
      )}

      <div className="flex flex-none items-center justify-end gap-1 lg:flex-1">
        {isOwner && <LogoutButton />}
        <ThemeToggle />
      </div>
    </header>
  );
}
