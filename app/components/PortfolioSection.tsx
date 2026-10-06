import type { ReactNode } from "react";

interface PortfolioSectionProps {
  /** Also the anchor the profile sheet's index links to. */
  id: string;
  title: string;
  /** The owner's control for this section, shown beside the heading. */
  action?: ReactNode;
  children: ReactNode;
}

export default function PortfolioSection({ id, title, action, children }: PortfolioSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="pf-section border-t border-line py-11 first:border-t-0 first:pt-0 sm:py-14"
    >
      <div className="mb-6 flex min-h-9 flex-wrap items-center justify-between gap-x-4 gap-y-3">
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
