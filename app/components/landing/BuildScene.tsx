"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import GitHubButton from "./GitHubButton";
import { fetchGitHubPreview, GITHUB_USERNAME, GitHubPreviewError, samplePortfolio } from "./githubPreview";
import { ActivitySheet, ExperienceSheet, ProfileSheet, ProjectsSheet, SkillsSheet } from "./PortfolioSheets";
import ThemeToggle from "../ThemeToggle";
import { pxToRem } from "@/lib/utils";

const layers = [
  {
    label: "Profile",
    title: "Your profile, already filled in.",
    body: "Name, photo, bio and location come from GitHub. Change anything, then add your role and links.",
    Sheet: ProfileSheet,
  },
  {
    label: "Projects",
    title: "The projects you choose.",
    body: "Import a repository and its README, languages and links come with it. Add screenshots or a demo video.",
    Sheet: ProjectsSheet,
  },
  {
    label: "Activity",
    title: "Your contribution calendar.",
    body: "A year of commits, live from GitHub. One switch hides it.",
    Sheet: ActivitySheet,
  },
  {
    label: "Experience",
    title: "Work and education.",
    body: "The part code can’t show: where you’ve worked and where you studied.",
    Sheet: ExperienceSheet,
  },
  {
    label: "Skills",
    title: "Skills and certificates.",
    body: "Skills are suggested from your repositories. Certificates go up as PDFs.",
    Sheet: SkillsSheet,
  },
];

const chapterLabels = ["Scroll to take it apart", ...layers.map((layer) => layer.label), "Finished page"];
const FINAL_CHAPTER = chapterLabels.length - 1;

// Sheet geometry, mirrored in landing.css. All of the scene's lengths are in that stylesheet's px.
const SHEET_WIDTH = 620;
const SHEET_HEIGHT = 280;
const PAGE_GAP = 14;
const MIDDLE_LAYER = (layers.length - 1) / 2;

const TILT_X = 57;
const TILT_Z = -37;
const REST_GAP = 30;
const OPEN_GAP = 104;
// How far a sheet slides out of the stack, towards the viewer, while its chapter is on screen.
const PULL_Y = 290;
const PULL_Z = 26;

// The scene's timeline, as fractions of the scroll through it.
const OPEN_FROM = 0.05;
const FIRST_LAYER_AT = 0.13;
const LAYER_SPAN = 0.124;
const ASSEMBLE_FROM = FIRST_LAYER_AT + layers.length * LAYER_SPAN;
const ASSEMBLE_TO = 0.87;
const CROSSFADE = 0.025;

const chapterRestPoints = [0, ...layers.map((_, index) => FIRST_LAYER_AT + (index + 0.5) * LAYER_SPAN), 0.88];

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const ramp = (value: number, from: number, to: number) => clamp01((value - from) / (to - from));
const ease = (t: number) => t * t * (3 - 2 * t);
const mix = (from: number, to: number, t: number) => from + (to - from) * t;

type PreviewStatus = { kind: "idle" | "loading" | "ready" | "error"; message: string };

const idleStatus: PreviewStatus = { kind: "idle", message: "Try any GitHub username. It reads public data only." };

export default function BuildScene() {
  const [portfolio, setPortfolio] = useState(samplePortfolio);
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState(idleStatus);
  const [activeChapter, setActiveChapter] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const sheetRefs = useRef<HTMLDivElement[]>([]);
  const chapterRefs = useRef<HTMLDivElement[]>([]);
  const chapterVisibility = useRef<number[]>([1]);
  const previewRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const stage = stageRef.current;
    const rig = rigRef.current;
    const shadow = shadowRef.current;
    if (!section || !pin || !stage || !rig || !shadow) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 1024px)");
    let stageWidth = 0;
    let stageHeight = 0;
    let target = 0;
    let progress = 0;
    let pointerX = 0;
    let pointerY = 0;
    let tiltX = 0;
    let tiltY = 0;
    let shownChapter = 0;
    let frame = 0;

    const render = () => {
      const open = ease(ramp(progress, OPEN_FROM, FIRST_LAYER_AT));
      const flat = ease(ramp(progress, ASSEMBLE_FROM, ASSEMBLE_TO));
      const pan = ease(ramp(progress, ASSEMBLE_TO, 1));
      const inspecting =
        ease(ramp(progress, FIRST_LAYER_AT - CROSSFADE, FIRST_LAYER_AT + CROSSFADE)) *
        (1 - ease(ramp(progress, ASSEMBLE_FROM - CROSSFADE, ASSEMBLE_FROM + CROSSFADE)));
      const gap = mix(REST_GAP, OPEN_GAP, open) * (1 - flat);

      sheetRefs.current.forEach((sheet, index) => {
        const start = FIRST_LAYER_AT + index * LAYER_SPAN;
        const end = start + LAYER_SPAN;
        const pull =
          ease(ramp(progress, start - CROSSFADE, start + CROSSFADE)) *
          (1 - ease(ramp(progress, end - CROSSFADE, end + CROSSFADE)));
        const pageOffset = (index - MIDDLE_LAYER) * (SHEET_HEIGHT + PAGE_GAP) * flat;
        const height = (MIDDLE_LAYER - index) * gap + PULL_Z * pull;
        sheet.style.transform = `translate3d(0, ${pxToRem(pageOffset + PULL_Y * pull)}, ${pxToRem(height)})`;
        sheet.style.setProperty("--veil", (0.72 * inspecting * (1 - pull)).toFixed(3));
      });

      const stackScale = Math.min(stageWidth / 1000, stageHeight / 800, 1) * mix(1.26, 1, open);
      const pageScale = Math.min((stageWidth * 0.9) / SHEET_WIDTH, 1);
      const pageHeight = (layers.length * SHEET_HEIGHT + (layers.length - 1) * PAGE_GAP) * pageScale;
      // Room kept clear of the nav above the finished page and of the chapter rail below it.
      const pageTop = desktop.matches ? 104 : 8;
      const pageBottom = desktop.matches ? 32 : 72;
      const pageOverflow = Math.max(0, pageHeight + pageTop + pageBottom - stageHeight);
      const pageY = pageTop + pageHeight / 2 - stageHeight / 2 - pan * pageOverflow;
      // The pulled sheet travels down and to the right, so the stack sits up and to the left of centre.
      const stackX = -stageWidth * 0.09 * open;
      const stackY = -stageHeight * (desktop.matches ? 0.06 : 0.13) * open;
      const scale = mix(stackScale, pageScale, flat);
      const tilt = 1 - flat;

      rig.style.transform =
        `translate3d(${pxToRem(mix(stackX, 0, flat))}, ${pxToRem(mix(stackY, pageY, flat))}, 0) scale3d(${scale}, ${scale}, ${scale}) ` +
        `rotateX(${(TILT_X - tiltY * 4) * tilt}deg) rotateZ(${(TILT_Z + tiltX * 5) * tilt}deg)`;
      shadow.style.transform = `translate3d(0, 0, ${pxToRem(-MIDDLE_LAYER * gap - 80)}) scale(${1 + open * 0.08})`;
      shadow.style.opacity = String(1 - flat);
      stage.dataset.flat = String(flat > 0.02);

      let mostVisible = shownChapter;
      chapterRefs.current.forEach((chapter, index) => {
        let enter = 1;
        let exit = 0;
        if (index === 0) {
          exit = ramp(progress, OPEN_FROM - 0.01, OPEN_FROM + 0.04);
        } else if (index < FINAL_CHAPTER) {
          const start = FIRST_LAYER_AT + (index - 1) * LAYER_SPAN;
          enter = ramp(progress, start, start + CROSSFADE * 1.2);
          exit = ramp(progress, start + LAYER_SPAN - CROSSFADE * 1.2, start + LAYER_SPAN);
        } else {
          enter = ramp(progress, ASSEMBLE_FROM + 0.04, ASSEMBLE_FROM + 0.1);
        }

        const visibility = ease(enter) * (1 - ease(exit));
        chapterVisibility.current[index] = visibility;
        chapter.style.opacity = String(visibility);
        chapter.style.transform = `translate3d(0, ${pxToRem((1 - ease(enter)) * 24 - ease(exit) * 24)}, 0)`;
        chapter.style.pointerEvents = visibility > 0.5 ? "auto" : "none";
        if (visibility > 0.5) mostVisible = index;
      });

      if (mostVisible !== shownChapter) {
        shownChapter = mostVisible;
        setActiveChapter(mostVisible);
      }
    };

    const tick = () => {
      frame = 0;
      const still = reducedMotion.matches;
      progress = still ? target : progress + (target - progress) * 0.14;
      tiltX = still ? 0 : tiltX + (pointerX - tiltX) * 0.07;
      tiltY = still ? 0 : tiltY + (pointerY - tiltY) * 0.07;
      render();

      const settled =
        Math.abs(target - progress) < 0.0002 && Math.abs(pointerX - tiltX) < 0.002 && Math.abs(pointerY - tiltY) < 0.002;
      if (!still && !settled) requestTick();
    };

    const requestTick = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const readScroll = () => {
      const scrolled = clamp01(-section.getBoundingClientRect().top / (section.offsetHeight - pin.offsetHeight));
      // With reduced motion the scene steps between its resting states instead of travelling.
      target = reducedMotion.matches
        ? [...chapterRestPoints, 1].reduce((nearest, point) =>
            Math.abs(point - scrolled) < Math.abs(nearest - scrolled) ? point : nearest,
          )
        : scrolled;
      requestTick();
    };

    const measure = () => {
      // The stage is measured in screen pixels; dividing by the root scale puts it in the scene's own.
      const rootScale = parseFloat(getComputedStyle(document.documentElement).fontSize) / 16;
      stageWidth = stage.clientWidth / rootScale;
      stageHeight = stage.clientHeight / rootScale;
      readScroll();
    };

    const trackPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      pointerY = (event.clientY / window.innerHeight) * 2 - 1;
      requestTick();
    };

    measure();
    progress = target;
    render();

    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("pointermove", trackPointer, { passive: true });
    return () => {
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("resize", measure);
      window.removeEventListener("pointermove", trackPointer);
      cancelAnimationFrame(frame);
    };
  }, []);

  const jumpToChapter = (chapter: number) => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    if (!section || !pin) return;
    const sectionTop = window.scrollY + section.getBoundingClientRect().top;
    window.scrollTo({ top: sectionTop + (section.offsetHeight - pin.offsetHeight) * chapterRestPoints[chapter] });
  };

  // Tabbing into a chapter that has scrolled out of view brings the scene to it.
  const revealOnFocus = (chapter: number) => () => {
    if ((chapterVisibility.current[chapter] ?? 0) < 0.5) jumpToChapter(chapter);
  };

  const previewUsername = async (event: FormEvent) => {
    event.preventDefault();
    const handle = username.trim().replace(/^@/, "");
    if (!handle) return;
    if (!GITHUB_USERNAME.test(handle)) {
      setStatus({ kind: "error", message: "GitHub usernames use letters, numbers and single hyphens." });
      return;
    }

    previewRequest.current?.abort();
    const request = new AbortController();
    previewRequest.current = request;
    setStatus({ kind: "loading", message: `Reading ${handle} from GitHub` });

    try {
      const preview = await fetchGitHubPreview(handle, request.signal);
      setPortfolio(preview);
      setStatus({ kind: "ready", message: `This is ${preview.username} now. Scroll to take it apart.` });
    } catch (error) {
      if (request.signal.aborted) return;
      setStatus({
        kind: "error",
        message: error instanceof GitHubPreviewError ? error.message : "Couldn’t reach GitHub. Check your connection and try again.",
      });
    }
  };

  const setChapterRef = (index: number) => (element: HTMLDivElement | null) => {
    if (element) chapterRefs.current[index] = element;
  };

  return (
    <section ref={sectionRef} className="lp-scene" aria-label="What goes into a Byldit portfolio">
      <div ref={pinRef} className="lp-pin">
        <header className="lp-nav">
          <Link href="/" className="lp-brand" aria-label="Byldit home">
            <Image src="/landing/byldit-mark-mono.webp" alt="" width={34} height={34} priority />
            <span>Byldit</span>
          </Link>
          <nav className="lp-nav-links" aria-label="On this page">
            <a href="#how-it-works">How it works</a>
            <a href="#questions">Questions</a>
          </nav>
          <div className="lp-nav-actions">
            <ThemeToggle />
            <GitHubButton variant="compact" />
          </div>
        </header>

        <div className="lp-copy">
          <div ref={setChapterRef(0)} className="lp-chapter lp-chapter-hero" onFocus={revealOnFocus(0)}>
            <h1 className="lp-display lp-h1 lp-rise">Turn your GitHub into a portfolio.</h1>
            <p className="lp-lede lp-rise" style={{ "--rise": 1 } as CSSProperties}>
              Sign in, choose the repositories to show, and your page is live at your username. No code, no hosting.
            </p>
            <form className="lp-try lp-rise" style={{ "--rise": 2 } as CSSProperties} onSubmit={previewUsername}>
              <label htmlFor="lp-username">See it with your own profile</label>
              <div className="lp-try-field">
                <span aria-hidden="true">byldit.vercel.app/</span>
                <input
                  id="lp-username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="username"
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  aria-describedby="lp-username-status"
                />
                <button type="submit" disabled={status.kind === "loading"}>Preview</button>
              </div>
              <p id="lp-username-status" role="status" data-kind={status.kind}>{status.message}</p>
            </form>
          </div>

          {layers.map((layer, index) => (
            <div key={layer.label} ref={setChapterRef(index + 1)} className="lp-chapter">
              <h2 className="lp-display lp-chapter-title">{layer.title}</h2>
              <p className="lp-lede">{layer.body}</p>
            </div>
          ))}

          <div ref={setChapterRef(FINAL_CHAPTER)} className="lp-chapter" onFocus={revealOnFocus(FINAL_CHAPTER)}>
            <h2 className="lp-display lp-chapter-title">One page, at your username.</h2>
            <p className="lp-lede">Visitors see what you publish. The editing controls only show up for you.</p>
            <p className="lp-address">byldit.vercel.app/<b>{portfolio.username}</b></p>
            <GitHubButton />
          </div>
        </div>

        <div ref={stageRef} className="lp-stage" aria-hidden="true">
          <div className="lp-float">
            <div ref={rigRef} className="lp-rig">
              <div ref={shadowRef} className="lp-shadow" />
              {layers.map(({ label, Sheet }, index) => (
                <div
                  key={label}
                  ref={(element) => {
                    if (element) sheetRefs.current[index] = element;
                  }}
                  className="lp-sheet"
                  style={{ "--i": index, transform: `translate3d(0, 0, ${pxToRem((MIDDLE_LAYER - index) * REST_GAP)})` } as CSSProperties}
                  onClick={() => jumpToChapter(index + 1)}
                >
                  <div className="lp-sheet-body">
                    <div className="lp-sheet-edge" />
                    <div className="lp-sheet-face">
                      {/* Re-keyed so the contents fade over when a real profile replaces the sample. */}
                      <div key={portfolio.username} className="lp-sheet-content">
                        <Sheet portfolio={portfolio} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lp-rail">
          <div className="lp-rail-marks">
            {chapterLabels.map((label, chapter) => (
              <button
                key={label}
                type="button"
                aria-label={chapter === 0 ? "Back to the start" : label}
                aria-current={chapter === activeChapter ? "step" : undefined}
                onClick={() => jumpToChapter(chapter)}
              />
            ))}
          </div>
          <span>{chapterLabels[activeChapter]}</span>
        </div>
      </div>
    </section>
  );
}
