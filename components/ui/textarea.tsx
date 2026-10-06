import * as React from "react"

import { cn } from "@/lib/utils"
import { fieldClass } from "./input"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(fieldClass, "min-h-[120px] resize-y py-3 leading-relaxed", className)}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
