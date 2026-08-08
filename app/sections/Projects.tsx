"use client";

import { motion, useInView } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Code2,
  FolderPlus,
} from "lucide-react";
import ProjectCard from "../components/ProjectCard";
import DeleteProjectModal from "../components/DeleteProjectModal";
import AddProjectModal, {
  PortfolioProject,
} from "../components/AddProjectModal";
import ProjectModal from "../components/ProjectModal";
import ProjectSourceModal from "../components/ProjectSourceModal";
import {
  ProjectVideo,
  removeUnsavedProjectVideo,
} from "../components/ProjectVideoDropzone";
import { useUser } from "../context/UserContext";
import { getSkillIcon, SkillIconMap } from "../components/SkillIcon";
import { primaryActionButtonClass } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type ModalProject = Omit<PortfolioProject, "githubUrl" | "liveUrl"> & {
  githubUrl: string;
  liveUrl: string;
  image: string;
  tags: string[];
  github: string;
  longDescription?: string;
};

const MAX_PROJECTS = 4;

const findMissingSkillIcons = async (
  techStacks: string[][],
  currentIcons: SkillIconMap,
) => {
  const missingSkills = Array.from(new Set(techStacks.flat())).filter(
    (skill) => currentIcons[skill] === undefined && !getSkillIcon(skill),
  );

  const icons = await Promise.all(
    missingSkills.map(async (skill) => {
      try {
        const response = await fetch(
          `/api/skill-icons?skill=${encodeURIComponent(skill)}`,
        );
        if (!response.ok) return null;
        const data = (await response.json()) as { icons?: string[] };
        return data.icons?.[0] ? ([skill, data.icons[0]] as const) : null;
      } catch {
        return null;
      }
    }),
  );

  return Object.fromEntries(icons.filter((icon) => icon !== null));
};

const toModalProject = (project: PortfolioProject): ModalProject => ({
  ...project,
  githubUrl: project.githubUrl || "",
  liveUrl: project.liveUrl || "",
  image: "",
  tags: project.techStack,
  github: project.githubUrl || "",
  longDescription: project.description,
});

export default function Projects() {
  const { isOwner, portfolioApiUrl } = useUser();
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref as React.RefObject<HTMLElement>, {
    once: true,
    margin: "-100px",
  });
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillIcons, setSkillIcons] = useState<SkillIconMap>({});
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(
    null,
  );
  const [projectToDelete, setProjectToDelete] =
    useState<PortfolioProject | null>(null);
  const [selectedProject, setSelectedProject] = useState<ModalProject | null>(
    null,
  );
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef({ active: false, moved: false, startX: 0, scrollLeft: 0 });
  const suppressClickRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateCarouselControls = useCallback(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    setCanScrollLeft(carousel.scrollLeft > 2);
    setCanScrollRight(
      carousel.scrollLeft + carousel.clientWidth < carousel.scrollWidth - 2,
    );
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      const [projectResponse, skillResponse] = await Promise.all([
        fetch(portfolioApiUrl("/api/projects"), { credentials: "include" }),
        fetch(portfolioApiUrl("/api/getUserSkills"), {
          credentials: "include",
        }),
      ]);
      if (projectResponse.ok) {
        const data = await projectResponse.json();
        const loadedProjects = (data.projects || []) as PortfolioProject[];
        setProjects(loadedProjects);
        if (skillResponse.ok) {
          const skillData = await skillResponse.json();
          const storedIcons = (skillData.iconMap || {}) as SkillIconMap;
          const projectIcons = await findMissingSkillIcons(
            loadedProjects.map((project) => project.techStack),
            storedIcons,
          );
          setSkills(skillData.skills || []);
          setSkillIcons({ ...storedIcons, ...projectIcons });
        }
      }
      if (!projectResponse.ok && skillResponse.ok) {
        const data = await skillResponse.json();
        setSkills(data.skills || []);
        setSkillIcons(data.iconMap || {});
      }
    } finally {
      setLoading(false);
    }
  }, [portfolioApiUrl]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    updateCarouselControls();
    const observer = new ResizeObserver(updateCarouselControls);
    observer.observe(carousel);
    return () => observer.disconnect();
  }, [loading, projects.length, updateCarouselControls]);

  const saveProject = async (draft: Omit<PortfolioProject, "id">) => {
    if (!editingProject && projects.length >= MAX_PROJECTS) {
      throw new Error(`Only ${MAX_PROJECTS} projects are allowed`);
    }
    const response = await fetch("/api/projects", {
      method: editingProject ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(
        editingProject ? { ...draft, id: editingProject.id } : draft,
      ),
    });
    if (!response.ok) throw new Error("Unable to save project");
    const data = await response.json();
    setProjects((current) =>
      editingProject
        ? current.map((project) =>
            project.id === editingProject.id ? data.project : project,
          )
        : [data.project, ...current],
    );
  };

  const saveProjectVideo = async (projectId: string, video: ProjectVideo) => {
    const project = projects.find((item) => item.id === projectId);
    if (!project) throw new Error("Project not found");

    const response = await fetch("/api/projects", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...project, ...video, id: projectId }),
    });
    if (!response.ok) {
      await removeUnsavedProjectVideo(video.videoPublicId);
      throw new Error(
        "The demo was uploaded but could not be saved to the project",
      );
    }

    const data = await response.json();
    setProjects((current) =>
      current.map((item) => (item.id === projectId ? data.project : item)),
    );
    setSelectedProject(toModalProject(data.project));
  };

  const deleteProject = async () => {
    if (!projectToDelete) return;
    const response = await fetch(`/api/projects?id=${projectToDelete.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (response.ok)
      setProjects((current) =>
        current.filter((project) => project.id !== projectToDelete.id),
      );
    setProjectToDelete(null);
  };

  const openEditor = (project: PortfolioProject | null = null) => {
    if (!project && projects.length >= MAX_PROJECTS) return;
    setEditingProject(project);
    if (project) setEditorOpen(true);
    else setSourceOpen(true);
  };

  const importProject = async (repositoryId: number) => {
    const response = await fetch("/api/projects/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ repositoryId }),
    });
    const data = (await response.json()) as { project?: PortfolioProject; error?: string };
    if (!response.ok || !data.project) throw new Error(data.error || "Unable to import project");
    setProjects((current) => [data.project!, ...current]);
    const importedIcons = await findMissingSkillIcons(
      [data.project.techStack],
      skillIcons,
    );
    setSkillIcons((current) => ({ ...current, ...importedIcons }));
    setSourceOpen(false);
    setSelectedProject(toModalProject(data.project));
  };

  const scrollProjects = (direction: -1 | 1) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    carousel.scrollBy({
      left: direction * carousel.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  const startDragging = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    dragRef.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      scrollLeft: event.currentTarget.scrollLeft,
    };
  };

  const dragProjects = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const distance = event.clientX - dragRef.current.startX;
    if (Math.abs(distance) > 6 && !dragRef.current.moved) {
      dragRef.current.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setIsDragging(true);
    }
    if (!dragRef.current.moved) return;
    event.currentTarget.scrollLeft = dragRef.current.scrollLeft - distance;
    event.preventDefault();
  };

  const stopDragging = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    suppressClickRef.current = dragRef.current.moved;
    dragRef.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);
    updateCarouselControls();
  };

  const preventDraggedClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  };

  const modalProjects = projects.map(toModalProject);
  const projectLimitReached = projects.length >= MAX_PROJECTS;

  return (
    <motion.div
      ref={ref}
      {...{ className: "profile-accent-plum profile-section-rule w-full border-t pt-7" }}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.55 }}
    >
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="profile-section-label flex items-center gap-3 text-xs font-medium uppercase tracking-[0.22em]">
            <span className="profile-icon inline-flex rounded-lg border p-2">
              <Code2 className="h-4 w-4" />
            </span>
            Projects
          </p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
            Selected work, experiments, and proof of craft.
          </p>
        </div>
        {isOwner && projects.length > 0 && (
          <div className="flex items-center gap-2">
            {projectLimitReached && (
              <TooltipProvider delay={200}>
                <Tooltip>
                  <TooltipTrigger
                    className="inline-flex rounded-full p-1.5 text-zinc-500 outline-none transition-colors hover:bg-white/[0.06] hover:text-zinc-200 focus-visible:ring-2 focus-visible:ring-white/30"
                    aria-label="Project upload limit"
                  >
                    <Info className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={8}>
                    A maximum of four projects can be uploaded.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <button
              onClick={() => openEditor()}
              disabled={projectLimitReached}
              className={cn(
                primaryActionButtonClass,
                "disabled:cursor-not-allowed disabled:opacity-45",
              )}
            >
              <FolderPlus className="h-4 w-4" />
              Add project
            </button>
          </div>
        )}
      </div>
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-72 animate-pulse rounded-2xl border border-white/10 bg-white/[0.035]"
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          {...{
            className:
              "grid min-h-64 place-items-center rounded-2xl border border-dashed border-white/15 bg-white/[0.025] p-8 text-center",
          }}
        >
          <div>
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/[0.06]">
              <FolderPlus className="h-5 w-5 text-zinc-300" />
            </span>
            <h3 className="mt-5 text-lg font-medium text-white">
              No projects added yet.
            </h3>
            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-zinc-500">
              A maximum of four projects can be uploaded to this portfolio.
            </p>
            {isOwner && (
              <>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-400">
                  Start with the project that best represents your craft.
                </p>
                <button
                  onClick={() => openEditor()}
                  className={cn(primaryActionButtonClass, "mt-5")}
                >
                  Add your first project
                </button>
              </>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="relative">
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollProjects(-1)}
              className="absolute left-2 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-zinc-950/90 text-zinc-200 shadow-xl backdrop-blur-sm transition hover:scale-105 hover:bg-zinc-800"
              aria-label="Show previous projects"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <div
            ref={carouselRef}
            className={`project-carousel flex touch-pan-x gap-5 overflow-x-auto py-2 ${isDragging ? "cursor-grabbing select-none scroll-auto" : "cursor-grab scroll-smooth"}`}
            onScroll={updateCarouselControls}
            onPointerDown={startDragging}
            onPointerMove={dragProjects}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
            onClickCapture={preventDraggedClick}
            onDragStart={(event) => event.preventDefault()}
          >
            {projects.map((project, index) => (
              <div
                key={project.id}
                className="shrink-0 basis-full sm:basis-[58%] lg:basis-[calc((100%-2.5rem)/2.5)] [&>div]:h-full"
              >
                <ProjectCard
                  project={toModalProject(project)}
                  index={index}
                  skillIcons={skillIcons}
                  onOpenProject={(selected) => setSelectedProject(selected)}
                  onEditProject={isOwner ? () => openEditor(project) : undefined}
                  onDeleteProject={
                    isOwner ? () => setProjectToDelete(project) : undefined
                  }
                />
              </div>
            ))}
          </div>
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollProjects(1)}
              className="absolute right-2 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-zinc-950/90 text-zinc-200 shadow-xl backdrop-blur-sm transition hover:scale-105 hover:bg-zinc-800"
              aria-label="Show more projects"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      )}
      {isOwner && (
        <DeleteProjectModal
          isOpen={Boolean(projectToDelete)}
          onClose={() => setProjectToDelete(null)}
          onConfirm={deleteProject}
          project={projectToDelete ? toModalProject(projectToDelete) : null}
        />
      )}
      {isOwner && (
        <ProjectSourceModal
          isOpen={sourceOpen}
          onClose={() => setSourceOpen(false)}
          onManual={() => {
            setSourceOpen(false);
            setEditingProject(null);
            setEditorOpen(true);
          }}
          onImport={importProject}
        />
      )}
      {isOwner && (
        <AddProjectModal
          isOpen={editorOpen}
          onClose={() => {
            setEditorOpen(false);
            setEditingProject(null);
          }}
          onSave={saveProject}
          userSkills={skills}
          skillIcons={skillIcons}
          project={editingProject}
        />
      )}
      <ProjectModal
        isOpen={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
        project={selectedProject}
        projects={modalProjects}
        skillIcons={skillIcons}
        isOwner={isOwner}
        onVideoUploaded={isOwner ? saveProjectVideo : undefined}
      />
    </motion.div>
  );
}
