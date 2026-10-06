"use client";

import { useEffect, useState } from "react";

export interface SectionLink {
  id: string;
  label: string;
}

export default function SectionIndex({ sections }: { sections: SectionLink[] }) {
  const [currentId, setCurrentId] = useState(sections[0]?.id);

  useEffect(() => {
    const markCurrentSection = () => {
      // The current section is the last one whose heading has passed the upper third of the window.
      const readingLine = window.innerHeight * 0.3;
      let current = sections[0]?.id;
      for (const { id } of sections) {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= readingLine) current = id;
      }

      // Short sections at the end can never reach the reading line, so the bottom of the page counts as the last one.
      const atPageEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      setCurrentId(atPageEnd ? sections[sections.length - 1]?.id : current);
    };

    markCurrentSection();
    window.addEventListener("scroll", markCurrentSection, { passive: true });
    window.addEventListener("resize", markCurrentSection);
    return () => {
      window.removeEventListener("scroll", markCurrentSection);
      window.removeEventListener("resize", markCurrentSection);
    };
  }, [sections]);

  if (sections.length < 2) return null;

  return (
    <nav aria-label="Sections" className="pf-index mt-10">
      {sections.map(({ id, label }) => (
        <a key={id} href={`#${id}`} aria-current={id === currentId ? "true" : undefined}>
          {label}
        </a>
      ))}
    </nav>
  );
}
