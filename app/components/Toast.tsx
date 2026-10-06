"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { createPortal } from "react-dom";

export type ToastState = { message: string; success: boolean } | null;

// Rendered on the body so it sits above open dialogs and is never clipped by a scrolling panel.
export default function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  if (!toast) return null;

  return createPortal(
    <div
      role="alert"
      className="ui-sheet pointer-events-auto fixed inset-x-4 bottom-5 z-[300] mx-auto flex w-fit max-w-[420px] items-start gap-3 rounded-2xl py-3 pl-4 pr-2.5 text-[15px] shadow-[0_24px_50px_-20px_rgb(0_0_0/0.6)] duration-300 animate-in fade-in-0 slide-in-from-bottom-3 motion-reduce:animate-none"
    >
      {toast.success ? (
        <CheckCircle2 aria-hidden="true" className="mt-0.5 size-[18px] shrink-0 text-brand-text" />
      ) : (
        <AlertCircle aria-hidden="true" className="mt-0.5 size-[18px] shrink-0 text-danger" />
      )}
      <span className="py-px leading-snug">{toast.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="grid size-7 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-ink/10 hover:text-ink"
      >
        <X className="size-4" />
      </button>
    </div>,
    document.body,
  );
}
