"use client";

import type { PortfolioEducation } from "@/types/portfolio";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "../context/UserContext";
import EducationModal from "./EducationModal";
import PortfolioSection from "./PortfolioSection";

const formatYears = (edu: PortfolioEducation) => {
  if (edu.isCurrently) return `${edu.startYear} – Present`;
  return edu.endYear ? `${edu.startYear} – ${edu.endYear}` : String(edu.startYear);
};

export default function Education() {
  const { isOwner, portfolioData } = useUser();
  const [education, setEducation] = useState<PortfolioEducation[]>(portfolioData.education);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveEducation = async (updatedEducation: PortfolioEducation[]) => {
    const response = await fetch("/api/education", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ education: updatedEducation }),
    });
    if (!response.ok) throw new Error("Failed to save education");
    const data = (await response.json()) as { education: PortfolioEducation[] };
    setEducation(data.education);
  };

  return (
    <PortfolioSection
      id="education"
      title="Education"
      action={
        isOwner && (
          <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(true)} aria-label="Edit education">
            <Pencil aria-hidden="true" />
            Edit
          </Button>
        )
      }
    >
      {education.length === 0 ? (
        <p className="text-ink-soft">No education yet. Add where you studied and what you studied.</p>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {education.map((edu, index) => (
            <li key={edu.id || index} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4">
              <div className="min-w-0">
                <h3 className="font-display text-lg font-semibold leading-snug tracking-[-0.01em]">{edu.school}</h3>
                <p className="mt-0.5 text-ink-soft">{[edu.degree, edu.field].filter(Boolean).join(", ")}</p>
              </div>
              <p className="shrink-0 text-sm tabular-nums text-ink-soft">{formatYears(edu)}</p>
            </li>
          ))}
        </ul>
      )}

      {isOwner && (
        <EducationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          education={education}
          onSave={handleSaveEducation}
        />
      )}
    </PortfolioSection>
  );
}
