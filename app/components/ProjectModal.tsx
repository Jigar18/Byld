"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Github, ExternalLink, ChevronLeft, ChevronRight, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProjectVideoDropzone, { ProjectVideo } from "./ProjectVideoDropzone";
import SkillIcon, { SkillIconMap } from "./SkillIcon";
import ProjectImageUploader, { ProjectImage } from "./ProjectImageUploader";
import ProjectImageCarousel from "./ProjectImageCarousel";

interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  techStack: string[];
  videoUrl?: string | null;
  videoPublicId?: string | null;
  videoDuration?: number | null;
  videoBytes?: number | null;
  videoFormat?: string | null;
  githubUrl?: string;
  liveUrl?: string;
  image?: string;
  images: ProjectImage[];
}

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  projects: Project[];
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
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const handleNext = useCallback(() => {
    if (currentIndex < projects.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, projects.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (project) {
      const index = projects.findIndex((p) => p.id === project.id);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [project, projects]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, projects.length, onClose, handleNext, handlePrevious]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!projects || !projects.length || currentIndex >= projects.length) {
    return null;
  }

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
                        disabled={currentIndex === projects.length - 1}
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
                  <h4 className="text-lg font-medium text-slate-100 mb-3 flex items-center gap-2">
                    <span className="inline-flex p-1.5 rounded-md bg-zinc-900/20 text-zinc-400 shadow-md shadow-zinc-500/20 border border-zinc-800/30">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-file-text"
                      >
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" x2="8" y1="13" y2="13" />
                        <line x1="16" x2="8" y1="17" y2="17" />
                        <line x1="10" x2="8" y1="9" y2="9" />
                      </svg>
                    </span>
                    About this project
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    {currentProject.longDescription ||
                      currentProject.description}
                  </p>
                </div>

                {/* 2. Tech stack */}
                <div className="mb-8">
                  <h4 className="text-lg font-medium text-slate-100 mb-3 flex items-center gap-2">
                    <span className="inline-flex p-1.5 rounded-md bg-zinc-900/20 text-zinc-400 shadow-md shadow-zinc-500/20 border border-zinc-800/30">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-code-2"
                      >
                        <path d="m18 16 4-4-4-4" />
                        <path d="m6 8-4 4 4 4" />
                        <path d="m14.5 4-5 16" />
                      </svg>
                    </span>
                    Tech Stack Used
                  </h4>

                  {/* Project's actual tech stack */}
                  {currentProject.techStack &&
                    currentProject.techStack.length > 0 && (
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
                  <h4 className="text-lg font-medium text-slate-100 mb-3 flex items-center gap-2">
                    <span className="inline-flex p-1.5 rounded-md bg-zinc-900/20 text-zinc-400 shadow-md shadow-zinc-500/20 border border-zinc-800/30">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-play"
                      >
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </span>
                    Project Demo
                  </h4>
                  {currentProject.videoUrl ? (
                    <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-black shadow-lg">
                      <video src={currentProject.videoUrl} controls preload="metadata" playsInline className="aspect-video w-full bg-black object-contain" />
                    </div>
                  ) : onVideoUploaded ? (
                    <ProjectVideoDropzone onUploaded={(video) => onVideoUploaded(currentProject.id, video)} />
                  ) : null}
                </div>}

                {(currentProject.images?.length || isOwner) && <div className="mb-8">
                  <h4 className="mb-3 flex items-center gap-2 text-lg font-medium text-slate-100">
                    <span className="inline-flex rounded-md border border-zinc-800/30 bg-zinc-900/20 p-1.5 text-zinc-400 shadow-md shadow-zinc-500/20"><Images className="h-4 w-4" /></span>
                    Project Images
                  </h4>
                  {currentProject.images?.length ? (
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
                  disabled={currentIndex === projects.length - 1}
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
