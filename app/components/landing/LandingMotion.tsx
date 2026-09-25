"use client";

import { MotionConfig, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// The portfolio composes itself as it scrolls in: each marked block starts blurred and low, then pulls
// into focus as it rises through the viewport. It is tied to scroll position, so it replays on every
// pass in either direction. A soft light also follows the pointer across the page. Blocks stay sharp
// when scripting is off or motion is reduced.
export function PreviewReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const blocks = Array.from(ref.current.querySelectorAll<HTMLElement>("[data-assemble]"));
    let frame = 0;

    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      for (const block of blocks) {
        // Blocks side by side share a top edge; their data-assemble step staggers them left to right.
        const lag = Number(block.dataset.assemble) * 0.06;
        const top = block.getBoundingClientRect().top / viewport;
        const progress = Math.min(1, Math.max(0, (0.98 - lag - top) / 0.38));
        block.style.setProperty("--a", progress.toFixed(3));
      }
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const track = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--x", `${((event.clientX - rect.left) / rect.width) * 100}%`);
    event.currentTarget.style.setProperty("--y", `${((event.clientY - rect.top) / rect.height) * 100}%`);
  };

  return (
    <div ref={ref} className="byld-reveal" onPointerMove={track}>
      {children}
      <span aria-hidden="true" className="byld-reveal-spot" />
    </div>
  );
}

const steps = [
  { title: "Sign in with GitHub", copy: "Use the account where your work lives." },
  { title: "Install the GitHub App", copy: "Choose which repositories Byldit can read." },
  { title: "Fill in the basics", copy: "Role, skills, education, and a photo." },
  { title: "Share your link", copy: "Your portfolio goes live at your username." },
];

const ease = [0.19, 1, 0.22, 1] as const;

// Setup steps drawn as commits on a branch that merges into main.
export function BranchSteps() {
  // Each step reveals as a unit; its connector inherits the step's state through variants, so a
  // 1px line never has to pass an intersection threshold of its own.
  const reveal = (delay: number) => ({
    initial: "hidden",
    whileInView: "shown",
    viewport: { once: true, amount: 0.6 },
    variants: { hidden: { opacity: 0, y: 14 }, shown: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease } } },
  });

  return (
    <MotionConfig reducedMotion="user">
      <ol className="relative grid gap-10 pl-10 lg:grid-cols-4 lg:gap-8 lg:pl-0 lg:pt-14">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          return (
            <motion.li key={step.title} {...{ className: "relative" }} {...reveal(0.15 + index * 0.18)}>
              {!isLast && (
                <motion.span
                  {...{
                    "aria-hidden": true,
                    className: `absolute left-[calc(-2.5rem+11px)] top-[26px] bottom-[calc(-2.5rem+2px)] w-[1.5px] origin-top-left bg-gradient-to-b lg:bottom-auto lg:left-[23px] lg:top-[calc(-3.5rem+11px)] lg:h-[1.5px] lg:w-[calc(100%+2rem-23px)] lg:bg-gradient-to-r ${index === steps.length - 2 ? "from-[#6B6F75] to-[#F3F4F5]" : "from-[#4B4F55] to-[#6B6F75]"}`,
                  }}
                  variants={{ hidden: { scale: 0 }, shown: { scale: 1, transition: { duration: 0.6, delay: 0.3 + index * 0.18, ease } } }}
                />
              )}
              <span
                aria-hidden="true"
                className={`absolute -left-10 top-0.5 grid h-[23px] w-[23px] place-items-center rounded-full lg:-top-14 lg:left-0 ${isLast ? "bg-[#F3F4F5] shadow-[0_0_0_6px_rgba(243,244,245,0.08),0_0_24px_rgba(243,244,245,0.35)]" : "border border-[#5C6066] bg-[#08080A]"}`}
              >
                <span className={`h-[7px] w-[7px] rounded-full ${isLast ? "bg-[#08080A]" : "bg-[#969A9F]"}`} />
              </span>
              <p className="text-[13px] text-[#6B6F75]">Step {index + 1}</p>
              <h3 className="byld-semi mt-2 text-xl font-semibold tracking-[-0.025em] text-[#F3F4F5]">{step.title}</h3>
              <p className="mt-3 max-w-xs text-[15px] leading-7 text-[#8E9197]">{step.copy}</p>
            </motion.li>
          );
        })}
      </ol>
    </MotionConfig>
  );
}

const handles = ["your-username", "alex", "priya-codes", "sam-builds", "mkim"];

// Types example usernames after the portfolio address.
export function TypedHandle() {
  const reduceMotion = useReducedMotion();
  const [text, setText] = useState(handles[0]);

  useEffect(() => {
    if (reduceMotion) return;
    let index = 0;
    let length = handles[0].length;
    let deleting = true;
    let timer: number;

    const tick = () => {
      let delay: number;
      if (deleting) {
        length -= 1;
        delay = 45;
        if (length === 0) {
          deleting = false;
          index = (index + 1) % handles.length;
          delay = 350;
        }
      } else {
        length += 1;
        delay = 95;
        if (length === handles[index].length) {
          deleting = true;
          delay = 2200;
        }
      }
      setText(handles[index].slice(0, length));
      timer = window.setTimeout(tick, delay);
    };

    timer = window.setTimeout(tick, 2400);
    return () => window.clearTimeout(timer);
  }, [reduceMotion]);

  return (
    <span className="text-[#F3F4F5]">
      <span className="sr-only">your-username</span>
      <span aria-hidden="true">{text}<span className="byld-caret ml-[0.04em] inline-block h-[0.95em] w-[0.08em] translate-y-[0.12em] bg-[#F3F4F5]" /></span>
    </span>
  );
}
