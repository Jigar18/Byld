"use client";

import { useEffect, useMemo, useState } from "react";
import { Info, Plus } from "lucide-react";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import AddProjectModal from "../components/AddProjectModal";
import type { PortfolioProjectData } from "@/types/portfolio";
import PortfolioSection from "../components/PortfolioSection";
import ProjectModal from "../components/ProjectModal";
import ProjectSourceModal from "../components/ProjectSourceModal";
import ProjectStack from "../components/ProjectStack";
import type { ProjectVideo } from "../components/ProjectVideoDropzone";
import type { ProjectImage } from "../components/ProjectImageUploader";
import { removeUnsavedProjectMedia } from "../components/projectMedia";
import { useUser } from "../context/UserContext";
import { getSkillIcon, SkillIconMap } from "../components/SkillIcon";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

export default function Projects() {
  const { isOwner, portfolioData, skills, setSkills, skillIcons: savedSkillIcons } = useUser();
  const [projects, setProjects] = useState<PortfolioProjectData[]>(portfolioData.projects);
  // Looked-up logos for project skills without a saved icon; saved choices always win.
  const [foundIcons, setFoundIcons] = useState<SkillIconMap>({});
  const skillIcons = useMemo(() => ({ ...foundIcons, ...savedSkillIcons }), [foundIcons, savedSkillIcons]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProjectData | null>(
    null,
  );
  const [projectToDelete, setProjectToDelete] =
    useState<PortfolioProjectData | null>(null);
  const [deletingProject, setDeletingProject] = useState(false);
  const [deleteFailed, setDeleteFailed] = useState(false);
  const [selectedProject, setSelectedProject] = useState<PortfolioProjectData | null>(
    null,
  );
  const [frontProjectId, setFrontProjectId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void findMissingSkillIcons(
      portfolioData.projects.map((project) => project.techStack),
      portfolioData.iconMap,
    ).then((icons) => {
      if (active) setFoundIcons((current) => ({ ...current, ...icons }));
    });
    return () => { active = false; };
  }, [portfolioData.iconMap, portfolioData.projects]);

  const saveProject = async (draft: Omit<PortfolioProjectData, "id">) => {
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
    const data = await response.json() as { project: PortfolioProjectData; skills?: string[] };
    setProjects((current) =>
      editingProject
        ? current.map((project) =>
            project.id === editingProject.id ? data.project : project,
          )
        : [data.project, ...current],
    );
    if (!editingProject) setFrontProjectId(data.project.id);
    if (data.skills) setSkills(data.skills);
    const addedIcons = await findMissingSkillIcons([data.project.techStack], skillIcons);
    setFoundIcons((current) => ({ ...current, ...addedIcons }));
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
      await removeUnsavedProjectMedia("video", video.videoPublicId);
      throw new Error(
        "The demo was uploaded but could not be saved to the project",
      );
    }

    const data = await response.json();
    setProjects((current) =>
      current.map((item) => (item.id === projectId ? data.project : item)),
    );
    setSelectedProject(data.project);
  };

  const deleteProject = async () => {
    if (!projectToDelete) return;
    setDeletingProject(true);
    setDeleteFailed(false);
    try {
      const response = await fetch(`/api/projects?id=${projectToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok)
        setProjects((current) =>
          current.filter((project) => project.id !== projectToDelete.id),
        );
      else setDeleteFailed(true);
    } catch (error) {
      console.error("Error deleting project:", error);
      setDeleteFailed(true);
    } finally {
      setDeletingProject(false);
      setProjectToDelete(null);
    }
  };

  const openEditor = (project: PortfolioProjectData | null = null) => {
    if (!project && projects.length >= MAX_PROJECTS) return;
    setEditingProject(project);
    if (project) setEditorOpen(true);
    else setSourceOpen(true);
  };

  const saveProjectImages = async (projectId: string, images: ProjectImage[]) => {
    const project = projects.find((item) => item.id === projectId);
    if (!project) throw new Error("Project not found");
    const addedImages = images.filter((image) => !project.images.some((current) => current.imagePublicId === image.imagePublicId));

    const response = await fetch("/api/projects", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...project, images, id: projectId }),
    });
    if (!response.ok) {
      await Promise.all(addedImages.map((image) => removeUnsavedProjectMedia("image", image.imagePublicId)));
      throw new Error("The images were uploaded but could not be saved to the project");
    }

    const data = await response.json();
    setProjects((current) => current.map((item) => item.id === projectId ? data.project : item));
    setSelectedProject(data.project);
  };

  const importProject = async (repositoryId: number) => {
    const response = await fetch("/api/projects/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ repositoryId }),
    });
    const data = (await response.json()) as { project?: PortfolioProjectData; skills?: string[]; error?: string };
    if (!response.ok || !data.project) throw new Error(data.error || "Unable to import project");
    setProjects((current) => [data.project!, ...current]);
    setFrontProjectId(data.project.id);
    if (data.skills) setSkills(data.skills);
    const importedIcons = await findMissingSkillIcons(
      [data.project.techStack],
      skillIcons,
    );
    setFoundIcons((current) => ({ ...current, ...importedIcons }));
    setSourceOpen(false);
    setSelectedProject(data.project);
  };

  const projectLimitReached = projects.length >= MAX_PROJECTS;

  return (
    <PortfolioSection
      id="projects"
      title="Projects"
      action={
        isOwner &&
        projects.length > 0 && (
          <div className="flex items-center gap-1.5">
            {projectLimitReached && (
              <TooltipProvider delay={200}>
                <Tooltip>
                  <TooltipTrigger
                    className="grid size-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-ink/[0.07] hover:text-ink"
                    aria-label="Project upload limit"
                  >
                    <Info className="size-4" />
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={8}>
                    A maximum of four projects can be uploaded.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Button variant="secondary" size="sm" onClick={() => openEditor()} disabled={projectLimitReached}>
              <Plus aria-hidden="true" />
              Add project
            </Button>
          </div>
        )
      }
    >
      {deleteFailed && (
        <p role="alert" className="mb-5 text-[15px] font-medium text-danger">
          The project wasn’t deleted. Check your connection and try again.
        </p>
      )}

      {projects.length === 0 ? (
        <div className="rounded-[22px] bg-well px-6 py-12 text-center sm:py-16">
          <h3 className="font-display text-[22px] font-semibold tracking-[-0.015em]">No projects yet</h3>
          <p className="mx-auto mt-2 max-w-[44ch] text-ink-soft">
            {isOwner
              ? "Start with the one that best shows what you can do. You can add up to four."
              : "Projects will show up here once they are added."}
          </p>
          {isOwner && (
            <Button className="mt-6" onClick={() => openEditor()}>
              <Plus aria-hidden="true" />
              Add your first project
            </Button>
          )}
        </div>
      ) : (
        <ProjectStack
          projects={projects}
          frontId={frontProjectId}
          onFrontChange={setFrontProjectId}
          skillIcons={skillIcons}
          onOpenProject={setSelectedProject}
          onEditProject={isOwner ? openEditor : undefined}
          onDeleteProject={isOwner ? setProjectToDelete : undefined}
        />
      )}
      {isOwner && (
        <ConfirmDeleteModal
          isOpen={Boolean(projectToDelete)}
          title="Delete project"
          subject={projectToDelete?.title}
          note="This action cannot be undone."
          isBusy={deletingProject}
          onClose={() => setProjectToDelete(null)}
          onConfirm={deleteProject}
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
          // The edited project stays set while the sheet closes; every way of opening the editor sets it again.
          onClose={() => setEditorOpen(false)}
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
        projects={projects}
        skillIcons={skillIcons}
        isOwner={isOwner}
        onVideoUploaded={isOwner ? saveProjectVideo : undefined}
        onImagesChanged={isOwner ? saveProjectImages : undefined}
      />
    </PortfolioSection>
  );
}
