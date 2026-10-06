"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Pencil, Search, X } from "lucide-react";
import { Icon } from "@iconify/react";
import { Button, ButtonSpinner } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useUser } from "../context/UserContext";
import PortfolioSection from "./PortfolioSection";
import SkillIcon, { SkillIconMap } from "./SkillIcon";

// Long lists start cut to about three rows, so the section does not turn into a wall of names.
const COLLAPSED_SKILL_COUNT = 18;

const capitalizeFirst = (skill: string) => skill ? skill.charAt(0).toUpperCase() + skill.slice(1) : skill;

const suggestionChipClass =
  "ui-chip border-dashed bg-transparent transition-colors hover:border-ink-faint disabled:cursor-not-allowed disabled:opacity-50";
const iconChoiceClass = "grid h-12 place-items-center rounded-xl border-[1.5px] transition-colors";

export default function Skills() {
  const { isOwner, skills, setSkills, skillIcons, setSkillIcons } = useUser();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [tempSkills, setTempSkills] = useState<string[]>([]);
  const [tempSkillIcons, setTempSkillIcons] = useState<SkillIconMap>({});
  const [iconPickerSkill, setIconPickerSkill] = useState<string | null>(null);
  const [iconChoices, setIconChoices] = useState<string[]>([]);
  const [isSearchingIcons, setIsSearchingIcons] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);

  useEffect(() => {
    if (skillInput.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
      return;
    }

    setShowSuggestions(true);
    setIsSearching(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const result = await fetch(`/api/skills?skill=${encodeURIComponent(skillInput)}`, { signal: controller.signal });
        setSuggestions(result.ok ? await result.json() : []);
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

  const handleEditClick = () => {
    setTempSkills([...skills]);
    setTempSkillIcons({ ...skillIcons });
    setIconPickerSkill(null);
    setIconChoices([]);
    setSkillInput("");
    setSaveFailed(false);
    setIsEditModalOpen(true);
  };

  const closeIconPicker = () => {
    setIconPickerSkill(null);
    setIconChoices([]);
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

  const isAdded = (skill: string) => tempSkills.includes(capitalizeFirst(skill));

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
    if (iconPickerSkill === skillToRemove) closeIconPicker();
  };

  const handleSaveSkills = async () => {
    try {
      setSaving(true);
      setSaveFailed(false);
      const response = await fetch("/api/skillsToDB", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: tempSkills, iconMap: tempSkillIcons }),
      });
      if (!response.ok) throw new Error("Failed to save skills");

      setSkills([...tempSkills]);
      setSkillIcons({ ...tempSkillIcons });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error saving skills:", error);
      setSaveFailed(true);
    } finally {
      setSaving(false);
    }
  };

  // A couple of hidden skills are not worth a control of their own.
  const collapsible = skills.length > COLLAPSED_SKILL_COUNT + 3;
  const shownSkills = collapsible && !showAllSkills ? skills.slice(0, COLLAPSED_SKILL_COUNT) : skills;

  return (
    <PortfolioSection
      id="skills"
      title="Skills"
      action={
        isOwner && (
          <Button variant="secondary" size="sm" onClick={handleEditClick} aria-label="Edit skills">
            <Pencil aria-hidden="true" />
            Edit
          </Button>
        )
      }
    >
      {skills.length === 0 ? (
        <p className="text-ink-soft">No skills yet. Add the tools and languages you work with.</p>
      ) : (
        <ul id="skill-list" className="flex flex-wrap gap-2">
          {shownSkills.map((skill) => (
            <li key={skill} className="pf-chip">
              <SkillIcon skill={skill} iconMap={skillIcons} />
              {skill}
            </li>
          ))}
        </ul>
      )}

      {collapsible && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAllSkills((current) => !current)}
          aria-expanded={showAllSkills}
          aria-controls="skill-list"
          className="-ml-2 mt-4 font-semibold text-ink"
        >
          <ChevronDown aria-hidden="true" className={cn("transition-transform duration-200", showAllSkills && "rotate-180")} />
          {showAllSkills ? "Show fewer" : `Show all ${skills.length}`}
        </Button>
      )}

      {isOwner && (
        <Dialog
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit skills"
          description="Search to add a skill. Select one you’ve added to change its logo."
          size="md"
          busy={saving}
          footer={
            <>
              {saveFailed && (
                <p role="alert" className="basis-full text-[15px] font-medium text-danger">
                  Your skills weren’t saved. Check your connection and try again.
                </p>
              )}
              <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSaveSkills} disabled={saving}>
                {saving ? (
                  <>
                    <ButtonSpinner />
                    Saving…
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </>
          }
        >
          <Label htmlFor="skill-search">Add a skill</Label>
          <div className="relative mt-2">
            <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
            <Input
              id="skill-search"
              value={skillInput}
              autoComplete="off"
              onChange={(e) => {
                setSkillInput(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                const firstNewSuggestion = suggestions.find((suggestion) => !isAdded(suggestion));
                if (firstNewSuggestion) addSkill(firstNewSuggestion);
              }}
              placeholder="Search for a skill"
              className="pl-11"
            />
          </div>

          {showSuggestions && (suggestions.length > 0 || isSearching) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {isSearching && (
                <span role="status" className="inline-flex h-9 items-center gap-2 text-sm text-ink-soft">
                  <ButtonSpinner />
                  Searching…
                </span>
              )}
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addSkill(suggestion)}
                  disabled={isAdded(suggestion)}
                  className={suggestionChipClass}
                >
                  {suggestion}
                  {isAdded(suggestion) && <span className="text-ink-soft">(added)</span>}
                </button>
              ))}
            </div>
          )}

          {iconPickerSkill && (
            <div className="mt-5 rounded-2xl border border-line p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold">Choose a logo for {iconPickerSkill}</p>
                <Button variant="ghost" size="icon-sm" onClick={closeIconPicker} aria-label="Close icon picker">
                  <X aria-hidden="true" />
                </Button>
              </div>

              {isSearchingIcons ? (
                <p role="status" className="mt-3 flex h-12 items-center gap-2 text-sm text-ink-soft">
                  <ButtonSpinner />
                  Finding logos…
                </p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {iconChoices.map((iconName) => {
                    const selected = tempSkillIcons[iconPickerSkill] === iconName;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setTempSkillIcons((current) => ({ ...current, [iconPickerSkill]: iconName }))}
                        className={cn(iconChoiceClass, "w-12", selected ? "border-ink bg-raised" : "border-line hover:border-ink-faint")}
                        title={iconName}
                        aria-label={`Use ${iconName} for ${iconPickerSkill}`}
                        aria-pressed={selected}
                      >
                        <Icon icon={iconName} className="size-7" aria-hidden="true" />
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setTempSkillIcons((current) => ({ ...current, [iconPickerSkill]: null }))}
                    aria-pressed={tempSkillIcons[iconPickerSkill] === null}
                    className={cn(
                      iconChoiceClass,
                      "px-3.5 text-sm font-medium",
                      tempSkillIcons[iconPickerSkill] === null
                        ? "border-ink bg-raised"
                        : "border-line text-ink-soft hover:border-ink-faint hover:text-ink",
                    )}
                  >
                    No icon
                  </button>
                </div>
              )}

              {!isSearchingIcons && iconChoices.length === 0 && (
                <p className="mt-3 text-sm text-ink-soft">No matching logo was found. This skill will stay text-only.</p>
              )}
            </div>
          )}

          <p className="mt-6 text-sm font-semibold">Your skills ({tempSkills.length})</p>
          {tempSkills.length === 0 ? (
            <p className="mt-2 text-[15px] text-ink-soft">No skills selected yet.</p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2">
              {tempSkills.map((skill) => (
                <li key={skill} className="ui-chip gap-1 pr-1.5">
                  <button
                    type="button"
                    onClick={() => void loadIconChoices(skill, false)}
                    className="inline-flex items-center gap-2 rounded-full"
                    title={`Choose an icon for ${skill}`}
                  >
                    <SkillIcon skill={skill} iconMap={tempSkillIcons} />
                    {skill}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="grid size-6 place-items-center rounded-full text-ink-soft transition-colors hover:bg-ink/10 hover:text-ink"
                    aria-label={`Remove ${skill}`}
                  >
                    <X aria-hidden="true" className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Dialog>
      )}
    </PortfolioSection>
  );
}
