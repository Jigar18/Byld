"use client";

import { type CSSProperties, type KeyboardEvent, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Github, Maximize2, Pencil, Play, Trash2 } from "lucide-react";
import type { PortfolioProjectData } from "@/types/portfolio";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SkillIcon, { type SkillIconMap } from "./SkillIcon";

interface ProjectStackProps {
  projects: PortfolioProjectData[];
  /** The project at the front of the stack. The first one is used when this is not in the list. */
  frontId: string | null;
  onFrontChange: (projectId: string) => void;
  onOpenProject: (project: PortfolioProjectData) => void;
  onEditProject?: (project: PortfolioProjectData) => void;
  onDeleteProject?: (project: PortfolioProjectData) => void;
  skillIcons?: SkillIconMap;
}

const SHOWN_TECH_COUNT = 6;
const SWIPE_DISTANCE = 44;

const roundControlClass =
  "grid size-9 place-items-center rounded-full bg-well text-ink-soft transition-colors hover:bg-ink hover:text-on-ink [&_svg]:size-[18px]";

function ProjectCover({ project }: { project: PortfolioProjectData }) {
  const coverImage = [...project.images].sort((left, right) => left.position - right.position)[0];

  return (
    <>
      {coverImage ? (
        <img
          src={coverImage.imageUrl}
          alt=""
          draggable={false}
          className="absolute inset-0 size-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
        />
      ) : (
        // No screenshot yet: the title is set as a plate on a drafting sheet.
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-end bg-[radial-gradient(circle,rgb(var(--c-sheet-edge))_1px,transparent_1.4px)] p-5 [background-size:22px_22px] sm:p-7"
        >
          <span className="absolute left-5 top-5 size-3 rounded-[4px] bg-brand sm:left-7 sm:top-7" />
          <span className="line-clamp-2 font-display text-[34px] font-semibold leading-[1.02] tracking-[-0.03em] text-sheet-text [overflow-wrap:anywhere] sm:text-[44px]">
            {project.title}
          </span>
        </span>
      )}
      {project.videoUrl && (
        <span className="absolute right-3 top-3 inline-flex h-7 items-center gap-1.5 rounded-full bg-black/65 pl-2.5 pr-3 text-[13px] font-semibold text-white backdrop-blur">
          <Play aria-hidden="true" className="size-3 fill-current" />
          Demo video
        </span>
      )}
    </>
  );
}

// The projects as a stack of covers with one at the front, and that project's details beside it.
export default function ProjectStack({
  projects,
  frontId,
  onFrontChange,
  onOpenProject,
  onEditProject,
  onDeleteProject,
  skillIcons = {},
}: ProjectStackProps) {
  // The cover that is travelling the long way between the front and the back, which gets its own animation.
  const [shuffle, setShuffle] = useState<{ projectId: string; move: "to-back" | "to-front" } | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);
  const swiped = useRef(false);

  const count = projects.length;
  const frontIndex = Math.max(0, projects.findIndex((project) => project.id === frontId));
  const front = projects[frontIndex];

  const bringToFront = (index: number) => {
    const nextIndex = (index + count) % count;
    if (nextIndex === frontIndex) return;

    if (nextIndex === (frontIndex + 1) % count) setShuffle({ projectId: front.id, move: "to-back" });
    else if (nextIndex === (frontIndex - 1 + count) % count) setShuffle({ projectId: projects[nextIndex].id, move: "to-front" });
    else setShuffle(null);

    onFrontChange(projects[nextIndex].id);
  };

  const moveBetweenTabs = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const nextIndex = (frontIndex + (event.key === "ArrowRight" ? 1 : -1) + count) % count;
    bringToFront(nextIndex);
    tabsRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[nextIndex]?.focus();
  };

  const finishDrag = (endX: number) => {
    if (dragStartX.current === null) return;
    const distance = endX - dragStartX.current;
    dragStartX.current = null;
    if (count < 2 || Math.abs(distance) < SWIPE_DISTANCE) return;
    swiped.current = true;
    bringToFront(frontIndex + (distance < 0 ? 1 : -1));
  };

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.22fr)_minmax(0,1fr)] lg:gap-12">
      <div
        className="pf-stack"
        style={{ "--behind": count - 1 } as CSSProperties}
        onPointerDown={(event) => {
          dragStartX.current = event.clientX;
          swiped.current = false;
        }}
        onPointerUp={(event) => finishDrag(event.clientX)}
        onPointerCancel={() => (dragStartX.current = null)}
        // A drag with the mouse ends in a click on the cover it started on, which must not open the project.
        onClickCapture={(event) => {
          if (!swiped.current) return;
          swiped.current = false;
          event.stopPropagation();
        }}
      >
        <div className="pf-stack-rig" data-tilt="4">
          {projects.map((project, index) => {
            const depth = (index - frontIndex + count) % count;
            const isFront = depth === 0;
            const isShuffling = shuffle?.projectId === project.id;

            return (
              <button
                key={project.id}
                type="button"
                onClick={() => (isFront ? onOpenProject(project) : bringToFront(index))}
                aria-label={isFront ? `View ${project.title}` : `Show ${project.title}`}
                tabIndex={isFront ? 0 : -1}
                data-shuffle={isShuffling ? shuffle.move : undefined}
                onAnimationEnd={isShuffling ? () => setShuffle(null) : undefined}
                className="pf-stack-cover group text-left"
                style={{ "--depth": depth } as CSSProperties}
              >
                <ProjectCover project={project} />
                {isFront && (
                  <span className="absolute bottom-4 left-4 inline-flex h-10 translate-y-2 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-black opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transform-none">
                    <Maximize2 aria-hidden="true" className="size-4" />
                    View project
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-w-0">
        {count > 1 && (
          <div className="mb-6 flex items-start gap-3">
            <div
              ref={tabsRef}
              role="tablist"
              aria-label="Projects"
              onKeyDown={moveBetweenTabs}
              className="flex min-w-0 flex-1 flex-wrap gap-1.5"
            >
              {projects.map((project, index) => (
                <button
                  key={project.id}
                  type="button"
                  role="tab"
                  id={`project-tab-${project.id}`}
                  aria-selected={index === frontIndex}
                  aria-controls="project-details"
                  tabIndex={index === frontIndex ? 0 : -1}
                  onClick={() => bringToFront(index)}
                  className={cn(
                    "h-9 max-w-[20ch] truncate rounded-full px-4 text-sm font-semibold transition-colors duration-300",
                    index === frontIndex ? "bg-ink text-on-ink" : "bg-well text-ink-soft hover:text-ink",
                  )}
                >
                  {project.title}
                </button>
              ))}
            </div>
            <div className="flex flex-none gap-1.5">
              <button
                type="button"
                onClick={() => bringToFront(frontIndex - 1)}
                aria-label="Previous project"
                className={roundControlClass}
              >
                <ChevronLeft aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => bringToFront(frontIndex + 1)}
                aria-label="Next project"
                className={roundControlClass}
              >
                <ChevronRight aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        <div
          // Keyed so the details animate in again for each project.
          key={front.id}
          id="project-details"
          role={count > 1 ? "tabpanel" : undefined}
          aria-labelledby={count > 1 ? `project-tab-${front.id}` : undefined}
          className="pf-swap"
        >
          <h3 className="font-display text-[30px] font-semibold leading-[1.04] tracking-[-0.03em] [overflow-wrap:anywhere] sm:text-[36px]">
            {front.title}
          </h3>
          <p className="mt-3 line-clamp-4 leading-[1.65] text-ink-soft">{front.description}</p>

          {front.techStack.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-1.5">
              {front.techStack.slice(0, SHOWN_TECH_COUNT).map((tech) => (
                <li key={tech} className="pf-chip h-8 gap-1.5 px-3 text-[13.5px]">
                  <SkillIcon skill={tech} iconMap={skillIcons} className="size-3.5 shrink-0" />
                  {tech}
                </li>
              ))}
              {front.techStack.length > SHOWN_TECH_COUNT && (
                <li className="pf-chip h-8 px-3 text-[13.5px] text-ink-soft">
                  +{front.techStack.length - SHOWN_TECH_COUNT} more
                </li>
              )}
            </ul>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-2">
            <Button onClick={() => onOpenProject(front)}>View project</Button>
            {front.githubUrl && (
              <Button asChild variant="secondary">
                <a href={front.githubUrl} target="_blank" rel="noopener noreferrer" title="Open project on GitHub">
                  <Github aria-hidden="true" />
                  Code
                </a>
              </Button>
            )}
            {front.liveUrl && (
              <Button asChild variant="secondary">
                <a href={front.liveUrl} target="_blank" rel="noopener noreferrer" title="Open live project">
                  <ExternalLink aria-hidden="true" />
                  Live site
                </a>
              </Button>
            )}
            {(onEditProject || onDeleteProject) && (
              <div className="ml-auto flex items-center">
                {onEditProject && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditProject(front)}
                    aria-label="Edit project"
                    title="Edit project"
                  >
                    <Pencil />
                  </Button>
                )}
                {onDeleteProject && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteProject(front)}
                    aria-label="Delete project"
                    title="Delete project"
                    className="hover:text-danger"
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
