"use client";

import type { PortfolioProjectData } from "@/types/portfolio";
import { ExternalLink, Github, Pencil, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SkillIcon, { SkillIconMap } from "./SkillIcon";

interface ProjectProps {
  project: PortfolioProjectData;
  onOpenProject: () => void;
  onEditProject?: () => void;
  onDeleteProject?: () => void;
  skillIcons?: SkillIconMap;
  /** Lays the card out as a full-width row, used for the first project when the count is odd. */
  wide?: boolean;
}

const footerLinkClass =
  "inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-semibold text-ink-soft transition-colors hover:bg-ink/[0.07] hover:text-ink [&_svg]:size-4";

export default function ProjectCard({
  project,
  onOpenProject,
  onEditProject,
  onDeleteProject,
  skillIcons = {},
  wide = false,
}: ProjectProps) {
  const coverImage = [...project.images].sort((left, right) => left.position - right.position)[0];

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[24px] border border-line bg-raised transition-colors duration-300 hover:border-ink-faint",
        wide && "sm:grid sm:grid-cols-[1.15fr_1fr]",
      )}
    >
      <div className={cn("relative aspect-[16/10] overflow-hidden bg-sheet", wide && "sm:aspect-auto sm:min-h-[280px]")}>
        {coverImage ? (
          <img
            src={coverImage.imageUrl}
            alt=""
            className="absolute inset-0 size-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        ) : (
          // No screenshot yet: the title is set as a plate on a drafting sheet.
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-end bg-[radial-gradient(circle,rgb(var(--c-sheet-edge))_1px,transparent_1.4px)] p-5 [background-size:22px_22px] sm:p-6"
          >
            <span className="absolute left-5 top-5 size-3 rounded-[4px] bg-brand sm:left-6 sm:top-6" />
            <span className="line-clamp-2 font-display text-[34px] font-semibold leading-[1.02] tracking-[-0.03em] text-sheet-text [overflow-wrap:anywhere]">
              {project.title}
            </span>
          </div>
        )}
        {project.videoUrl && (
          <span className="absolute right-3 top-3 inline-flex h-7 items-center gap-1.5 rounded-full bg-black/65 pl-2.5 pr-3 text-[13px] font-semibold text-white backdrop-blur">
            <Play aria-hidden="true" className="size-3 fill-current" />
            Demo video
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-display text-[22px] font-semibold leading-tight tracking-[-0.015em] [overflow-wrap:anywhere]">
          {/* The button's hit area is stretched over the whole card, so the cover and text open the project too. */}
          <button
            type="button"
            onClick={onOpenProject}
            aria-label={`View ${project.title}`}
            className="text-left after:absolute after:inset-0 after:content-['']"
          >
            {project.title}
          </button>
        </h3>
        <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-ink-soft">{project.description}</p>

        {project.techStack.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {project.techStack.slice(0, 3).map((tech) => (
              <li key={tech} className="ui-chip h-7 gap-1.5 bg-transparent px-2.5 text-[13px]">
                <SkillIcon skill={tech} iconMap={skillIcons} className="size-3.5 shrink-0" />
                {tech}
              </li>
            ))}
            {project.techStack.length > 3 && (
              <li className="ui-chip h-7 bg-transparent px-2.5 text-[13px] text-ink-soft">
                +{project.techStack.length - 3} more
              </li>
            )}
          </ul>
        )}

        <div className="relative z-10 -mx-3 -mb-2 mt-auto flex items-center pt-5">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={footerLinkClass}
              title="Open project on GitHub"
            >
              <Github aria-hidden="true" />
              Code
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={footerLinkClass}
              title="Open live project"
            >
              <ExternalLink aria-hidden="true" />
              Live site
            </a>
          )}
          <div className="ml-auto flex items-center">
            {onEditProject && (
              <Button variant="ghost" size="icon" onClick={onEditProject} aria-label="Edit project" title="Edit project">
                <Pencil />
              </Button>
            )}
            {onDeleteProject && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDeleteProject}
                aria-label="Delete project"
                title="Delete project"
                className="hover:text-danger"
              >
                <Trash2 />
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
