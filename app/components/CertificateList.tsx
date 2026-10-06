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
    <ul className="divide-y divide-line border-y border-line">
      {cards.map((card) => (
        <li key={card.id} className="flex flex-wrap items-center gap-x-5 gap-y-3 py-4 sm:flex-nowrap">
          <div className="min-w-0 flex-1 basis-full sm:basis-0">
            <h3 className="font-display text-lg font-semibold leading-snug tracking-[-0.01em]">{card.title}</h3>
            <p className="mt-1 line-clamp-2 text-[15px] leading-relaxed text-ink-soft">{card.description}</p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
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
                className="hover:text-danger"
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
