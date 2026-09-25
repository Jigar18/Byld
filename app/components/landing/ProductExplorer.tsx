"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { BriefcaseBusiness, ChevronRight, FolderGit2, SlidersHorizontal, SquareActivity } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ProjectModalMockup from "./ProjectModalMockup";
import { ActivityCard, CareerEvidence, OwnershipControls } from "./ProductMockups";

const features = [
  {
    id: "projects",
    icon: FolderGit2,
    title: "Projects, with the why.",
    copy: "The story, stack, screenshots, and demo behind each repo.",
    width: 520,
    visual: <ProjectModalMockup />,
  },
  {
    id: "activity",
    icon: SquareActivity,
    title: "A year of commits, kept live.",
    copy: "Your contribution graph, synced from GitHub.",
    width: 610,
    visual: <ActivityCard />,
  },
  {
    id: "career",
    icon: BriefcaseBusiness,
    title: "The rest of your career.",
    copy: "Experience, education, skills, and certificates.",
    width: 540,
    visual: <CareerEvidence />,
  },
  {
    id: "controls",
    icon: SlidersHorizontal,
    title: "Edit on the page itself.",
    copy: "Owner controls that visitors never see.",
    width: 500,
    visual: <OwnershipControls />,
  },
];

const AUTOPLAY_MS = 6500;
const ease = [0.19, 1, 0.22, 1] as const;

// The mockups are drawn at miniature sizes; this scales one up to fill the stage, as large as both the
// stage's width and height allow, so its small type stays legible.
function FitToStage({ width, children }: { width: number; children: React.ReactNode }) {
  const outer = useRef<HTMLDivElement>(null!);
  const inner = useRef<HTMLDivElement>(null!);
  const [box, setBox] = useState<{ scale: number; height: number } | null>(null);

  useEffect(() => {
    // Hold the nodes themselves: when a tab switch unmounts this stage, React nulls the refs before
    // this cleanup runs, and the observer can still fire once in between.
    const outerNode = outer.current;
    const innerNode = inner.current;
    const measure = () => {
      const height = innerNode.offsetHeight;
      // The stage is display:none below lg, and a detached node measures 0; nothing to fit then.
      if (!height || !outerNode.clientHeight) return;
      const scale = Math.min(1.6, outerNode.clientWidth / width, outerNode.clientHeight / height);
      setBox({ scale, height });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(outerNode);
    observer.observe(innerNode);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div ref={outer} className="grid h-full w-full place-items-center">
      <div className="relative" style={box ? { width: width * box.scale, height: box.height * box.scale } : { width }}>
        <div ref={inner} className={box ? "absolute left-0 top-0 origin-top-left" : ""} style={{ width, transform: box ? `scale(${box.scale})` : undefined }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ProductExplorer() {
  const [active, setActive] = useState(features[0].id);
  // Cycles through the features until the visitor picks one themselves.
  const [autoplay, setAutoplay] = useState(true);
  const [hovering, setHovering] = useState(false);
  const ref = useRef<HTMLDivElement>(null!);
  const inView = useInView(ref, { amount: 0.4 });
  const reduceMotion = useReducedMotion();
  const current = features.find((feature) => feature.id === active) ?? features[0];

  const select = (id: string) => {
    setAutoplay(false);
    setActive(id);
  };

  const advance = () => {
    const index = features.findIndex((feature) => feature.id === active);
    setActive(features[(index + 1) % features.length].id);
  };

  return (
    <div ref={ref} className="grid gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-12">
      <ul className="flex flex-col gap-2" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
        {features.map((feature) => {
          const isActive = feature.id === active;
          const Icon = feature.icon;
          return (
            <li
              key={feature.id}
              className={`group relative overflow-hidden rounded-2xl border transition-colors duration-300 ${isActive ? "border-[#26282C] bg-[#0E0F11]" : "border-transparent hover:border-[#1D1F22] hover:bg-[#0C0D0F] has-[:focus-visible]:bg-[#0C0D0F]"}`}
            >
              <button
                type="button"
                onClick={() => select(feature.id)}
                aria-expanded={isActive}
                aria-controls={`feature-${feature.id}`}
                className="flex w-full cursor-pointer items-center gap-4 px-4 py-4 text-left outline-none sm:gap-5 sm:px-5 sm:py-5"
              >
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition-colors duration-300 ${isActive ? "border-[#F3F4F5] bg-[#F3F4F5] text-[#08080A]" : "border-[#1D1F22] text-[#6B6F75] group-hover:border-[#2A2C31] group-hover:text-[#C9CBCF]"}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className={`byld-semi text-[clamp(1.1rem,1.55vw,1.4rem)] font-semibold leading-tight tracking-[-0.03em] transition-colors ${isActive ? "text-[#F3F4F5]" : "text-[#8E9197] group-hover:text-[#F3F4F5]"}`}>{feature.title}</span>
                <ChevronRight className={`ml-auto h-5 w-5 shrink-0 transition duration-300 ${isActive ? "rotate-90 text-[#F3F4F5] lg:translate-x-1 lg:rotate-0" : "text-[#5C6066] group-hover:translate-x-1 group-hover:text-[#C9CBCF]"}`} />
              </button>
              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.div
                    {...{ id: `feature-${feature.id}`, className: "overflow-hidden" }}
                    initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease }}
                  >
                    <p className="max-w-md pb-6 pl-[4.75rem] pr-5 text-[15px] leading-7 text-[#8E9197] sm:pl-[5.5rem]">{feature.copy}</p>
                    <div className="px-4 pb-5 lg:hidden">{feature.visual}</div>
                  </motion.div>
                )}
              </AnimatePresence>
              {isActive && autoplay && (
                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 hidden h-[2px] bg-[#1D1F22] lg:block motion-reduce:hidden">
                  <span
                    className="byld-progress block h-full origin-left bg-[#F3F4F5]"
                    style={{ animationDuration: `${AUTOPLAY_MS}ms`, animationPlayState: inView && !hovering ? "running" : "paused" }}
                    onAnimationEnd={advance}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <div className="relative hidden h-[680px] items-center justify-center overflow-hidden rounded-[28px] border border-[#1D1F22] bg-[#0E0F11] p-6 lg:flex">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(#1D1F22_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.id}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.45, ease }}
            {...{ className: "relative h-full w-full" }}
          >
            <FitToStage width={current.width}>{current.visual}</FitToStage>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
