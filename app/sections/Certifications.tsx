"use client";

import type { PortfolioCertificate } from "@/types/portfolio";
import { useState } from "react";
import CertificateList from "../components/CertificateList";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import EditCertifications from "../components/EditCertifications";
import PortfolioSection from "../components/PortfolioSection";
import { useUser } from "../context/UserContext";

interface CertificationsProps {
  onOpenCertificate: (certificate: PortfolioCertificate, certificates: PortfolioCertificate[]) => void;
}

export default function Certifications({ onOpenCertificate }: CertificationsProps) {
  const { isOwner, portfolioData } = useUser();
  const [cards, setCards] = useState<PortfolioCertificate[]>(portfolioData.certifications);
  const [certificateToDelete, setCertificateToDelete] = useState<PortfolioCertificate | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteFailed, setDeleteFailed] = useState(false);

  const confirmDelete = async () => {
    if (!certificateToDelete) return;

    setDeleting(true);
    setDeleteFailed(false);
    try {
      const response = await fetch(`/api/deleteCertificate?id=${certificateToDelete.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete certificate");

      setCards((prevCards) => prevCards.filter((card) => card.id !== certificateToDelete.id));
    } catch (error) {
      console.error("Error deleting certificate:", error);
      setDeleteFailed(true);
    } finally {
      // Closed on failure too, so the message under the heading is not hidden behind the sheet.
      setCertificateToDelete(null);
      setDeleting(false);
    }
  };

  return (
    <PortfolioSection
      id="certificates"
      title="Certificates"
      action={
        isOwner && (
          <EditCertifications
            onAddCard={(certificate) =>
              setCards((current) => [certificate, ...current].sort((a, b) => b.id.localeCompare(a.id)))
            }
          />
        )
      }
    >
      {deleteFailed && (
        <p role="alert" className="mb-5 text-[15px] font-medium text-danger">
          The certificate wasn’t deleted. Check your connection and try again.
        </p>
      )}

      {cards.length === 0 ? (
        <p className="text-ink-soft">No certificates yet. Upload a PDF and visitors can read it right here.</p>
      ) : (
        <CertificateList
          cards={cards}
          onOpenCertificate={(certificate) => onOpenCertificate(certificate, cards)}
          onDeleteCard={setCertificateToDelete}
          canEdit={isOwner}
        />
      )}

      {isOwner && (
        <ConfirmDeleteModal
          isOpen={Boolean(certificateToDelete)}
          title="Delete certificate"
          subject={certificateToDelete?.title}
          note="The certificate and its file are deleted for good. This cannot be undone."
          busyLabel="Deleting…"
          isBusy={deleting}
          onClose={() => setCertificateToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </PortfolioSection>
  );
}
