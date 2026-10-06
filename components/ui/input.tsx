import React from "react"

import { cn } from "@/lib/utils"

// Focus is an ink border and a soft ink halo; the ultramarine is kept for actions.
export const fieldClass =
  "w-full rounded-[14px] border-[1.5px] border-line bg-raised px-4 text-base text-ink transition-[border-color,box-shadow] duration-200 placeholder:text-ink-faint hover:border-ink-faint focus-visible:border-ink focus-visible:shadow-[0_0_0_4px_rgb(var(--c-ink)/0.1)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(fieldClass, "h-12", className)}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
