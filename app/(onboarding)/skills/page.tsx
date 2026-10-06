"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button, ButtonSpinner } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Github, X, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import SkillIcon, { SkillIconMap } from "@/app/components/SkillIcon";

export default function SkillsPage() {
  const [skillInput, setSkillInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedSkillIcons, setSelectedSkillIcons] = useState<SkillIconMap>({});
  const [isSearching, setIsSearching] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [discoveredRepositoryCount, setDiscoveredRepositoryCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasEditedSkillsRef = useRef(false);

  const router = useRouter();

  useEffect(() => {
    let active = true;
    const discoverSkills = async () => {
      try {
        const response = await fetch("/api/github/skills", { credentials: "include" });
        const data = await response.json() as { skills?: string[]; repositoryCount?: number };
        if (!active || !response.ok || hasEditedSkillsRef.current) return;
        const skills = data.skills ?? [];
        setSelectedSkills(skills);
        setDiscoveredRepositoryCount(data.repositoryCount ?? 0);
        skills.forEach((skill) => void findSkillIcon(skill));
      } catch {
        // Repository discovery is optional; manual skill entry remains available.
      } finally {
        if (active) setIsDiscovering(false);
      }
    };
    void discoverSkills();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (skillInput.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const result = await fetch(`/api/skills?skill=${encodeURIComponent(skillInput)}`, { signal: controller.signal });
        setSuggestions(await result.json());
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Error fetching skills:", error);
        setSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [skillInput]);

  const findSkillIcon = async (skill: string) => {
    try {
      const response = await fetch(`/api/skill-icons?skill=${encodeURIComponent(skill)}`);
      if (!response.ok) return;
      const data = await response.json();
      const icon = data.icons?.[0];
      if (icon) setSelectedSkillIcons((current) => ({ ...current, [skill]: icon }));
    } catch {
      // Known skills still use the local fallback icon map.
    }
  };

  const addSkill = (skill: string, refocusInput = false) => {
    hasEditedSkillsRef.current = true;
    const formattedSkill = skill.charAt(0).toUpperCase() + skill.slice(1);
    if (!formattedSkill || selectedSkills.includes(formattedSkill)) return;
    setSelectedSkills([...selectedSkills, formattedSkill]);
    void findSkillIcon(formattedSkill);
    setSkillInput("");
    setSuggestions([]);
    if (refocusInput) inputRef.current?.focus();
  };

  const handleRemoveSkill = (skill: string) => {
    hasEditedSkillsRef.current = true;
    setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    setSelectedSkillIcons((current) => {
      const updated = { ...current };
      delete updated[skill];
      return updated;
    });
  };

  const handleContinue = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSaveFailed(false);

    try {
      const response = await fetch("/api/skillsToDB", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ skills: selectedSkills, iconMap: selectedSkillIcons }),
      });

      if (!response.ok) {
        setIsSubmitting(false);
        setSaveFailed(true);
        return;
      }

      router.push("/profile-picture");
    } catch (error) {
      console.error("Error saving skills:", error);
      setIsSubmitting(false);
      setSaveFailed(true);
    }
  };

  const canAddCustomSkill = Boolean(skillInput.trim()) && !suggestions.length && !isSearching;

  // Enter takes the first match, or the typed text when nothing matches.
  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (suggestions.length > 0) addSkill(suggestions[0], true);
    else if (canAddCustomSkill) addSkill(skillInput.trim(), true);
  };

  return (
    <main className="mx-auto grid w-full max-w-[1180px] flex-1 items-center gap-10 px-5 pb-20 pt-6 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-14">
      <div className="w-full max-w-[540px]">
        <h1 className="font-display text-[38px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[52px]">
          Which skills should it list?
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">
          Languages, frameworks and tools you work with. We start the list from your recent repositories.
        </p>

        <form onSubmit={handleSearchSubmit} className="mt-9">
          <Label htmlFor="skills">Add a skill</Label>
          <div className="relative mt-2">
            <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-ink-faint" />
            <Input
              ref={inputRef}
              id="skills"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              className="px-11"
              placeholder="Search skills, e.g. React or TypeScript"
              autoComplete="off"
            />
            {isSearching ? (
              <ButtonSpinner className="absolute right-4 top-1/2 -mt-2 text-ink-soft" />
            ) : (
              skillInput && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 active:scale-100"
                  onClick={() => setSkillInput("")}
                  aria-label="Clear search"
                >
                  <X />
                </Button>
              )
            )}
          </div>

          {suggestions.length > 0 && (
            <ul className="mt-2 max-h-[264px] overflow-y-auto rounded-[14px] border-[1.5px] border-line bg-raised p-1.5">
              {suggestions.map((skill, index) => (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => addSkill(skill, true)}
                    className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left text-[15px] transition-colors hover:bg-ink/[0.07]"
                  >
                    <SkillIcon skill={skill} />
                    <span className="flex-1">{skill}</span>
                    <Plus aria-hidden="true" className="size-4 text-ink-faint" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {canAddCustomSkill && (
            <Button variant="secondary" className="mt-3 max-w-full" onClick={() => addSkill(skillInput.trim())}>
              <Plus aria-hidden="true" />
              <span className="truncate">{`Add “${skillInput.trim()}” as a new skill`}</span>
            </Button>
          )}
        </form>

        {saveFailed && (
          <p role="alert" className="mt-6 text-[15px] font-medium text-danger">
            Your skills weren’t saved. Check your connection and try again.
          </p>
        )}

        <Button className="mt-9" disabled={selectedSkills.length === 0 || isSubmitting} onClick={handleContinue}>
          {isSubmitting ? (
            <>
              <ButtonSpinner />
              Saving…
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </div>

      <section aria-labelledby="your-skills" className="ui-sheet pf-sheet rounded-[28px] p-6 sm:p-8">
        <h2 id="your-skills" className="font-display text-2xl font-semibold tracking-[-0.02em]">
          Your skills
        </h2>

        {isDiscovering && (
          <div role="status" className="mt-5 flex items-center gap-3.5">
            <ButtonSpinner className="h-5 w-5 text-brand-text" />
            <div>
              <p className="text-[15px] font-semibold">Finding your strongest GitHub skills</p>
              <p className="text-sm text-ink-soft">Scanning the languages in your recent repositories…</p>
            </div>
          </div>
        )}

        {!isDiscovering && selectedSkills.length === 0 && (
          <p className="mt-5 rounded-[14px] border border-dashed border-line px-4 py-5 text-[15px] text-ink-soft">
            No skills added yet. Search for one to start the list.
          </p>
        )}

        {selectedSkills.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-2">
            {selectedSkills.map((skill) => (
              <li key={skill} className="ui-chip ob-written pr-1.5">
                <SkillIcon skill={skill} iconMap={selectedSkillIcons} />
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  aria-label={`Remove ${skill}`}
                  className="grid size-6 place-items-center rounded-full text-ink-faint transition-colors hover:bg-ink/10 hover:text-ink"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {!isDiscovering && discoveredRepositoryCount > 0 && selectedSkills.length > 0 && (
          <p className="mt-6 flex items-start gap-2.5 border-t border-sheet-line pt-5 text-sm leading-relaxed text-ink-soft">
            <Github aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            Suggested from {discoveredRepositoryCount} recent {discoveredRepositoryCount === 1 ? "repository" : "repositories"}. Remove or add anything before continuing.
          </p>
        )}
      </section>
    </main>
  );
}
