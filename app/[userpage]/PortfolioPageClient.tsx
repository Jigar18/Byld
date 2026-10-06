"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import About from "../sections/AboutSection";
import Certifications from "../sections/Certifications";
import Contact from "../sections/Contact";
import Experience from "../sections/Experience";
import ProfileSheet from "../sections/ProfileSheet";
import Projects from "../sections/Projects";
import CertificateModal from "../components/CertificateModal";
import Education from "../components/Education";
import GitHubHeatmap from "../components/GitHubHeatmap";
import PortfolioLoader from "../components/PortfolioLoader";
import Skills from "../components/Skills";
import { UserProvider, useUser } from "../context/UserContext";
import type { PortfolioCertificate, PortfolioInitialData } from "@/types/portfolio";

function PortfolioFooter() {
  const { userDetails } = useUser();
  const name = [userDetails.firstName, userDetails.lastName].filter(Boolean).join(" ");

  return (
    <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line pt-6 text-sm text-ink-soft">
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
  // The loader stays on top until hydration, so the sheet settles once and no control shows before it can respond.
  const [hydrated, setHydrated] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<PortfolioCertificate | null>(null);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [allCertificates, setAllCertificates] = useState<PortfolioCertificate[]>([]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Visitors only get the sections that have something in them. The owner gets all of them, so each can be filled in.
  const sections = useMemo(() => {
    const { details, projects, experiences, skills, education, certifications, socialLinks } = initialData;
    return [
      { id: "about", label: "About", hasContent: Boolean(details.about) },
      { id: "projects", label: "Projects", hasContent: projects.length > 0 },
      { id: "activity", label: "Activity", hasContent: initialData.showGitHubHeatmap },
      { id: "experience", label: "Experience", hasContent: experiences.length > 0 },
      { id: "skills", label: "Skills", hasContent: skills.length > 0 },
      { id: "education", label: "Education", hasContent: education.length > 0 },
      { id: "certificates", label: "Certificates", hasContent: certifications.length > 0 },
      { id: "contact", label: "Contact", hasContent: Object.values(socialLinks).some(Boolean) },
    ].filter((section) => initialData.isOwner || section.hasContent);
  }, [initialData]);

  const shows = (id: string) => sections.some((section) => section.id === id);

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

      <div
        className="pf mx-auto grid w-full max-w-[1320px] gap-9 p-3 sm:p-5 lg:grid-cols-[372px_minmax(0,1fr)] lg:gap-14 lg:p-7"
        data-ready={hydrated}
      >
        <ProfileSheet sections={sections} />

        <div className="pf-content min-w-0 px-2 pb-5 sm:px-3 lg:px-0 lg:pb-3 lg:pt-9">
          <main className="pb-11 sm:pb-14">
            {shows("about") && <About />}
            {shows("projects") && <Projects />}
            {shows("activity") && <GitHubHeatmap />}
            {shows("experience") && <Experience />}
            {shows("skills") && <Skills />}
            {shows("education") && <Education />}
            {shows("certificates") && <Certifications onOpenCertificate={handleOpenCertificate} />}
            {shows("contact") && <Contact />}
            {sections.length === 0 && (
              <p className="text-lg text-ink-soft">This portfolio is still being put together. Check back soon.</p>
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
