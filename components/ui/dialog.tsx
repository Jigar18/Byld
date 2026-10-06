"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "./button"

const widthBySize = {
  sm: "sm:max-w-[440px]",
  md: "sm:max-w-[580px]",
  lg: "sm:max-w-[800px]",
  xl: "sm:max-w-[1160px]",
}

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: React.ReactNode
  size?: keyof typeof widthBySize
  footer?: React.ReactNode
  /** Blocks Escape, the backdrop and the close button while a save or upload is running. */
  busy?: boolean
  /** Wraps the body and footer in a form, so Enter submits and a footer button can be type="submit". */
  onSubmit?: () => void
  bodyClassName?: string
  children: React.ReactNode
}

/**
 * Every editor and viewer in the app opens in this sheet: a bottom sheet on phones, a centred one from 640px up.
 * Radix handles the focus trap, Escape, scroll lock and dialogs opened from inside another dialog.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  size = "md",
  footer,
  busy = false,
  onSubmit,
  bodyClassName,
  children,
}: DialogProps) {
  const body = (
    <>
      <div className={cn("min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7", bodyClassName)}>
        {children}
      </div>
      {footer && (
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2.5 border-t border-sheet-line px-5 py-4 sm:px-7">
          {footer}
        </div>
      )}
    </>
  )

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !busy) onClose()
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[200] flex items-end justify-center bg-[rgb(4_5_10/0.62)] backdrop-blur-[6px] duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:!animate-none sm:items-center sm:p-4">
          <DialogPrimitive.Content
            // Radix warns about a missing description unless the attribute is explicitly cleared.
            {...(description ? {} : { "aria-describedby": undefined })}
            onOpenAutoFocus={(event) => {
              // Focus the sheet itself: focusing the first field would open the keyboard on phones.
              event.preventDefault()
              ;(event.currentTarget as HTMLElement).focus()
            }}
            className={cn(
              "ui-sheet flex max-h-[calc(100dvh-1.5rem)] w-full flex-col rounded-t-[28px] shadow-[0_40px_90px_-30px_rgb(0_0_0/0.7)] outline-none duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-6 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-6 motion-reduce:!animate-none sm:max-h-[calc(100dvh-2rem)] sm:rounded-[28px]",
              widthBySize[size],
            )}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-sheet-line py-4 pl-5 pr-3 sm:pl-7 sm:pr-4">
              <div className="min-w-0 py-1">
                <DialogPrimitive.Title className="font-display text-[22px] font-semibold leading-tight tracking-[-0.02em]">
                  {title}
                </DialogPrimitive.Title>
                {description && (
                  <DialogPrimitive.Description className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">
                    {description}
                  </DialogPrimitive.Description>
                )}
              </div>
              <DialogPrimitive.Close
                disabled={busy}
                aria-label="Close"
                className={buttonVariants({ variant: "ghost", size: "icon" })}
              >
                <X />
              </DialogPrimitive.Close>
            </div>

            {onSubmit ? (
              <form
                noValidate
                className="flex min-h-0 flex-1 flex-col"
                onSubmit={(event) => {
                  event.preventDefault()
                  // React bubbles events through portals, so a nested dialog's submit would reach the parent form.
                  event.stopPropagation()
                  onSubmit()
                }}
              >
                {body}
              </form>
            ) : (
              body
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
