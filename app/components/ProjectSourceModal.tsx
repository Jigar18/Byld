"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { ArrowLeft, FilePenLine, Github, Lock, Search, X } from "lucide-react";
import { secondaryActionButtonClass } from "@/components/ui/button";

type Repository = {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  private: boolean;
  language: string | null;
  imported: boolean;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onManual: () => void;
  onImport: (repositoryId: number) => Promise<void>;
};

function GitHubLoader({ label }: { label: string }) {
  return (
    <div className="grid min-h-72 place-items-center text-center">
      <div>
        <div className="relative mx-auto h-24 w-24">
          <motion.div
            {...{ className: "absolute inset-0 rounded-full border border-white/10 border-t-white/70" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            {...{ className: "absolute inset-3 rounded-full border border-dashed border-white/20" }}
            animate={{ rotate: -360 }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
          />
          <motion.span
            {...{ className: "absolute inset-0 grid place-items-center" }}
            animate={{ y: [0, -4, 0], scale: [1, 1.06, 1] }}
            transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut" }}
          >
            <Github className="h-9 w-9 text-white" />
          </motion.span>
        </div>
        <p className="mt-6 text-lg font-medium text-white">Hang on</p>
        <p className="mt-2 text-sm text-zinc-500">{label}</p>
      </div>
    </div>
  );
}

export default function ProjectSourceModal({ isOpen, onClose, onManual, onImport }: Props) {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<"choice" | "repositories">("choice");
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);
  useEffect(() => {
    if (!isOpen) return;
    setView("choice");
    setRepositories([]);
    setQuery("");
    setLoading(false);
    setImporting(false);
    setError("");
  }, [isOpen]);

  const filteredRepositories = useMemo(() => {
    const value = query.trim().toLowerCase();
    return value
      ? repositories.filter((repo) => `${repo.name} ${repo.description ?? ""} ${repo.language ?? ""}`.toLowerCase().includes(value))
      : repositories;
  }, [query, repositories]);

  const openRepositories = async () => {
    setView("repositories");
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/repos", { credentials: "include" });
      const data = (await response.json()) as { repositories?: Repository[]; error?: string };
      if (!response.ok) throw new Error(data.error);
      setRepositories(data.repositories ?? []);
    } catch {
      setError("We could not load your GitHub repositories. Check the app installation and try again.");
    } finally {
      setLoading(false);
    }
  };

  const importRepository = async (repositoryId: number) => {
    setImporting(true);
    setError("");
    try {
      await onImport(repositoryId);
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "The project could not be imported.");
      setImporting(false);
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Choose how to add a project">
      <button className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={importing ? undefined : onClose} aria-label="Close project options" />
      <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-zinc-900 p-5 shadow-2xl sm:p-7">
        {!importing && <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-lg p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white" aria-label="Close"><X className="h-5 w-5" /></button>}
        {loading || importing ? (
          <GitHubLoader label={importing ? "Turning your repository into a portfolio project…" : "Bringing your repositories in from GitHub…"} />
        ) : view === "choice" ? (
          <>
            <div className="pr-10">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Add project</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">How would you like to start?</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">Bring in the facts from GitHub or tell the story yourself.</p>
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <button type="button" onClick={openRepositories} className="group rounded-2xl border border-white/10 bg-black/20 p-5 text-left transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.05]">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-white"><Github className="h-5 w-5" /></span>
                <h3 className="mt-5 font-medium text-white">Import from GitHub</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500">Choose a repository and we’ll create the project, links, and tech stack.</p>
              </button>
              <button type="button" onClick={onManual} className="group rounded-2xl border border-white/10 bg-black/20 p-5 text-left transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.05]">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-zinc-200"><FilePenLine className="h-5 w-5" /></span>
                <h3 className="mt-5 font-medium text-white">Enter details manually</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500">Use the existing project form for complete control over every detail.</p>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start gap-3 pr-10">
              <button type="button" onClick={() => setView("choice")} className="mt-0.5 rounded-lg p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white" aria-label="Back"><ArrowLeft className="h-4 w-4" /></button>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Import from GitHub</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Choose a repository</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">Only repositories shared with the installed GitHub App appear here.</p>
              </div>
            </div>
            <label className="relative mt-6 block">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search repositories" className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white/30" />
            </label>
            <div className="mt-4 max-h-[52vh] space-y-2 overflow-y-auto pr-1">
              {filteredRepositories.map((repo) => (
                <button key={repo.id} type="button" disabled={repo.imported} onClick={() => importRepository(repo.id)} className="flex w-full items-start justify-between gap-4 rounded-xl border border-white/10 bg-black/20 p-4 text-left transition hover:border-white/25 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-45">
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 font-medium text-zinc-100">{repo.name}{repo.private && <Lock className="h-3.5 w-3.5 text-zinc-500" />}</span>
                    <span className="mt-1 line-clamp-2 block text-xs leading-5 text-zinc-500">{repo.description || "No repository description yet."}</span>
                  </span>
                  <span className="shrink-0 text-xs text-zinc-500">{repo.imported ? "Imported" : repo.language || "Repository"}</span>
                </button>
              ))}
              {filteredRepositories.length === 0 && <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">No matching repositories found.</p>}
            </div>
          </>
        )}
        {error && <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200"><p>{error}</p>{view === "repositories" && repositories.length === 0 && <button type="button" onClick={openRepositories} className={`${secondaryActionButtonClass} mt-3`}>Try again</button>}</div>}
        {view === "repositories" && !loading && !importing && <div className="mt-5 flex justify-end border-t border-white/10 pt-5"><button type="button" onClick={onClose} className={secondaryActionButtonClass}>Cancel</button></div>}
      </div>
    </div>,
    document.body,
  );
}
