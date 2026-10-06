"use client";

import type { PortfolioProjectData } from "@/types/portfolio";
import { useEffect, useRef, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import ProjectVideoDropzone, { ProjectVideo } from "./ProjectVideoDropzone";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import ProjectImageUploader, { ProjectImage } from "./ProjectImageUploader";
import { removeUnsavedProjectMedia } from "./projectMedia";
import SkillIcon, { SkillIconMap } from "./SkillIcon";
import { Button, ButtonSpinner } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ProjectDraft = Omit<PortfolioProjectData, "id">;

interface ProjectEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: ProjectDraft) => Promise<void>;
  userSkills: string[];
  skillIcons?: SkillIconMap;
  project?: PortfolioProjectData | null;
}

const emptyDraft: ProjectDraft = { title: "", description: "", techStack: [], githubUrl: null, liveUrl: null, videoUrl: null, videoPublicId: null, videoDuration: null, videoBytes: null, videoFormat: null, images: [] };
const formatSkill = (skill: string) => {
  const trimmed = skill.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : "";
};

const optionalNoteClass = "font-normal text-ink-soft";
const suggestionChipClass =
  "ui-chip h-8 gap-1.5 border-dashed bg-transparent px-3 text-sm text-ink-soft transition-colors hover:border-ink-faint hover:text-ink";

export default function AddProjectModal({ isOpen, onClose, onSave, userSkills, skillIcons = {}, project }: ProjectEditorProps) {
  const [draft, setDraft] = useState<ProjectDraft>(emptyDraft);
  const [skillSearch, setSkillSearch] = useState("");
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [searchingSkills, setSearchingSkills] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmingVideoRemoval, setConfirmingVideoRemoval] = useState(false);
  const [removingVideo, setRemovingVideo] = useState(false);
  const unsavedVideoRef = useRef<string | null>(null);
  const unsavedImageIdsRef = useRef(new Set<string>());

  useEffect(() => {
    if (isOpen) {
      setDraft(project ? { title: project.title, description: project.description, techStack: project.techStack, githubUrl: project.githubUrl, liveUrl: project.liveUrl, videoUrl: project.videoUrl, videoPublicId: project.videoPublicId, videoDuration: project.videoDuration, videoBytes: project.videoBytes, videoFormat: project.videoFormat, images: project.images } : emptyDraft);
      unsavedVideoRef.current = null;
      unsavedImageIdsRef.current.clear();
      setSkillSearch("");
      setSkillSuggestions([]);
      setError("");
      setConfirmingVideoRemoval(false);
    }
  }, [isOpen, project]);

  useEffect(() => {
    const query = skillSearch.trim();
    if (query.length < 2) {
      setSkillSuggestions([]);
      setSearchingSkills(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearchingSkills(true);
      try {
        const response = await fetch(`/api/skills?skill=${encodeURIComponent(query)}`, { signal: controller.signal });
        setSkillSuggestions(response.ok ? await response.json() as string[] : []);
      } catch (error) {
        if ((error as Error).name !== "AbortError") setSkillSuggestions([]);
      } finally {
        setSearchingSkills(false);
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [skillSearch]);

  const addSkill = (skill: string) => {
    const formattedSkill = formatSkill(skill);
    if (!formattedSkill) return;
    setDraft((current) => current.techStack.some((item) => item.toLowerCase() === formattedSkill.toLowerCase())
      ? current
      : { ...current, techStack: [...current.techStack, formattedSkill] });
    setSkillSearch("");
    setSkillSuggestions([]);
  };
  const normalizedSkillSearch = skillSearch.trim().toLowerCase();
  const availableSkills = [...userSkills, ...skillSuggestions]
    .filter((skill, index, all) => all.findIndex((item) => item.toLowerCase() === skill.toLowerCase()) === index)
    .filter((skill) => !draft.techStack.some((item) => item.toLowerCase() === skill.toLowerCase()))
    .filter((skill) => !normalizedSkillSearch || skill.toLowerCase().includes(normalizedSkillSearch));
  const canAddCustomSkill = skillSearch.trim().length >= 2 && ![...draft.techStack, ...availableSkills]
    .some((skill) => skill.toLowerCase() === normalizedSkillSearch);

  const currentVideo = draft.videoUrl && draft.videoPublicId && draft.videoDuration && draft.videoBytes && draft.videoFormat ? {
    videoUrl: draft.videoUrl,
    videoPublicId: draft.videoPublicId,
    videoDuration: draft.videoDuration,
    videoBytes: draft.videoBytes,
    videoFormat: draft.videoFormat,
  } : null;

  const setVideo = async (video: ProjectVideo) => {
    if (unsavedVideoRef.current) await removeUnsavedProjectMedia("video", unsavedVideoRef.current);
    unsavedVideoRef.current = video.videoPublicId;
    setDraft((current) => ({ ...current, ...video }));
  };

  const removeVideo = async () => {
    if (unsavedVideoRef.current) await removeUnsavedProjectMedia("video", unsavedVideoRef.current);
    unsavedVideoRef.current = null;
    setDraft((current) => ({ ...current, videoUrl: null, videoPublicId: null, videoDuration: null, videoBytes: null, videoFormat: null }));
  };

  const confirmVideoRemoval = async () => {
    setRemovingVideo(true);
    try {
      await removeVideo();
      setConfirmingVideoRemoval(false);
    } catch {
      setError("The project demo could not be removed. Please try again.");
    } finally {
      setRemovingVideo(false);
    }
  };

  const addImage = (image: ProjectImage) => {
    unsavedImageIdsRef.current.add(image.imagePublicId);
    setDraft((current) => ({ ...current, images: [...current.images.filter((item) => item.position !== image.position), image].sort((left, right) => left.position - right.position) }));
  };

  const removeImage = async (image: ProjectImage) => {
    if (unsavedImageIdsRef.current.has(image.imagePublicId)) {
      await removeUnsavedProjectMedia("image", image.imagePublicId);
      unsavedImageIdsRef.current.delete(image.imagePublicId);
    }
    setDraft((current) => ({ ...current, images: current.images.filter((item) => item.imagePublicId !== image.imagePublicId) }));
  };

  const close = () => {
    if (unsavedVideoRef.current) void removeUnsavedProjectMedia("video", unsavedVideoRef.current);
    unsavedVideoRef.current = null;
    for (const publicId of unsavedImageIdsRef.current) void removeUnsavedProjectMedia("image", publicId);
    unsavedImageIdsRef.current.clear();
    onClose();
  };

  const submit = async () => {
    if (!draft.title.trim() || !draft.description.trim()) {
      setError("Add a clear title and a short description before saving.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({ ...draft, title: draft.title.trim(), description: draft.description.trim(), githubUrl: draft.githubUrl?.trim() || null, liveUrl: draft.liveUrl?.trim() || null });
      unsavedVideoRef.current = null;
      unsavedImageIdsRef.current.clear();
      onClose();
    } catch {
      setError("The project could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const editing = Boolean(project);

  return (
    <Dialog
      open={isOpen}
      onClose={close}
      title={editing ? "Edit project" : "Add project"}
      description="Keep it focused: the problem, the work, and the links that let people explore it."
      size="lg"
      busy={saving}
      onSubmit={submit}
      footer={
        <>
          {/* In the footer rather than the form, so it is in view whichever part of the form is scrolled to. */}
          {error && (
            <p role="alert" className="basis-full text-[15px] font-medium text-danger">
              {error}
            </p>
          )}
          <Button variant="ghost" onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <ButtonSpinner />
                Saving…
              </>
            ) : editing ? (
              "Save changes"
            ) : (
              "Add project"
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div>
          <Label htmlFor="project-title">Project title</Label>
          <Input
            id="project-title"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="e.g. Customer insights dashboard"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="project-description">What did you make?</Label>
          <Textarea
            id="project-description"
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            placeholder="Describe the outcome, your contribution, and why it mattered."
            rows={4}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="project-skill-search">
            Tools and skills <span className={optionalNoteClass}>(optional)</span>
          </Label>
          {draft.techStack.length === 0 ? (
            <p className="mt-2 text-[15px] text-ink-soft">Search for or select the skills used in this work.</p>
          ) : (
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {draft.techStack.map((skill) => (
                <li key={skill}>
                  <button
                    type="button"
                    onClick={() => setDraft({ ...draft, techStack: draft.techStack.filter((item) => item !== skill) })}
                    aria-label={`Remove ${skill}`}
                    className="ui-chip h-8 gap-1.5 pl-3 pr-2 text-sm transition-colors hover:border-ink-faint"
                  >
                    <SkillIcon skill={skill} iconMap={skillIcons} />
                    {skill}
                    <X aria-hidden="true" className="size-3.5 text-ink-soft" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="relative mt-3">
            <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
            <Input
              id="project-skill-search"
              value={skillSearch}
              onChange={(event) => setSkillSearch(event.target.value)}
              onKeyDown={(event) => {
                // Enter adds a skill here; it must never save the whole project.
                if (event.key !== "Enter") return;
                event.preventDefault();
                if (canAddCustomSkill) addSkill(skillSearch);
                else if (availableSkills[0]) addSkill(availableSkills[0]);
              }}
              placeholder="Search or add a skill"
              autoComplete="off"
              className="px-11"
            />
            {searchingSkills && <ButtonSpinner className="absolute right-4 top-1/2 -mt-2 text-ink-soft" />}
          </div>
          {(availableSkills.length > 0 || canAddCustomSkill) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {canAddCustomSkill && (
                <button type="button" onClick={() => addSkill(skillSearch)} className={`${suggestionChipClass} text-ink`}>
                  <Plus aria-hidden="true" className="size-3.5" />
                  Add “{formatSkill(skillSearch)}”
                </button>
              )}
              {availableSkills.slice(0, 12).map((skill) => (
                <button type="button" key={skill} onClick={() => addSkill(skill)} className={suggestionChipClass}>
                  <Plus aria-hidden="true" className="size-3.5" />
                  <SkillIcon skill={skill} iconMap={skillIcons} />
                  {skill}
                </button>
              ))}
            </div>
          )}
          <p className="mt-3 text-sm text-ink-soft">New skills selected here will also be added to your Skills section.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 sm:gap-4">
          <div>
            <Label htmlFor="project-github">
              Repository <span className={optionalNoteClass}>(optional)</span>
            </Label>
            <Input
              id="project-github"
              type="url"
              value={draft.githubUrl || ""}
              onChange={(e) => setDraft({ ...draft, githubUrl: e.target.value })}
              placeholder="https://github.com/..."
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="project-live">
              Live site <span className={optionalNoteClass}>(optional)</span>
            </Label>
            <Input
              id="project-live"
              type="url"
              value={draft.liveUrl || ""}
              onChange={(e) => setDraft({ ...draft, liveUrl: e.target.value })}
              placeholder="https://..."
              className="mt-2"
            />
          </div>
        </div>

        <div>
          <p className="mb-2.5 text-[15px] font-semibold">
            Demo video <span className={optionalNoteClass}>(optional)</span>
          </p>
          <ProjectVideoDropzone video={currentVideo} onUploaded={setVideo} onRemove={() => setConfirmingVideoRemoval(true)} disabled={saving} />
        </div>

        <div>
          <p className="mb-2.5 text-[15px] font-semibold">
            Screenshots <span className={optionalNoteClass}>(optional)</span>
          </p>
          <ProjectImageUploader images={draft.images} onUploaded={addImage} onReorder={(images) => setDraft((current) => ({ ...current, images }))} onRemove={removeImage} disabled={saving} />
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={confirmingVideoRemoval}
        title="Delete demo video"
        message="Are you sure you want to remove this project demo video?"
        note="The video will be permanently removed when the project changes are saved."
        confirmLabel="Delete video"
        busyLabel="Removing…"
        isBusy={removingVideo}
        onClose={() => setConfirmingVideoRemoval(false)}
        onConfirm={confirmVideoRemoval}
      />
    </Dialog>
  );
}
