"use client";

import type { PortfolioProjectData } from "@/types/portfolio";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import ProjectVideoDropzone, { ProjectVideo } from "./ProjectVideoDropzone";
import SkillIcon, { SkillIconMap } from "./SkillIcon";
import ProjectImageUploader, { ProjectImage } from "./ProjectImageUploader";
import ProjectImageCarousel from "./ProjectImageCarousel";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: PortfolioProjectData | null;
  projects: PortfolioProjectData[];
  isOwner?: boolean;
  onVideoUploaded?: (projectId: string, video: ProjectVideo) => Promise<void>;
  onImagesChanged?: (projectId: string, images: ProjectImage[]) => Promise<void>;
  skillIcons?: SkillIconMap;
}

const mediaHeadingClass = "mb-3 font-display text-lg font-semibold tracking-[-0.01em]";

export default function ProjectModal({
  isOpen,
  onClose,
  project,
  projects,
  isOwner = false,
  onVideoUploaded,
  onImagesChanged,
  skillIcons = {},
}: ProjectModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const lastIndex = projects.length - 1;
  const handleNext = () => setCurrentIndex((index) => Math.min(lastIndex, index + 1));
  const handlePrevious = () => setCurrentIndex((index) => Math.max(0, index - 1));

  useEffect(() => {
    if (project) {
      const index = projects.findIndex((p) => p.id === project.id);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [project, projects]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Inside the player the arrow keys seek the video.
      if (e.target instanceof HTMLVideoElement) return;
      if (e.key === "ArrowRight") setCurrentIndex((index) => Math.min(lastIndex, index + 1));
      else if (e.key === "ArrowLeft") setCurrentIndex((index) => Math.max(0, index - 1));
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, lastIndex]);

  // Read from the index rather than the `project` prop, so the content stays in place while the sheet closes.
  const currentProject = projects[currentIndex] as PortfolioProjectData | undefined;

  return (
    <Dialog
      open={isOpen && Boolean(currentProject)}
      onClose={onClose}
      title={currentProject?.title ?? ""}
      size="lg"
      footer={
        projects.length > 1 && (
          <>
            <span className="mr-auto text-sm tabular-nums text-ink-soft">
              Project {currentIndex + 1} of {projects.length}
            </span>
            <Button variant="secondary" size="sm" onClick={handlePrevious} disabled={currentIndex === 0}>
              <ChevronLeft aria-hidden="true" />
              Previous
            </Button>
            <Button variant="secondary" size="sm" onClick={handleNext} disabled={currentIndex === lastIndex}>
              Next
              <ChevronRight aria-hidden="true" />
            </Button>
          </>
        )
      }
    >
      {currentProject && (
        <div className="space-y-8 pb-2">
          <div>
            <p className="max-w-[68ch] whitespace-pre-wrap text-[17px] leading-[1.7]">{currentProject.description}</p>

            {currentProject.techStack.length > 0 && (
              <ul aria-label="Tech stack" className="mt-5 flex flex-wrap gap-2">
                {currentProject.techStack.map((tech) => (
                  <li key={tech} className="ui-chip h-8 px-3 text-sm">
                    <SkillIcon skill={tech} iconMap={skillIcons} />
                    {tech}
                  </li>
                ))}
              </ul>
            )}

            {(currentProject.githubUrl || currentProject.liveUrl) && (
              <div className="mt-6 flex flex-wrap gap-2.5">
                {currentProject.liveUrl && (
                  <Button asChild size="sm">
                    <a href={currentProject.liveUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink aria-hidden="true" />
                      Open live site
                    </a>
                  </Button>
                )}
                {currentProject.githubUrl && (
                  <Button asChild variant="secondary" size="sm">
                    <a href={currentProject.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github aria-hidden="true" />
                      View on GitHub
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Visitors only see the media sections that have something in them. */}
          {(currentProject.videoUrl || isOwner) && (
            <section>
              <h3 className={mediaHeadingClass}>Demo video</h3>
              {currentProject.videoUrl ? (
                <div className="overflow-hidden rounded-2xl border border-line bg-black">
                  <video
                    key={currentProject.id}
                    src={currentProject.videoUrl}
                    controls
                    preload="metadata"
                    playsInline
                    className="aspect-video w-full bg-black object-contain"
                  />
                </div>
              ) : onVideoUploaded ? (
                <ProjectVideoDropzone onUploaded={(video) => onVideoUploaded(currentProject.id, video)} />
              ) : null}
            </section>
          )}

          {(currentProject.images.length > 0 || isOwner) && (
            <section>
              <h3 className={mediaHeadingClass}>Screenshots</h3>
              {currentProject.images.length ? (
                <ProjectImageCarousel key={currentProject.id} images={currentProject.images} />
              ) : onImagesChanged ? (
                <ProjectImageUploader
                  images={[]}
                  onUploaded={(image) => onImagesChanged(currentProject.id, [image])}
                  onReorder={() => undefined}
                  onRemove={() => undefined}
                />
              ) : null}
            </section>
          )}
        </div>
      )}
    </Dialog>
  );
}
