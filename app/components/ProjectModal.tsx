"use client";

import type { PortfolioProjectData } from "@/types/portfolio";
import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Github, ExternalLink, ChevronLeft, ChevronRight, Images, FileText, Code2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProjectVideoDropzone, { ProjectVideo } from "./ProjectVideoDropzone";
import SkillIcon, { SkillIconMap } from "./SkillIcon";
import ProjectImageUploader, { ProjectImage } from "./ProjectImageUploader";
import ProjectImageCarousel from "./ProjectImageCarousel";

function SectionHeading({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <h4 className="text-lg font-medium text-slate-100 mb-3 flex items-center gap-2">
      <span className="inline-flex p-1.5 rounded-md bg-zinc-900/20 text-zinc-400 shadow-md shadow-zinc-500/20 border border-zinc-800/30">
        {icon}
      </span>
      {children}
    </h4>
  );
}

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
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") setCurrentIndex((index) => Math.min(lastIndex, index + 1));
      else if (e.key === "ArrowLeft") setCurrentIndex((index) => Math.max(0, index - 1));
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, lastIndex, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (currentIndex > lastIndex) return null;

  const currentProject = projects[currentIndex];

  return (
    <AnimatePresence>
      {isOpen && currentProject && (
        <motion.div
          {...{className:"fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 backdrop-blur-sm sm:p-4",
          onClick:onClose}}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Modal Content */}
          <motion.div
            {...{className:"relative flex max-h-[94dvh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-700 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl sm:max-h-[90vh] sm:w-[85%]",
            onClick:(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Close button */}
            <Button
              className="absolute right-3 top-3 z-10 rounded-full border border-slate-700 bg-slate-800/80 p-2 text-slate-300 hover:bg-slate-700 hover:text-white sm:right-4 sm:top-4"
              onClick={onClose}
              aria-label="Close modal"
              size="icon"
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="flex min-h-0 flex-1 flex-col">
              {/* Header section with title and navigation */}
              <div className="shrink-0 border-b border-slate-700/50 bg-slate-800/20 p-4 pr-14 backdrop-blur-sm sm:p-8">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-slate-400 flex items-center">
                    <span className="mr-2">
                      Project {currentIndex + 1} of {projects.length}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 rounded-full bg-slate-800/80 hover:bg-slate-700 border-slate-600 text-slate-300 disabled:opacity-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={handleNext}
                        disabled={currentIndex === lastIndex}
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 rounded-full bg-slate-800/80 hover:bg-slate-700 border-slate-600 text-slate-300 disabled:opacity-50"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="relative mb-2">
                  <h3 className="break-words text-2xl font-bold text-slate-100 sm:text-3xl">
                    {currentProject.title}
                  </h3>
                  <motion.div
                    {...{className:"absolute -bottom-1 left-0 h-[3px] bg-zinc-500 rounded-full"}}
                    initial={{ width: 0 }}
                    animate={{ width: "60px" }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="flex flex-col p-4 sm:p-8">
                {/* 1. Description */}
                <div className="mb-8">
                  <SectionHeading icon={<FileText className="h-4 w-4" />}>About this project</SectionHeading>
                  <p className="text-slate-300 leading-relaxed">
                    {currentProject.description}
                  </p>
                </div>

                {/* 2. Tech stack */}
                <div className="mb-8">
                  <SectionHeading icon={<Code2 className="h-4 w-4" />}>Tech Stack Used</SectionHeading>

                  {/* Project's actual tech stack */}
                  {currentProject.techStack.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {currentProject.techStack.map((tech, index) => (
                            <motion.span
                              key={tech}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.3,
                                delay: index * 0.05,
                              }}
                              {...{className:"inline-flex items-center gap-1.5 bg-gradient-to-r from-zinc-600/20 to-zinc-500/20 text-zinc-300 px-3 py-1.5 rounded-md text-sm border border-zinc-500/30 shadow-sm"}}
                            >
                              <SkillIcon skill={tech} iconMap={skillIcons} />
                              {tech}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    )}

                </div>

                {/* Visitors only see this section when a demo exists. */}
                {(currentProject.videoUrl || isOwner) && <div className="mb-8">
                  <SectionHeading icon={<Play className="h-4 w-4" />}>Project Demo</SectionHeading>
                  {currentProject.videoUrl ? (
                    <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-black shadow-lg">
                      <video src={currentProject.videoUrl} controls preload="metadata" playsInline className="aspect-video w-full bg-black object-contain" />
                    </div>
                  ) : onVideoUploaded ? (
                    <ProjectVideoDropzone onUploaded={(video) => onVideoUploaded(currentProject.id, video)} />
                  ) : null}
                </div>}

                {(currentProject.images.length > 0 || isOwner) && <div className="mb-8">
                  <SectionHeading icon={<Images className="h-4 w-4" />}>Project Images</SectionHeading>
                  {currentProject.images.length ? (
                    <ProjectImageCarousel images={currentProject.images} />
                  ) : onImagesChanged ? (
                    <ProjectImageUploader
                      images={[]}
                      onUploaded={(image) => onImagesChanged(currentProject.id, [image])}
                      onReorder={() => undefined}
                      onRemove={() => undefined}
                    />
                  ) : null}
                </div>}

                {/* 4. Project links */}
                <div className="mt-4 flex justify-end gap-3">
                  {currentProject.githubUrl && (
                    <a
                      href={currentProject.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-700 hover:text-white"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Open project on GitHub"
                      title="Open project on GitHub"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                  )}
                  {currentProject.liveUrl && (
                    <a
                      href={currentProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-700 hover:text-white"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Open live project"
                      title="Open live project"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-slate-700/50 bg-slate-800/20 p-4 sm:p-6">
                <Button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  variant="outline"
                  className="flex items-center gap-1 bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={currentIndex === lastIndex}
                  variant="outline"
                  className="flex items-center gap-1 bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200 disabled:opacity-50"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
