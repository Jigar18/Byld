"use client";

import type { PortfolioEducation } from "@/types/portfolio";
import { motion } from "framer-motion";
import { useState } from "react";
import { useUser } from "../context/UserContext";
import EducationModal from "./EducationModal";
import { BookOpen, Edit3 } from "lucide-react";
import CredentialCardHeader, { credentialEditButtonClass } from "./CredentialCardHeader";
import { primaryActionButtonClass } from "@/components/ui/button";

export default function Education() {
  const { isOwner, portfolioApiUrl, portfolioData } = useUser();
  const [education, setEducation] = useState<PortfolioEducation[]>(portfolioData.education);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [educationAtTop, setEducationAtTop] = useState(true);

  const handleSaveEducation = async (updatedEducation: PortfolioEducation[]) => {
    const existingIds = new Set(education.map((edu) => edu.id).filter(Boolean));
    const updatedIds = new Set(updatedEducation.map((edu) => edu.id).filter(Boolean));

    for (const id of existingIds) {
      if (!updatedIds.has(id)) await fetch(`/api/deleteEducation?id=${id}`, { method: "DELETE" });
    }

    for (const edu of updatedEducation) {
      if (!edu.school || !edu.degree || !edu.field) continue;
      const isExisting = Boolean(edu.id && existingIds.has(edu.id));
      await fetch("/api/education", {
        method: isExisting ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isExisting ? { id: edu.id } : {}),
          school: edu.school,
          degree: edu.degree,
          field: edu.field,
          startYear: edu.startYear,
          endYear: edu.endYear,
          isCurrently: edu.isCurrently,
        }),
      });
    }

    // Re-read so ordering and any server-created default entry match the portfolio.
    try {
      const response = await fetch(portfolioApiUrl("/api/getEducation"));
      const data = await response.json();
      setEducation(data.success ? data.education : []);
    } catch (error) {
      console.error("Error fetching education:", error);
      setEducation([]);
    }
  };

  return (
    <>
      <motion.div
        {...{
          className: "profile-card profile-surface-neutral profile-card-lift group relative flex h-[250px] flex-col rounded-xl border p-5 shadow-md"
        }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
      >
        <CredentialCardHeader
          title="Education"
          icon={<BookOpen className="h-5 w-5" />}
          action={isOwner ?
            <button
              onClick={() => setIsModalOpen(true)}
              className={credentialEditButtonClass}
              aria-label="Edit education"
              title="Edit education"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          : undefined}
        />
        
        <div className="relative min-h-0 flex-1 pt-3">
        <div
          className="credential-scrollbar h-full space-y-2 overflow-x-hidden overflow-y-auto pr-1"
          onScroll={(event) => setEducationAtTop(event.currentTarget.scrollTop <= 2)}
        >
          {education.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400 mb-4">No education information added yet</p>
              {isOwner && <button
                onClick={() => setIsModalOpen(true)}
                className={primaryActionButtonClass}
              >
                Add Education
              </button>}
            </div>
          ) : (
            education.map((edu, index) => (
              <motion.div
                key={edu.id || index}
                {...{
                  className: "relative min-h-[118px] rounded-lg px-2 py-4 transition-colors hover:bg-white/[0.035] sm:px-4"
                }}
              >
                {index > 0 && (
                  <span className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                )}
                <div>
                  <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <h3 className="portfolio-display text-lg font-semibold text-slate-100">
                      {edu.school}
                    </h3>
                    <span className="shrink-0 text-xs font-medium text-slate-400 sm:text-sm">
                      {edu.isCurrently
                        ? `${edu.startYear} - Present`
                        : edu.endYear ? `${edu.startYear} - ${edu.endYear}` : edu.startYear}
                    </span>
                  </div>
                  <p className="mb-1 font-medium text-zinc-300">{edu.degree}</p>
                  <p className="text-sm text-slate-300">{edu.field}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
        {educationAtTop && education.length > 1 && (
          <span className="pointer-events-none absolute bottom-2 right-3 rounded-full border border-white/10 bg-zinc-950/90 px-2.5 py-1 text-xs font-semibold text-zinc-300 shadow-lg">
            +{education.length - 1}
          </span>
        )}
        </div>
      </motion.div>

      {/* Education Modal */}
      {isOwner && <EducationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        education={education}
        onSave={handleSaveEducation}
      />}
    </>
  );
}
