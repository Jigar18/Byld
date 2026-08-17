"use client";

import type React from "react";

import { motion } from "framer-motion";
import { useState } from "react";
import About from "../sections/AboutSection";
import Credentials from "../sections/Credentials";
import Experience from "../sections/Experience";
import InfoCard from "../sections/InfoCard";
import Projects from "../sections/Projects";
import CertificateModal from "../components/CertificateModal";
import { UserProvider, useUser } from "../context/UserContext";
import PortfolioViewCount from "../components/PortfolioViewCount";
import GitHubHeatmap from "../components/GitHubHeatmap";
import NotFoundState from "../components/NotFoundState";
import PortfolioLoader from "../components/PortfolioLoader";
import { Copyright, LogOut } from "lucide-react";

interface Card {
  id: string;
  title: string;
  pdfUrl: string;
  description: string;
}

function PortfolioRouteGate({ children }: { children: React.ReactNode }) {
  const { loading, userDetails, portfolioUsername } = useUser();

  if (loading) {
    return <PortfolioLoader username={portfolioUsername} />;
  }
  if (!userDetails) return <NotFoundState kind="portfolio" />;
  return children;
}

function LogoutButton() {
  const { isOwner } = useUser();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutFailed, setLogoutFailed] = useState(false);

  if (!isOwner) return null;

  const logout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutFailed(false);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Logout failed");
      window.location.replace("/");
    } catch {
      setLogoutFailed(true);
      setLoggingOut(false);
    }
  };

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loggingOut}
      className="fixed right-4 top-4 z-40 inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 bg-zinc-900/90 px-3 text-sm font-medium text-zinc-200 shadow-xl shadow-black/25 backdrop-blur-sm transition hover:border-white/30 hover:bg-zinc-800 hover:text-white disabled:cursor-wait disabled:opacity-60 sm:right-8 sm:top-8 sm:h-auto sm:px-4 sm:py-2.5"
      aria-label="Log out"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">
        {loggingOut ? "Logging out…" : logoutFailed ? "Try again" : "Log out"}
      </span>
    </button>
  );
}

export default function Home() {
  // Certificate modal state
  const [selectedCertificate, setSelectedCertificate] = useState<Card | null>(
    null
  );
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [allCertificates, setAllCertificates] = useState<Card[]>([]);

  // Certificate handlers
  const handleOpenCertificate = (certificate: Card, certificates: Card[]) => {
    setSelectedCertificate(certificate);
    setAllCertificates(certificates);
    setIsCertificateModalOpen(true);
  };

  const handleCloseCertificateModal = () => {
    setIsCertificateModalOpen(false);
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  return (
    <UserProvider>
      <PortfolioRouteGate>
      <div className="portfolio-profile relative min-h-screen overflow-hidden bg-[#0a0a0a] text-zinc-200">
        <LogoutButton />
        <PortfolioViewCount />
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_76%_8%,rgba(251,191,36,0.018),transparent_28rem),radial-gradient(circle_at_5%_55%,rgba(244,114,182,0.012),transparent_24rem),radial-gradient(circle_at_80%_92%,rgba(255,255,255,0.012),transparent_26rem)]" />
        <div className="pointer-events-none fixed inset-0 opacity-[0.018] [background-image:linear-gradient(rgba(255,255,255,.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.4)_1px,transparent_1px)] [background-size:72px_72px]" />
        <main className="relative mx-auto w-full max-w-7xl px-4 pb-6 pt-16 sm:px-8 sm:pb-9 sm:pt-20 lg:px-10 lg:pb-12 lg:pt-20">
          <div className="space-y-12 sm:space-y-16 lg:space-y-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <InfoCard />
          </motion.div>

          <div className="space-y-12 sm:space-y-16 lg:space-y-24">
            <motion.div
              {...{ className: "w-full" }}
              custom={1}
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
            >
              <About />
            </motion.div>

            <motion.div
              {...{ className: "w-full" }}
              custom={2}
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
            >
              <Projects />
            </motion.div>

            <GitHubHeatmap />
          </div>

          <motion.div custom={3} initial="hidden" animate="visible" variants={sectionVariants}>
            <Credentials onOpenCertificate={handleOpenCertificate} />
          </motion.div>

          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
          >
            <Experience />
          </motion.div>

          <motion.footer
            {...{ className: "mt-10 border-t border-white/10 py-8" }}
            custom={6}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
          >
            <p className="flex items-center justify-center gap-1.5 text-xs text-zinc-500">
              <Copyright aria-hidden="true" className="h-3.5 w-3.5" />
              Copyright {new Date().getFullYear()}
            </p>
          </motion.footer>
          </div>
        </main>

        {/* Certificate Modal */}
        <CertificateModal
          isOpen={isCertificateModalOpen}
          onClose={handleCloseCertificateModal}
          certificate={selectedCertificate}
          certificates={allCertificates}
        />
      </div>
      </PortfolioRouteGate>
    </UserProvider>
  );
}
