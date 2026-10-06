"use client";

import type { PortfolioCertificate } from "@/types/portfolio";
import { Download, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CertificateListProps {
  cards: PortfolioCertificate[];
  onOpenCertificate: (certificate: PortfolioCertificate) => void;
  onDeleteCard: (certificate: PortfolioCertificate) => void;
  canEdit?: boolean;
}

export default function CertificateList({
  cards,
  onOpenCertificate,
  onDeleteCard,
  canEdit = false,
}: CertificateListProps) {
  return (
    <ul className="grid gap-3">
      {cards.map((card) => (
        <li key={card.id} className="rounded-[20px] bg-well p-4 sm:p-5">
          <h3 className="font-display text-lg font-semibold leading-snug tracking-[-0.01em]">{card.title}</h3>
          {card.description && (
            <p className="mt-1 line-clamp-2 text-[15px] leading-relaxed text-ink-soft">{card.description}</p>
          )}

          <div className="mt-4 flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onOpenCertificate(card)}
              aria-label={`View ${card.title}`}
            >
              <Eye aria-hidden="true" />
              View
            </Button>
            <Button asChild variant="ghost" size="sm">
              <a href={`/api/download-certificate?id=${card.id}`} download aria-label={`Download ${card.title}`}>
                <Download aria-hidden="true" />
                Download
              </a>
            </Button>
            {canEdit && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onDeleteCard(card)}
                aria-label={`Delete ${card.title}`}
                className="ml-auto hover:text-danger"
              >
                <Trash2 aria-hidden="true" />
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
