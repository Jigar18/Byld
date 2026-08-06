"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button, primaryActionButtonClass } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Github, X, Plus, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import SkillIcon, { SkillIconMap } from "@/app/components/SkillIcon";

const globalStyles = `
  input:-webkit-autofill,
  input:-webkit-autofill:hover, 
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px #27272a inset !important;
    -webkit-text-fill-color: #e4e4e7 !important;
    transition: background-color 5000s ease-in-out 0s;
    caret-color: #e4e4e7;
  }
`;

const inputClassName =
  "w-full px-4 py-3 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 bg-slate-800 text-slate-200";

export default function SkillsPage() {
  const [skillInput, setSkillInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedSkillIcons, setSelectedSkillIcons] = useState<SkillIconMap>({});
  const [isSearching, setIsSearching] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(true);
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
    const fetchSkills = async () => {
      if (skillInput.length >= 2) {
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
      } else {
        setSuggestions([]);
      }
    };

    fetchSkills();
  }, [skillInput, selectedSkills]);

  const formatSkill = (skill: string) => skill ? skill.charAt(0).toUpperCase() + skill.slice(1) : skill;

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

  const handleSkillSelect = (skill: string) => {
    hasEditedSkillsRef.current = true;
    const formattedSkill = formatSkill(skill);
    if (!selectedSkills.includes(formattedSkill)) {
      setSelectedSkills([...selectedSkills, formattedSkill]);
      void findSkillIcon(formattedSkill);
      setSkillInput("");
      setSuggestions([]);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
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

  const handleAddCustomSkill = () => {
    hasEditedSkillsRef.current = true;
    const formattedSkill = formatSkill(skillInput.trim());
    if (formattedSkill && !selectedSkills.includes(formattedSkill)) {
      setSelectedSkills([...selectedSkills, formattedSkill]);
      void findSkillIcon(formattedSkill);
      setSkillInput("");
      setSuggestions([]);
    }
  };

  return (
    <>
      <style jsx global>
        {globalStyles}
      </style>

      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 py-12 px-4 sm:px-6 flex items-center justify-center">
        <div className="w-full max-w-2xl mx-auto bg-slate-900 rounded-xl shadow-xl overflow-hidden border border-slate-800">
          <div className="p-8">
            <div className="mb-12 text-center">
              <h1 className="text-3xl font-bold text-slate-100 mb-3">
                {"What skills do you have?"}
              </h1>
              <p className="text-slate-400 max-w-md mx-auto">
                {
                  "Add your technical skills, programming languages, frameworks, and tools you're proficient with."
                }
              </p>
            </div>

            <div className="space-y-8 max-w-xl mx-auto">
              {/* Skills input */}
              <div className="relative">
                <Label
                  htmlFor="skills"
                  className="text-slate-300 font-medium text-base mb-3 block"
                >
                  Add your skills
                </Label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search className="h-4 w-4" />
                  </div>
                  <Input
                    ref={inputRef}
                    id="skills"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    className={`${inputClassName} pl-10 pr-10`}
                    placeholder="Type to search skills (e.g. React, TypeScript)"
                    autoComplete="off"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    {isSearching ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-zinc-400"></div>
                    ) : (
                      skillInput && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 p-0 text-slate-400 hover:text-zinc-400 hover:bg-slate-700/50 rounded-full transition-colors"
                          onClick={() => setSkillInput("")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )
                    )}
                  </div>
                </div>

                {/* Suggestions dropdown */}
                <AnimatePresence>
                  {suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      {...{
                        className:
                          "absolute left-0 right-0 bg-slate-800 border border-slate-700 rounded-md shadow-lg max-h-[220px] overflow-y-auto z-10 mt-3",
                      }}
                    >
                      <ul className="py-1 divide-y divide-slate-700/50">
                        {suggestions.map((skill, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            {...{
                              className:
                                "px-4 py-3 hover:bg-slate-700 cursor-pointer text-slate-200 text-sm transition-colors flex items-center",
                              onClick: () => handleSkillSelect(skill),
                            }}
                          >
                            <span className="flex flex-1 items-center gap-2">
                              <SkillIcon skill={skill} />
                              {skill}
                            </span>
                            <span className="bg-slate-700/50 hover:bg-zinc-600/30 p-1 rounded-full text-zinc-400 transition-colors">
                              <Plus className="h-3.5 w-3.5" />
                            </span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Add custom skill button */}
                {skillInput && !suggestions.length && !isSearching && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    {...{ className: "mt-3" }}
                  >
                    <Button
                      onClick={handleAddCustomSkill}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 w-full justify-start rounded-md transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2 text-zinc-400" />
                      {`Add "${skillInput}" as a new skill`}
                    </Button>
                  </motion.div>
                )}
              </div>

              {/* Selected skills */}
              <div className="mt-8">
                <Label className="text-slate-300 font-medium text-base mb-3 block">
                  Your skills
                </Label>
                <div className="flex flex-wrap gap-2.5 mt-3 min-h-[50px]">
                  {isDiscovering && (
                    <div className="flex w-full items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3">
                      <span className="relative grid h-9 w-9 place-items-center rounded-full border border-slate-600">
                        <Github className="h-4 w-4 text-slate-200" />
                        <span className="absolute inset-[-4px] animate-spin rounded-full border border-transparent border-t-zinc-300" />
                      </span>
                      <div><p className="text-sm text-slate-200">Finding your strongest GitHub skills</p><p className="text-xs text-slate-500">Scanning the languages in your recent repositories…</p></div>
                    </div>
                  )}
                  {!isDiscovering && selectedSkills.length === 0 && (
                    <div className="flex items-center w-full">
                      <p className="text-slate-500 text-sm italic">
                        No skills added yet
                      </p>
                    </div>
                  )}
                  <AnimatePresence>
                    {selectedSkills.map((skill) => (
                      <motion.div
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8, y: 5 }}
                        transition={{ duration: 0.2 }}
                        {...{
                          className:
                            "bg-slate-800 border border-slate-700 rounded-full px-3.5 py-1.5 flex items-center gap-2 group hover:border-zinc-500/50 transition-colors",
                        }}
                      >
                        <SkillIcon skill={skill} iconMap={selectedSkillIcons} />
                        <span className="text-slate-200 text-sm">{skill}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 p-0 text-slate-500 hover:text-zinc-400 hover:bg-slate-700/50 rounded-full opacity-80 group-hover:opacity-100 transition-all"
                          onClick={() => handleRemoveSkill(skill)}
                          aria-label={`Remove ${skill}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                {!isDiscovering && discoveredRepositoryCount > 0 && selectedSkills.length > 0 && (
                  <p className="mt-3 flex items-center gap-2 text-xs text-slate-500"><Github className="h-3.5 w-3.5" />Suggested from {discoveredRepositoryCount} recent {discoveredRepositoryCount === 1 ? "repository" : "repositories"}. Remove or add anything before continuing.</p>
                )}
              </div>

              {/* Continue button */}
              <div className="mt-12 flex justify-end">
                <Button
                  className={primaryActionButtonClass}
                  disabled={selectedSkills.length === 0}
                  onClick={async () => {
                      const response = await fetch("/api/skillsToDB", {
                        method: "POST",
                        headers: {
                          "Content-type": "application/json",
                        },
                        body: JSON.stringify({ skills: selectedSkills, iconMap: selectedSkillIcons }),
                      });
                      if (response.ok) router.push("/profile-picture");
                    }
                  }
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
