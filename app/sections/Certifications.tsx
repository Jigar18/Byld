"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Award } from "lucide-react";
import CertificateList from "../components/CertificateList";
import EditCertifications from "../components/EditCertifications";
import CertificateModal from "../components/CertificateModal";
import DeleteCertificateModal from "../components/DeleteCertificateModal";
import CredentialCardHeader from "../components/CredentialCardHeader";
import { useUser } from "../context/UserContext";

interface Card {
  id: string;
  title: string;
  pdfUrl: string;
  description: string;
}

interface CertificationsProps {
  onOpenCertificate?: (certificate: Card, certificates: Card[]) => void;
}

export default function Certifications({
  onOpenCertificate,
}: CertificationsProps) {
  const { isOwner, portfolioUsername, portfolioApiUrl, portfolioData } = useUser();
  const [cards, setCards] = useState<Card[]>(portfolioData.certifications);
  const [loading, setLoading] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Card | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState<Card | null>(
    null
  );
  const [certificatesAtTop, setCertificatesAtTop] = useState(true);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await fetch(portfolioApiUrl("/api/getCertificates"));
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCards(data.certificates || []);
        }
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = (newCard: Omit<Card, "id">) => {
    fetchCertificates();
  };

  const handleDeleteCard = (cardToDelete: Card) => {
    setCertificateToDelete(cardToDelete);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!certificateToDelete) return;

    try {
      const response = await fetch(
        `/api/deleteCertificate?id=${certificateToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setCards((prevCards) =>
          prevCards.filter((card) => card.id !== certificateToDelete.id)
        );
        setDeleteModalOpen(false);
        setCertificateToDelete(null);
      } else {
        console.error("Failed to delete certificate");
      }
    } catch (error) {
      console.error("Error deleting certificate:", error);
    }
  };

  const handleOpenCertificate = (certificate: Card) => {
    if (typeof onOpenCertificate === "function") {
      onOpenCertificate(certificate, cards);
    } else {
      setSelectedCertificate(certificate);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <motion.div
        {...{
          className:
            "profile-card profile-surface-neutral profile-card-lift h-[336px] rounded-xl border p-5 shadow-md",
        }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
      >
        <CredentialCardHeader title="Certifications" icon={<Award className="h-5 w-5" />} />
        <div className="animate-pulse space-y-3 pt-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-[108px] bg-slate-700/30 rounded-lg"></div>
          ))}
        </div>
      </motion.div>
    );
  }

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
        action={isOwner ? <EditCertifications onAddCard={handleAddCard} compact /> : undefined}
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
            onOpenCertificate={handleOpenCertificate}
            onDeleteCard={handleDeleteCard}
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

      {/* Delete confirmation modal */}
      {isOwner && <DeleteCertificateModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setCertificateToDelete(null);
        }}
        onConfirm={confirmDelete}
        certificate={certificateToDelete}
      />}

      {!onOpenCertificate && (
        <CertificateModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          certificate={selectedCertificate}
          certificates={cards}
        />
      )}
    </motion.div>
  );
}
