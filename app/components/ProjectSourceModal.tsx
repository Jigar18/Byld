"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, FilePenLine, Github, Lock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import SheetStack from "./SheetStack";

type Repository = {
  id: number;
  name: string;
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

const sourceOptionClass =
  "flex items-start gap-4 rounded-[20px] border border-line p-5 text-left transition-colors hover:border-ink-faint hover:bg-raised sm:flex-col sm:gap-5";
const sourceIconClass = "grid size-11 shrink-0 place-items-center rounded-full border border-line [&_svg]:size-5";

export default function ProjectSourceModal({ isOpen, onClose, onManual, onImport }: Props) {
  const [view, setView] = useState<"choice" | "repositories">("choice");
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");

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
    // Going back and forth between the views reuses the list already loaded.
    if (repositories.length) return;
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

  const waiting = loading || importing;
  const repositoriesFailedToLoad = view === "repositories" && repositories.length === 0 && Boolean(error);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={view === "choice" ? "Add a project" : "Choose a repository"}
      description={
        view === "choice"
          ? "Import the facts from GitHub, or write them yourself."
          : "Only repositories shared with the installed GitHub App appear here."
      }
      size="md"
      busy={importing}
      footer={
        view === "repositories" &&
        !waiting && (
          <>
            <Button variant="ghost" onClick={() => setView("choice")} className="mr-auto">
              <ArrowLeft aria-hidden="true" />
              Back
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </>
        )
      }
    >
      {waiting ? (
        <div role="status" className="grid min-h-72 place-items-center text-center">
          <div>
            <SheetStack motion="loop" className="mx-auto [--stack-scale:0.5]" />
            <p className="mt-5 font-display text-xl font-semibold">Hang on</p>
            <p className="mt-1.5 text-[15px] text-ink-soft">
              {importing ? "Turning your repository into a portfolio project…" : "Bringing your repositories in from GitHub…"}
            </p>
          </div>
        </div>
      ) : view === "choice" ? (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <button type="button" onClick={openRepositories} className={sourceOptionClass}>
            <span className={sourceIconClass}>
              <Github aria-hidden="true" />
            </span>
            <span>
              <span className="block font-display text-lg font-semibold">Import from GitHub</span>
              <span className="mt-1.5 block text-[15px] leading-relaxed text-ink-soft">
                Choose a repository and we’ll create the project, links, and tech stack.
              </span>
            </span>
          </button>
          <button type="button" onClick={onManual} className={sourceOptionClass}>
            <span className={sourceIconClass}>
              <FilePenLine aria-hidden="true" />
            </span>
            <span>
              <span className="block font-display text-lg font-semibold">Enter details manually</span>
              <span className="mt-1.5 block text-[15px] leading-relaxed text-ink-soft">
                Fill in the title, description, skills and links yourself.
              </span>
            </span>
          </button>
        </div>
      ) : repositoriesFailedToLoad ? null : (
        <>
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search repositories"
              aria-label="Search repositories"
              className="pl-11"
            />
          </div>
          {filteredRepositories.length === 0 ? (
            <p className="mt-4 rounded-2xl border-[1.5px] border-dashed border-line px-5 py-10 text-center text-ink-soft">
              No matching repositories found.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {filteredRepositories.map((repo) => (
                <li key={repo.id}>
                  <button
                    type="button"
                    disabled={repo.imported}
                    onClick={() => importRepository(repo.id)}
                    className="-mx-3 flex w-[calc(100%+1.5rem)] items-start justify-between gap-4 rounded-xl px-3 py-3.5 text-left transition-colors hover:bg-raised disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 font-semibold [overflow-wrap:anywhere]">
                        {repo.name}
                        {repo.private && (
                          <>
                            <Lock aria-hidden="true" className="size-3.5 shrink-0 text-ink-soft" />
                            <span className="sr-only">Private</span>
                          </>
                        )}
                      </span>
                      <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-ink-soft">
                        {repo.description || "No repository description yet."}
                      </span>
                    </span>
                    <span className="shrink-0 pt-0.5 text-sm text-ink-soft">
                      {repo.imported ? "Imported" : repo.language || "Repository"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {error && !waiting && (
        <div role="alert" className={repositoriesFailedToLoad ? "py-6" : "mt-5"}>
          <p className="text-[15px] font-medium text-danger">{error}</p>
          {repositoriesFailedToLoad && (
            <Button variant="secondary" size="sm" onClick={openRepositories} className="mt-4">
              Try again
            </Button>
          )}
        </div>
      )}
    </Dialog>
  );
}
