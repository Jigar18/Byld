"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import Certifications from "../sections/Certifications";
import Experience from "../sections/Experience";
import PortfolioHero from "../sections/PortfolioHero";
import Projects from "../sections/Projects";
import CertificateModal from "../components/CertificateModal";
import Education from "../components/Education";
import GitHubHeatmap from "../components/GitHubHeatmap";
import PortfolioLoader from "../components/PortfolioLoader";
import PortfolioTopBar from "../components/PortfolioTopBar";
import Skills from "../components/Skills";
import { usePointerLight } from "../components/usePointerLight";
import { useRevealOnScroll } from "../components/useRevealOnScroll";
import { UserProvider, useUser } from "../context/UserContext";
import { cn } from "@/lib/utils";
import type { PortfolioCertificate, PortfolioInitialData } from "@/types/portfolio";

const cardGapClass = "grid gap-5 sm:gap-6";

function PortfolioFooter() {
  const { userDetails } = useUser();
  const name = [userDetails.firstName, userDetails.lastName].filter(Boolean).join(" ");

  return (
    <footer className="mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-2 text-sm text-ink-soft">
      <p>
        © {new Date().getFullYear()} {name}
      </p>
      <Link href="/" className="font-medium underline-offset-4 hover:text-ink hover:underline">
        Built with Byldit
      </Link>
    </footer>
  );
}

export default function PortfolioPage({ initialData }: { initialData: PortfolioInitialData }) {
  // The loader stays on top until hydration, so the hero comes in once and no control shows before it can respond.
  const [hydrated, setHydrated] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<PortfolioCertificate | null>(null);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [allCertificates, setAllCertificates] = useState<PortfolioCertificate[]>([]);
  const pageRef = useRef<HTMLDivElement>(null);
  usePointerLight(pageRef);
  useRevealOnScroll(pageRef);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Visitors only get the sections that have something in them. The owner gets all of them, so each can be filled in.
  const sections = useMemo(() => {
    const { projects, experiences, skills, education, certifications } = initialData;
    return [
      { id: "projects", label: "Projects", hasContent: projects.length > 0 },
      { id: "activity", label: "Activity", hasContent: initialData.showGitHubHeatmap },
      { id: "experience", label: "Experience", hasContent: experiences.length > 0 },
      { id: "skills", label: "Skills", hasContent: skills.length > 0 },
      { id: "education", label: "Education", hasContent: education.length > 0 },
      { id: "certificates", label: "Certificates", hasContent: certifications.length > 0 },
    ].filter((section) => initialData.isOwner || section.hasContent);
  }, [initialData]);

  const shows = (id: string) => sections.some((section) => section.id === id);
  // The career on the left and what backs it up on the right. With only one side filled, it takes the full width.
  const hasCareerColumn = shows("experience") || shows("education");
  const hasProofColumn = shows("skills") || shows("certificates");

  const handleOpenCertificate = (certificate: PortfolioCertificate, certificates: PortfolioCertificate[]) => {
    setSelectedCertificate(certificate);
    setAllCertificates(certificates);
    setIsCertificateModalOpen(true);
  };

  return (
    <UserProvider initialData={initialData}>
      {!hydrated && (
        <div className="fixed inset-0 z-50 bg-paper">
          <PortfolioLoader username={initialData.username} />
        </div>
      )}

      <div id="top" ref={pageRef} className="pf min-h-dvh" data-ready={hydrated}>
        <div aria-hidden="true" className="pf-table" />
        <div aria-hidden="true" className="pf-table-light" />

        <div className="mx-auto w-full max-w-[1240px] px-4 pb-8 pt-3 sm:px-6 sm:pt-4 lg:px-8">
          <PortfolioTopBar sections={sections} />
          <PortfolioHero />

          <main className={cardGapClass}>
            {shows("projects") && <Projects />}
            {shows("activity") && <GitHubHeatmap />}

            {(hasCareerColumn || hasProofColumn) && (
              <div
                className={cn(
                  cardGapClass,
                  "items-start",
                  hasCareerColumn && hasProofColumn && "lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)]",
                )}
              >
                {hasCareerColumn && (
                  <div className={cn(cardGapClass, "min-w-0")}>
                    {shows("experience") && <Experience />}
                    {shows("education") && <Education />}
                  </div>
                )}
                {hasProofColumn && (
                  <div className={cn(cardGapClass, "min-w-0")}>
                    {shows("skills") && <Skills />}
                    {shows("certificates") && <Certifications onOpenCertificate={handleOpenCertificate} />}
                  </div>
                )}
              </div>
            )}

            {sections.length === 0 && (
              <p className="pf-card px-6 py-12 text-center text-lg text-ink-soft sm:py-16">
                This portfolio is still being put together. Check back soon.
              </p>
            )}
          </main>

          <PortfolioFooter />
        </div>
      </div>

      <CertificateModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        certificate={selectedCertificate}
        certificates={allCertificates}
      />
    </UserProvider>
  );
}
