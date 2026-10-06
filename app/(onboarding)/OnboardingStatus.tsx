import type { ReactNode } from "react";

import SheetStack from "../components/SheetStack";

interface OnboardingStatusProps {
  title: string;
  detail?: string;
  /** Keeps the stack moving while the app is waiting on GitHub. */
  working?: boolean;
  children?: ReactNode;
}

export default function OnboardingStatus({ title, detail, working = false, children }: OnboardingStatusProps) {
  return (
    <main className="grid flex-1 place-items-center px-5 pb-24 text-center">
      <div className="flex max-w-[460px] flex-col items-center">
        <SheetStack motion={working ? "loop" : undefined} className="[--stack-scale:0.62]" />
        <div role="status">
          <h1 className="mt-3 font-display text-[28px] font-semibold leading-tight tracking-[-0.02em]">{title}</h1>
          {detail && <p className="mt-2 text-[17px] leading-relaxed text-ink-soft">{detail}</p>}
        </div>
        {children}
      </div>
    </main>
  );
}
