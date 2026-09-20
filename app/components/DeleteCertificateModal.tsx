"use client";

import type { PortfolioCertificate } from "@/types/portfolio";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";

interface DeleteCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  certificate: PortfolioCertificate | null;
}

export default function DeleteCertificateModal({
  isOpen,
  onClose,
  onConfirm,
  certificate,
}: DeleteCertificateModalProps) {
  if (!certificate) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          {...{className:"fixed inset-0 bg-black/50 z-[70] flex items-center justify-center backdrop-blur-sm",
          onClick:onClose}}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            {...{className:"bg-slate-800 rounded-xl border border-slate-700 p-6 m-4 max-w-md w-full shadow-xl",
            onClick:(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-900/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-zinc-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-100">
                  Delete PortfolioCertificate
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-200 transition-colors rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-slate-300 mb-2">
                Are you sure you want to remove{" "}
                <span className="font-semibold text-slate-100">{`"${certificate.title}"`}</span>{" "}
                from your portfolio?
              </p>
              <p className="text-slate-400 text-sm">
                This action will permanently delete the certificate and its associated file from storage. This cannot be undone.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-300 hover:text-slate-100 transition-colors"
              >
                Cancel
              </button>
                <button
                  onClick={onConfirm}
                  className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70"
              >
                Delete PortfolioCertificate
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
