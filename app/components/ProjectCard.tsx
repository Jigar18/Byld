"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { ExternalLink, Github, Eye, Pencil, X } from "lucide-react";
import { useRandomImage } from "@/utils/randomImageSelect";
import SkillIcon, { SkillIconMap } from "./SkillIcon";

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  techStack: string[];
  github: string;
  githubUrl: string;
  liveUrl: string;
  videoUrl: string | null;
  videoPublicId: string | null;
  videoDuration: number | null;
  videoBytes: number | null;
  videoFormat: string | null;
  longDescription?: string;
}

interface ProjectProps {
  project: Project;
  index: number;
  onOpenProject?: (project: Project) => void;
  onEditProject?: (project: Project) => void;
  onDeleteProject?: (project: Project) => void;
  skillIcons?: SkillIconMap;
}

export default function ProjectCard({
  project,
  onOpenProject,
  onEditProject,
  onDeleteProject,
  skillIcons = {},
}: ProjectProps) {
  const handleClick = () => {
    if (onOpenProject) {
      onOpenProject(project);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteProject) {
      onDeleteProject(project);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditProject?.(project);
  };

  const randomBg = useRandomImage();

  return (
    <motion.div
      {...{className:"profile-card profile-surface-neutral profile-card-lift relative group flex min-h-[19rem] flex-col overflow-hidden rounded-2xl border shadow-lg shadow-black/20 sm:min-h-[23.75rem]"}}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Project actions appear without competing with the content. */}
      {onEditProject && <button
        onClick={handleEdit}
        className="absolute right-11 top-2 z-10 rounded-full bg-zinc-800/90 p-2 text-white opacity-100 transition-all duration-200 hover:scale-110 hover:bg-zinc-700 sm:opacity-0 sm:group-hover:opacity-100"
        aria-label="Edit project"
        title="Edit project"
      >
        <Pencil className="h-4 w-4" />
      </button>}
      {onDeleteProject && <button
        onClick={handleDelete}
        className="absolute right-2 top-2 z-10 rounded-full bg-zinc-600/80 p-2 text-white opacity-100 transition-all duration-200 hover:scale-110 hover:bg-zinc-500 sm:opacity-0 sm:group-hover:opacity-100"
        aria-label="Delete project"
        title="Delete project"
      >
        <X className="h-4 w-4" />
      </button>}

      <button
        type="button"
        className="group/preview relative block h-[8.5rem] w-full cursor-pointer sm:h-[13.3rem]"
        onClick={handleClick}
        aria-label={`View ${project.title}`}
      >
        <Image
          src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
          alt={project.title}
          fill
          className="object-cover"
          style={{ backgroundColor: "#18181b", backgroundImage: randomBg }}
        />
        <span className="absolute inset-0 flex items-center justify-center bg-slate-900/70 opacity-0 transition-opacity duration-300 group-hover/preview:opacity-100">
          <motion.span
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            {...{className:"text-slate-200/90 transition-colors hover:text-white"}}
          >
            <Eye size={30} />
          </motion.span>
        </span>
      </button>

      <div className="flex flex-1 flex-col p-4">
        <h3
          className="portfolio-display cursor-pointer text-lg font-semibold text-slate-100 transition-colors hover:text-white"
          onClick={handleClick}
        >
          {project.title}
        </h3>
        <p className="text-slate-300 text-sm mt-2 line-clamp-2">
          {project.description}
        </p>

        <div className="flex gap-2 mt-3 flex-wrap">
          {project.tags.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.025] px-2 py-1 text-xs text-zinc-300 shadow-sm"
            >
              <SkillIcon skill={tech} iconMap={skillIcons} className="h-3.5 w-3.5 shrink-0" />
              {tech}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="rounded-md border border-white/10 bg-white/[0.025] px-2 py-1 text-xs text-zinc-300 shadow-sm">
              +{project.tags.length - 3} more
            </span>
          )}
        </div>

        <div className="mt-auto flex justify-end gap-3 pt-4">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 transition-colors hover:text-white"
              onClick={(e) => e.stopPropagation()}
              aria-label="Open project on GitHub"
              title="Open project on GitHub"
            >
              <Github size={18} />
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 transition-colors hover:text-white"
              onClick={(e) => e.stopPropagation()}
              aria-label="Open live project"
              title="Open live project"
            >
              <ExternalLink size={18} />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
