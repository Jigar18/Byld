import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PortfolioSectionProps {
  /** Also the anchor the top bar links to. */
  id: string;
  title: string;
  /** The owner's control for this section, shown beside the heading. */
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

// One card on the portfolio page. data-light lets its edge catch the pointer's light.
export default function PortfolioSection({ id, title, action, className, children }: PortfolioSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} data-light className={cn("pf-card p-6 sm:p-8 lg:p-9", className)}>
      <div className="mb-6 flex min-h-9 flex-wrap items-center justify-between gap-x-4 gap-y-3 sm:mb-7">
        <h2
          id={`${id}-heading`}
          className="font-display text-[26px] font-semibold leading-none tracking-[-0.02em] sm:text-[30px]"
        >
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
