"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Edit3, Pencil, Search, Sparkles } from "lucide-react";
import { Icon } from "@iconify/react";
import CredentialCardHeader, { credentialEditButtonClass } from "./CredentialCardHeader";
import { useUser } from "../context/UserContext";
import SkillIcon, { SkillIconMap } from "./SkillIcon";
import { primaryActionButtonClass, secondaryActionButtonClass } from "@/components/ui/button";

interface UserSkills {
  skills: string[];
  iconMap?: SkillIconMap;
}

const capitalizeFirst = (skill: string) => skill ? skill.charAt(0).toUpperCase() + skill.slice(1) : skill;

export default function Skills() {
  const { isOwner, portfolioApiUrl, portfolioData } = useUser();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [tempSkills, setTempSkills] = useState<string[]>([]);
  const [skillIcons, setSkillIcons] = useState<SkillIconMap>(portfolioData.iconMap);
  const [tempSkillIcons, setTempSkillIcons] = useState<SkillIconMap>({});
  const [iconPickerSkill, setIconPickerSkill] = useState<string | null>(null);
  const [iconChoices, setIconChoices] = useState<string[]>([]);
  const [isSearchingIcons, setIsSearchingIcons] = useState(false);
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>(
    portfolioData.skills.map(capitalizeFirst),
  );
  const [saving, setSaving] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const skillsViewportRef = useRef<HTMLDivElement>(null);
  const [hiddenSkillCount, setHiddenSkillCount] = useState(0);
  const [skillsAtTop, setSkillsAtTop] = useState(true);

  const measureHiddenSkills = useCallback(() => {
    const viewport = skillsViewportRef.current;
    if (!viewport) return;

    if (viewport.scrollHeight <= viewport.clientHeight + 1) {
      setHiddenSkillCount(0);
      return;
    }

    const viewportBottom = viewport.getBoundingClientRect().bottom;
    const hidden = Array.from(
      viewport.querySelectorAll<HTMLElement>("[data-skill]")
    ).filter((item) => item.getBoundingClientRect().bottom > viewportBottom + 1);
    setHiddenSkillCount(hidden.length);
  }, []);

  const fetchUserSkills = useCallback(async () => {
    try {
      const response = await fetch(portfolioApiUrl("/api/getUserSkills"));
      if (response.ok) {
        const data: UserSkills = await response.json();
        setSkills((data.skills || []).map(capitalizeFirst));
        setSkillIcons(data.iconMap || {});
      }
    } catch (error) {
      console.error("Error fetching user skills:", error);
    } finally {
      setLoading(false);
    }
  }, [portfolioApiUrl]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const refreshSkills = () => void fetchUserSkills();
    window.addEventListener("portfolio:skills-updated", refreshSkills);
    return () => window.removeEventListener("portfolio:skills-updated", refreshSkills);
  }, [fetchUserSkills]);

  useEffect(() => {
    const viewport = skillsViewportRef.current;
    if (!viewport) return;

    const frame = requestAnimationFrame(measureHiddenSkills);
    const settledMeasurement = window.setTimeout(measureHiddenSkills, 400);
    const observer = new ResizeObserver(measureHiddenSkills);
    observer.observe(viewport);
    viewport
      .querySelectorAll<HTMLElement>("[data-skill]")
      .forEach((item) => observer.observe(item));
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settledMeasurement);
      observer.disconnect();
    };
  }, [skills, measureHiddenSkills]);

  useEffect(() => {
    if (skillInput.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setShowSuggestions(true);
    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const result = await fetch(`/api/skills?skill=${skillInput}`);
        const data = await result.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Error fetching skills:", error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [skillInput]);

  const handleEditClick = () => {
    setTempSkills([...skills]);
    setTempSkillIcons({ ...skillIcons });
    setIconPickerSkill(null);
    setIconChoices([]);
    setIsEditModalOpen(true);
  };

  const loadIconChoices = async (skill: string, autoSelect: boolean) => {
    setIconPickerSkill(skill);
    setIconChoices([]);
    setIsSearchingIcons(true);

    try {
      const response = await fetch(
        `/api/skill-icons?skill=${encodeURIComponent(skill)}`
      );
      const data = (await response.json()) as { icons?: string[] };
      const icons = data.icons || [];
      setIconChoices(icons);
      if (autoSelect && icons[0]) {
        setTempSkillIcons((current) =>
          current[skill] === undefined ? { ...current, [skill]: icons[0] } : current
        );
      }
    } catch (error) {
      console.error("Error fetching skill icons:", error);
      setIconChoices([]);
    } finally {
      setIsSearchingIcons(false);
    }
  };

  const addSkill = (skill: string) => {
    const formattedSkill = capitalizeFirst(skill);
    if (!tempSkills.includes(formattedSkill)) {
      setTempSkills([...tempSkills, formattedSkill]);
      setSkillInput("");
      setSuggestions([]);
      setShowSuggestions(false);
      void loadIconChoices(formattedSkill, true);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setTempSkills(tempSkills.filter((skill) => skill !== skillToRemove));
    setTempSkillIcons((current) => {
      const updated = { ...current };
      delete updated[skillToRemove];
      return updated;
    });
    if (iconPickerSkill === skillToRemove) {
      setIconPickerSkill(null);
      setIconChoices([]);
    }
  };

  const handleSaveSkills = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/skillsToDB", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: tempSkills, iconMap: tempSkillIcons }),
      });

      if (response.ok) {
        setSkills([...tempSkills]);
        setSkillIcons({ ...tempSkillIcons });
        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error("Error saving skills:", error);
    } finally {
      setSaving(false);
    }
  };

  const skillVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  };

  if (loading) {
    return (
      <motion.div
        {...{
          className:
            "profile-card profile-surface-neutral profile-card-lift h-[336px] rounded-xl border p-5 shadow-md",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
      >
        <CredentialCardHeader title="Skills" icon={<Sparkles className="h-5 w-5" />} />
        <div className="animate-pulse space-y-2 pt-5">
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-6 rounded-full bg-white/[0.055] w-16"></div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        {...{
          className:
            "profile-card profile-surface-neutral profile-card-lift group flex h-[336px] flex-col rounded-xl border p-5 shadow-md",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
      >
        <CredentialCardHeader
          title="Skills"
          icon={<Sparkles className="h-5 w-5" />}
          action={isOwner ?
          <button
            onClick={handleEditClick}
            className={credentialEditButtonClass}
            aria-label="Edit skills"
            title="Edit skills"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          : undefined}
        />

        <div className="relative min-h-0 flex-1 pt-3">
          <motion.div
            ref={skillsViewportRef}
            {...{
              className: "credential-scrollbar h-full overflow-x-hidden overflow-y-auto pr-1",
              onScroll: (event: React.UIEvent<HTMLDivElement>) =>
                setSkillsAtTop(event.currentTarget.scrollTop <= 2),
            }}
          >
          <AnimatePresence>
            <motion.div {...{ className: "flex min-h-full flex-wrap content-center items-center gap-2 py-1" }}>
            {skills.map((skill) => (
              <motion.span
                key={skill}
                data-skill
                variants={skillVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                {...{
                  className:
                    "profile-chip inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                }}
              >
                <SkillIcon skill={skill} iconMap={skillIcons} />
                {skill}
              </motion.span>
            ))}
            </motion.div>
          </AnimatePresence>

          {skills.length === 0 && (
            <p className="flex h-full items-center justify-center text-sm text-slate-400">No skills added yet.</p>
          )}
          </motion.div>
          {skillsAtTop && hiddenSkillCount > 0 && (
            <span className="pointer-events-none absolute bottom-2 right-3 rounded-full border border-white/10 bg-zinc-950/90 px-2.5 py-1 text-xs font-semibold text-zinc-300 shadow-lg">
              +{hiddenSkillCount}
            </span>
          )}
        </div>
      </motion.div>

      {mounted &&
        isOwner &&
        isEditModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsEditModalOpen(false)}
          >
            <div
              className="max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-lg border border-slate-700 bg-slate-800 shadow-xl sm:max-h-[80vh]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
                    <span className="p-2 bg-zinc-600/20 rounded-lg">
                      <Pencil className="h-5 w-5" />
                    </span>
                    Edit Skills
                  </h2>
                  <button
                    className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Add Skills
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      ref={inputRef}
                      type="text"
                      value={skillInput}
                      onChange={(e) => {
                        setSkillInput(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="Search for skills..."
                      className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-200 text-sm focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                    />

                    {showSuggestions &&
                      (suggestions.length > 0 || isSearching) && (
                        <div className="absolute z-10 mt-1 w-full bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {isSearching && (
                            <div className="px-4 py-2 text-slate-400 text-sm flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-zinc-500"></div>
                              Searching...
                            </div>
                          )}
                          {suggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              onClick={() => addSkill(suggestion)}
                              className="w-full text-left px-4 py-2 text-slate-200 hover:bg-slate-700 transition-colors text-sm"
                              disabled={tempSkills.includes(suggestion)}
                            >
                              {suggestion}
                              {tempSkills.includes(suggestion) && (
                                <span className="ml-2 text-xs text-slate-400">
                                  (already added)
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                </div>

                {iconPickerSkill && (
                  <div className="mb-6 rounded-xl border border-slate-700 bg-slate-900/45 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-200">
                          Choose a logo for {iconPickerSkill}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Icons load from Iconify and are not stored as project assets.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIconPickerSkill(null);
                          setIconChoices([]);
                        }}
                        className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-700 hover:text-slate-200"
                        aria-label="Close icon picker"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {isSearchingIcons ? (
                        <div className="flex h-12 items-center gap-2 px-2 text-sm text-slate-400">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-slate-200" />
                          Finding logos...
                        </div>
                      ) : (
                        <>
                          {iconChoices.map((iconName) => {
                            const selected = tempSkillIcons[iconPickerSkill] === iconName;
                            return (
                              <button
                                key={iconName}
                                type="button"
                                onClick={() =>
                                  setTempSkillIcons((current) => ({
                                    ...current,
                                    [iconPickerSkill]: iconName,
                                  }))
                                }
                                className={`grid h-12 w-12 place-items-center rounded-xl border transition-all hover:-translate-y-0.5 ${
                                  selected
                                    ? "border-white/50 bg-white/15 ring-2 ring-white/15"
                                    : "border-slate-700 bg-slate-800 hover:border-slate-500"
                                }`}
                                title={iconName}
                                aria-label={`Use ${iconName} for ${iconPickerSkill}`}
                              >
                                <Icon icon={iconName} className="h-7 w-7" aria-hidden="true" />
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() =>
                              setTempSkillIcons((current) => ({
                                ...current,
                                [iconPickerSkill]: null,
                              }))
                            }
                            className={`h-12 rounded-xl border px-3 text-xs font-medium transition-all hover:-translate-y-0.5 ${
                              tempSkillIcons[iconPickerSkill] === null
                                ? "border-white/50 bg-white/15 text-white ring-2 ring-white/15"
                                : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                            }`}
                          >
                            No icon
                          </button>
                        </>
                      )}
                    </div>

                    {!isSearchingIcons && iconChoices.length === 0 && (
                      <p className="mt-3 text-xs text-slate-500">
                        No matching logo was found. This skill will remain text-only.
                      </p>
                    )}
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Current Skills ({tempSkills.length})
                  </label>
                  <AnimatePresence>
                    <div className="flex flex-wrap gap-2 min-h-[3rem] p-3 bg-slate-700/30 rounded-lg border border-slate-700">
                      {tempSkills.length === 0 ? (
                        <p className="text-slate-400 text-sm py-2">
                          No skills selected yet.
                        </p>
                      ) : (
                        tempSkills.map((skill) => (
                          <motion.span
                            key={skill}
                            variants={skillVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            {...{
                              className:
                                "inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-600/20 text-zinc-300 rounded-full text-sm font-medium border border-zinc-600/30",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => void loadIconChoices(skill, false)}
                              className="inline-flex items-center gap-1.5 rounded-full px-0.5 transition-colors hover:text-white"
                              title={`Choose an icon for ${skill}`}
                            >
                              <SkillIcon skill={skill} iconMap={tempSkillIcons} />
                              {skill}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="ml-1 hover:text-zinc-400 transition-colors"
                              aria-label={`Remove ${skill}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </motion.span>
                        ))
                      )}
                    </div>
                  </AnimatePresence>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-700">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className={secondaryActionButtonClass}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSkills}
                    disabled={saving}
                    className={primaryActionButtonClass}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9"
                          />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
