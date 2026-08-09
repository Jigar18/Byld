"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, Github, Plus, Save, X } from "lucide-react";
import ProjectVideoDropzone, { ProjectVideo, removeUnsavedProjectVideo } from "./ProjectVideoDropzone";
import DeleteProjectVideoModal from "./DeleteProjectVideoModal";
import ProjectImageUploader, { ProjectImage, removeUnsavedProjectImage } from "./ProjectImageUploader";
import SkillIcon, { SkillIconMap } from "./SkillIcon";
import { primaryActionButtonClass, secondaryActionButtonClass } from "@/components/ui/button";

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  videoUrl: string | null;
  videoPublicId: string | null;
  videoDuration: number | null;
  videoBytes: number | null;
  videoFormat: string | null;
  images: ProjectImage[];
}

type ProjectDraft = Omit<PortfolioProject, "id">;

interface ProjectEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: ProjectDraft) => Promise<void>;
  userSkills: string[];
  skillIcons?: SkillIconMap;
  project?: PortfolioProject | null;
}

const emptyDraft: ProjectDraft = { title: "", description: "", techStack: [], githubUrl: null, liveUrl: null, videoUrl: null, videoPublicId: null, videoDuration: null, videoBytes: null, videoFormat: null, images: [] };

export default function AddProjectModal({ isOpen, onClose, onSave, userSkills, skillIcons = {}, project }: ProjectEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [draft, setDraft] = useState<ProjectDraft>(emptyDraft);
  const [skillSearch, setSkillSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmingVideoRemoval, setConfirmingVideoRemoval] = useState(false);
  const [removingVideo, setRemovingVideo] = useState(false);
  const unsavedVideoRef = useRef<string | null>(null);
  const unsavedImageIdsRef = useRef(new Set<string>());

  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);
  useEffect(() => {
    if (isOpen) {
      setDraft(project ? { title: project.title, description: project.description, techStack: project.techStack, githubUrl: project.githubUrl, liveUrl: project.liveUrl, videoUrl: project.videoUrl, videoPublicId: project.videoPublicId, videoDuration: project.videoDuration, videoBytes: project.videoBytes, videoFormat: project.videoFormat, images: project.images || [] } : emptyDraft);
      unsavedVideoRef.current = null;
      unsavedImageIdsRef.current.clear();
      setSkillSearch("");
      setError("");
      setConfirmingVideoRemoval(false);
    }
  }, [isOpen, project]);

  const addSkill = (skill: string) => setDraft((current) => current.techStack.includes(skill) ? current : { ...current, techStack: [...current.techStack, skill] });
  const availableSkills = userSkills.filter((skill) => !draft.techStack.includes(skill) && skill.toLowerCase().includes(skillSearch.toLowerCase()));

  const currentVideo = draft.videoUrl && draft.videoPublicId && draft.videoDuration && draft.videoBytes && draft.videoFormat ? {
    videoUrl: draft.videoUrl,
    videoPublicId: draft.videoPublicId,
    videoDuration: draft.videoDuration,
    videoBytes: draft.videoBytes,
    videoFormat: draft.videoFormat,
  } : null;

  const setVideo = async (video: ProjectVideo) => {
    if (unsavedVideoRef.current) await removeUnsavedProjectVideo(unsavedVideoRef.current);
    unsavedVideoRef.current = video.videoPublicId;
    setDraft((current) => ({ ...current, ...video }));
  };

  const removeVideo = async () => {
    if (unsavedVideoRef.current) await removeUnsavedProjectVideo(unsavedVideoRef.current);
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
      await removeUnsavedProjectImage(image.imagePublicId);
      unsavedImageIdsRef.current.delete(image.imagePublicId);
    }
    setDraft((current) => ({ ...current, images: current.images.filter((item) => item.imagePublicId !== image.imagePublicId) }));
  };

  const cleanUpUnsavedImages = () => {
    for (const publicId of unsavedImageIdsRef.current) void removeUnsavedProjectImage(publicId);
    unsavedImageIdsRef.current.clear();
  };

  const close = () => {
    if (unsavedVideoRef.current) void removeUnsavedProjectVideo(unsavedVideoRef.current);
    unsavedVideoRef.current = null;
    cleanUpUnsavedImages();
    onClose();
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
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

  if (!mounted || !isOpen) return null;
  const editing = Boolean(project);

  return createPortal(
    <div className="fixed inset-0 z-[100] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={editing ? "Edit project" : "Add project"}>
      <button className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} aria-label="Close project editor" />
      <form onSubmit={submit} className="relative max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-zinc-900 p-5 shadow-2xl sm:p-7">
        <button type="button" onClick={close} className="absolute right-4 top-4 rounded-lg p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button>
        <div className="pr-10">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Portfolio project</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{editing ? "Refine this project" : "Add a project"}</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">Keep it focused: the problem, the work, and the links that let people explore it.</p>
        </div>
        <div className="mt-7 space-y-5">
          <label className="block text-sm font-medium text-zinc-200">Project title<span className="ml-1 text-zinc-500">*</span><input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Customer insights dashboard" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-white/35 focus:ring-2 focus:ring-white/10" /></label>
          <label className="block text-sm font-medium text-zinc-200">What did you make?<span className="ml-1 text-zinc-500">*</span><textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Describe the outcome, your contribution, and why it mattered." rows={4} className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-white/35 focus:ring-2 focus:ring-white/10" /></label>
          <div><p className="text-sm font-medium text-zinc-200">Tools and skills <span className="font-normal text-zinc-500">(optional)</span></p><div className="mt-2 flex min-h-12 flex-wrap gap-2 rounded-xl border border-white/10 bg-black/20 p-2">{draft.techStack.map((skill) => <button key={skill} type="button" onClick={() => setDraft({ ...draft, techStack: draft.techStack.filter((item) => item !== skill) })} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-sm text-zinc-200 transition hover:bg-white/[0.14]"><SkillIcon skill={skill} iconMap={skillIcons} />{skill}<X className="h-3.5 w-3.5" /></button>)}{draft.techStack.length === 0 && <span className="px-2 py-1 text-sm text-zinc-600">Select the skills used in this work.</span>}</div>{userSkills.length > 0 && <><input value={skillSearch} onChange={(e) => setSkillSearch(e.target.value)} placeholder="Filter your skills" className="mt-3 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-white/30" /><div className="mt-2 flex flex-wrap gap-2">{availableSkills.slice(0, 12).map((skill) => <button type="button" key={skill} onClick={() => addSkill(skill)} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-sm text-zinc-400 transition hover:border-white/30 hover:bg-white/[0.06] hover:text-white"><Plus className="h-3 w-3" /><SkillIcon skill={skill} iconMap={skillIcons} />{skill}</button>)}</div></>}</div>
          <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-zinc-200"><span className="inline-flex items-center gap-1"><Github className="h-4 w-4" />Repository</span><input type="url" value={draft.githubUrl || ""} onChange={(e) => setDraft({ ...draft, githubUrl: e.target.value })} placeholder="https://github.com/..." className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-white/35" /></label><label className="block text-sm font-medium text-zinc-200"><span className="inline-flex items-center gap-1"><ExternalLink className="h-4 w-4" />Live site</span><input type="url" value={draft.liveUrl || ""} onChange={(e) => setDraft({ ...draft, liveUrl: e.target.value })} placeholder="https://..." className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-white/35" /></label></div>
          <div><p className="mb-2 text-sm font-medium text-zinc-200">Project demo <span className="font-normal text-zinc-500">(optional)</span></p><ProjectVideoDropzone video={currentVideo} onUploaded={setVideo} onRemove={() => setConfirmingVideoRemoval(true)} disabled={saving} /></div>
          <div><p className="mb-2 text-sm font-medium text-zinc-200">Add images <span className="font-normal text-zinc-500">(optional)</span></p><ProjectImageUploader images={draft.images} onUploaded={addImage} onReorder={(images) => setDraft((current) => ({ ...current, images }))} onRemove={removeImage} disabled={saving} /></div>
        </div>
        {error && <p className="mt-4 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">{error}</p>}
        <div className="mt-7 flex justify-end gap-3 border-t border-white/10 pt-5"><button type="button" onClick={close} className={secondaryActionButtonClass}>Cancel</button><button disabled={saving} className={primaryActionButtonClass}>{editing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{saving ? "Saving…" : editing ? "Save changes" : "Add project"}</button></div>
      </form>
      <DeleteProjectVideoModal isOpen={confirmingVideoRemoval} isDeleting={removingVideo} onClose={() => setConfirmingVideoRemoval(false)} onConfirm={confirmVideoRemoval} />
    </div>, document.body
  );
}
