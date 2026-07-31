"use client";

import { motion } from "framer-motion";
import { Download, Eye, X } from "lucide-react";

interface Card {
  id: string;
  title: string;
  pdfUrl: string;
  description: string;
}

interface CertificateListProps {
  cards: Card[];
  onOpenCertificate: (certificate: Card) => void;
  onDeleteCard: (certificate: Card) => void;
  canEdit?: boolean;
  portfolioUsername: string;
}

export default function CertificateList({
  cards,
  onOpenCertificate,
  onDeleteCard,
  canEdit = false,
  portfolioUsername,
}: CertificateListProps) {
  return (
    <div className="space-y-1">
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          {...{
            className:
              "relative group min-h-[108px] cursor-pointer rounded-lg px-2 py-4 transition-colors hover:bg-white/[0.035] sm:px-4",
            onClick: () => onOpenCertificate(card),
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: cards.indexOf(card) * 0.2 }}
        >
          {index > 0 && (
            <span className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          )}
          {canEdit && <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteCard(card);
            }}
            className="absolute right-1 top-3 rounded-md p-1.5 text-zinc-500 opacity-100 transition-all duration-200 hover:bg-white/5 hover:text-zinc-200 sm:opacity-0 sm:group-hover:opacity-100"
            title="Delete certificate"
          >
            <X className="h-4 w-4" />
          </button>}

          <div>
            <div>
              <h3 className="portfolio-display pr-8 font-medium text-slate-100">{card.title}</h3>
              <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                {card.description}
              </p>
              <div className="mt-2 flex gap-4">
                <a
                  href={`/api/download-certificate?id=${card.id}&username=${encodeURIComponent(portfolioUsername)}`}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-400 transition-colors hover:text-violet-300"
                  onClick={(e) => e.stopPropagation()}
                  download
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </a>
                <button
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-400 transition-colors hover:text-violet-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCertificate(card);
                  }}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>View Certificate</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
