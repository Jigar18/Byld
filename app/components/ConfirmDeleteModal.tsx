"use client";

import { useState, type ReactNode } from "react";
import { Button, ButtonSpinner } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  /** Shown as `Are you sure you want to remove “subject” from your portfolio?` */
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
  // Callers clear the subject as they close this sheet, so the last one stays on screen while it animates out.
  const [lastSubject, setLastSubject] = useState(subject);
  if (subject && subject !== lastSubject) setLastSubject(subject);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      busy={isBusy}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isBusy}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isBusy}>
            {isBusy && <ButtonSpinner />}
            {isBusy && busyLabel ? busyLabel : confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-base leading-relaxed">
        {message ?? (
          <>
            Are you sure you want to remove <strong className="font-semibold">“{lastSubject}”</strong> from your
            portfolio?
          </>
        )}
      </p>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{note}</p>
    </Dialog>
  );
}
