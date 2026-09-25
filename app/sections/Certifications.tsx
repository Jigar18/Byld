"use client";

import type { PortfolioCertificate } from "@/types/portfolio";
import { useState } from "react";
import { motion } from "framer-motion";
import { Award } from "lucide-react";
import CertificateList from "../components/CertificateList";
import EditCertifications from "../components/EditCertifications";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import CredentialCardHeader from "../components/CredentialCardHeader";
import { useUser } from "../context/UserContext";

interface CertificationsProps {
  onOpenCertificate: (certificate: PortfolioCertificate, certificates: PortfolioCertificate[]) => void;
}

export default function Certifications({ onOpenCertificate }: CertificationsProps) {
  const { isOwner, portfolioUsername, portfolioData } = useUser();
  const [cards, setCards] = useState<PortfolioCertificate[]>(portfolioData.certifications);
  const [certificateToDelete, setCertificateToDelete] = useState<PortfolioCertificate | null>(null);
  const [certificatesAtTop, setCertificatesAtTop] = useState(true);

  const confirmDelete = async () => {
    if (!certificateToDelete) return;

    try {
      const response = await fetch(`/api/deleteCertificate?id=${certificateToDelete.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        console.error("Failed to delete certificate");
        return;
      }
      setCards((prevCards) => prevCards.filter((card) => card.id !== certificateToDelete.id));
      setCertificateToDelete(null);
    } catch (error) {
      console.error("Error deleting certificate:", error);
    }
  };

  return (
    <motion.div
      {...{
        className:
          "profile-card profile-surface-neutral profile-card-lift group flex h-[336px] flex-col rounded-xl border p-5 shadow-md",
      }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <CredentialCardHeader
        title="Certifications"
        icon={<Award className="h-5 w-5" />}
        action={isOwner ? <EditCertifications onAddCard={(certificate) => setCards((current) =>
          [certificate, ...current].sort((a, b) => b.id.localeCompare(a.id)),
        )} /> : undefined}
      />

      <div className="relative min-h-0 flex-1 pt-3">
        <div
          className="credential-scrollbar h-full overflow-x-hidden overflow-y-auto pr-1"
          onScroll={(event) => setCertificatesAtTop(event.currentTarget.scrollTop <= 2)}
        >
          {cards.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center">
              <p className="text-sm text-slate-400">No certificates added yet.</p>
            </div>
          ) : (
          <CertificateList
            cards={cards}
            onOpenCertificate={(certificate) => onOpenCertificate(certificate, cards)}
            onDeleteCard={setCertificateToDelete}
            canEdit={isOwner}
            portfolioUsername={portfolioUsername}
          />
          )}
        </div>
        {certificatesAtTop && cards.length > 2 && (
          <span className="pointer-events-none absolute bottom-2 right-3 rounded-full border border-white/10 bg-zinc-950/90 px-2.5 py-1 text-xs font-semibold text-zinc-300 shadow-lg">
            +{cards.length - 2}
          </span>
        )}
      </div>

      {isOwner && (
        <ConfirmDeleteModal
          isOpen={Boolean(certificateToDelete)}
          title="Delete Certificate"
          subject={certificateToDelete?.title}
          note="This action will permanently delete the certificate and its associated file from storage. This cannot be undone."
          onClose={() => setCertificateToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </motion.div>
  );
}
