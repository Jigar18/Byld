"use client";

import type { ReactNode } from "react";
import { useId } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  /** Shown as `Are you sure you want to remove "subject" from your portfolio?` */
  subject?: string;
  /** Replaces the default subject sentence. */
  message?: ReactNode;
  note: string;
  confirmLabel?: string;
  busyLabel?: string;
  isBusy?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({
  isOpen,
  title,
  subject,
  message,
  note,
  confirmLabel = title,
  busyLabel,
  isBusy = false,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  const id = useId();
  if (!isOpen) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      {...{
        className: "fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm",
        onClick: isBusy ? undefined : onClose,
        role: "presentation",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        {...{
          className: "w-full max-w-md rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-2xl",
          onClick: (event: React.MouseEvent<HTMLDivElement>) => event.stopPropagation(),
          role: "alertdialog",
          "aria-modal": true,
          "aria-labelledby": `${id}-title`,
          "aria-describedby": `${id}-description`,
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-red-500/10 p-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </span>
            <h3 id={`${id}-title`} className="text-lg font-semibold text-slate-100">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="rounded p-1 text-slate-400 transition-colors hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close delete confirmation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div id={`${id}-description`} className="mb-6">
          <p className="mb-2 text-slate-300">
            {message ?? (
              <>
                Are you sure you want to remove{" "}
                <span className="font-semibold text-slate-100">{`"${subject}"`}</span>{" "}
                from your portfolio?
              </>
            )}
          </p>
          <p className="text-sm text-slate-400">{note}</p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="rounded-lg border border-slate-600 px-4 py-2 text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isBusy}
            className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isBusy && busyLabel ? busyLabel : confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
