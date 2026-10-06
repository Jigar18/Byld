"use client";

import { Check } from "lucide-react";
import { usePathname } from "next/navigation";

const STAGES = [
  { label: "GitHub", paths: ["/app-install", "/app-installed"] },
  { label: "Details", paths: ["/details"] },
  { label: "Skills", paths: ["/skills"] },
  { label: "Photo", paths: ["/profile-picture"] },
];

const markClassByState = {
  done: "bg-ink text-on-ink",
  current: "bg-brand text-white",
  upcoming: "border-[1.5px] border-line text-ink-faint",
};

export default function OnboardingStages() {
  const pathname = usePathname();
  const currentIndex = STAGES.findIndex((stage) => stage.paths.includes(pathname));

  return (
    <ol aria-label="Setup progress" className="flex items-center gap-2 sm:gap-3">
      {STAGES.map((stage, index) => {
        const state = index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming";
        return (
          <li
            key={stage.label}
            aria-current={state === "current" ? "step" : undefined}
            className="flex items-center gap-2 sm:gap-3"
          >
            {index > 0 && (
              <span aria-hidden="true" className={`h-px w-4 sm:w-7 ${index <= currentIndex ? "bg-ink" : "bg-line"}`} />
            )}
            <span className={`flex items-center gap-2 text-sm font-semibold ${state === "upcoming" ? "text-ink-faint" : "text-ink"}`}>
              <span className={`grid size-6 place-items-center rounded-full text-xs tabular-nums ${markClassByState[state]}`}>
                {state === "done" ? <Check className="size-3.5" strokeWidth={3} aria-hidden="true" /> : index + 1}
              </span>
              {/* Phones only have room for the name of the stage you are on. */}
              <span className={state === "current" ? "" : "hidden md:inline"}>{stage.label}</span>
              {state === "done" && <span className="sr-only">(done)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
