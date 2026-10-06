import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

export function ButtonSpinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent",
        className,
      )}
    />
  )
}

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-ink text-on-ink hover:bg-brand hover:text-white",
        secondary: "border-[1.5px] border-line text-ink hover:border-ink",
        ghost: "text-ink-soft hover:bg-ink/[0.07] hover:text-ink",
        danger: "bg-danger text-on-ink hover:brightness-110",
      },
      size: {
        sm: "h-9 px-3.5 text-sm",
        md: "h-11 px-5 text-[15px]",
        lg: "h-[54px] px-[26px] text-base [&_svg]:size-[18px]",
        icon: "size-10",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type = "button", ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        // A Slot child (a link) has no button type.
        {...(asChild ? {} : { type })}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
