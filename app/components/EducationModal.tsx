"use client";

import type { PortfolioEducation } from "@/types/portfolio";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button, ButtonSpinner } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MAX_ENTRIES = 2;

const textFields = [
  { field: "school", label: "School or university", placeholder: "Where you studied" },
  { field: "degree", label: "Degree", placeholder: "Bachelor of Technology" },
  { field: "field", label: "Field of study", placeholder: "Computer Science" },
] as const;

interface EducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  education: PortfolioEducation[];
  onSave: (education: PortfolioEducation[]) => Promise<void>;
}

export default function EducationModal({
  isOpen,
  onClose,
  education,
  onSave,
}: EducationModalProps) {
  const [editingEducation, setEditingEducation] = useState<PortfolioEducation[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  // Courses can end a few years from now.
  const latestYear = new Date().getFullYear() + 8;

  useEffect(() => {
    if (isOpen) {
      setEditingEducation(education);
      setSaveFailed(false);
    }
  }, [isOpen, education]);

  const addNewEducation = () => {
    if (editingEducation.length >= MAX_ENTRIES) return;
    setEditingEducation([
      ...editingEducation,
      { school: "", degree: "", field: "", startYear: new Date().getFullYear(), isCurrently: false },
    ]);
  };

  const updateEducation = (
    index: number,
    field: keyof PortfolioEducation,
    value: string | number | boolean | undefined,
  ) => {
    setEditingEducation((current) => current.map((edu, i) => (i === index ? { ...edu, [field]: value } : edu)));
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setSaveFailed(false);

    try {
      await onSave(editingEducation);
      onClose();
    } catch (error) {
      console.error("Error saving education:", error);
      setSaveFailed(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="Edit education"
      description="You can add up to two entries."
      size="lg"
      busy={saving}
      onSubmit={handleSave}
      footer={
        <>
          {saveFailed && (
            <p role="alert" className="basis-full text-[15px] font-medium text-danger">
              Your education wasn’t saved. Fill in every field and try again.
            </p>
          )}
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
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
      {editingEducation.length === 0 ? (
        <div className="py-8 text-center">
          <p className="font-display text-xl font-semibold">No education added yet</p>
          <p className="mx-auto mt-1.5 max-w-[42ch] text-[15px] leading-relaxed text-ink-soft">
            Add where you studied, what you studied and when.
          </p>
          <Button onClick={addNewEducation} className="mt-6">
            <Plus aria-hidden="true" />
            Add education
          </Button>
        </div>
      ) : (
        <>
          <div className="divide-y divide-line">
            {editingEducation.map((edu, index) => (
              <fieldset key={index} className="py-6 first:pt-0">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <legend className="float-left font-display text-lg font-semibold">Education {index + 1}</legend>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingEducation((current) => current.filter((_, i) => i !== index))}
                    aria-label={`Remove education ${index + 1}`}
                    className="hover:text-danger"
                  >
                    <Trash2 aria-hidden="true" />
                    Remove
                  </Button>
                </div>

                <div className="grid clear-both gap-5 md:grid-cols-2">
                  {textFields.map(({ field, label, placeholder }) => (
                    <div key={field} className={field === "school" ? "md:col-span-2" : undefined}>
                      <Label htmlFor={`education-${index}-${field}`}>{label}</Label>
                      <Input
                        id={`education-${index}-${field}`}
                        value={edu[field]}
                        onChange={(e) => updateEducation(index, field, e.target.value)}
                        placeholder={placeholder}
                        className="mt-2"
                      />
                    </div>
                  ))}

                  <div>
                    <Label htmlFor={`education-${index}-start`}>Start year</Label>
                    <Input
                      id={`education-${index}-start`}
                      type="number"
                      value={Number.isNaN(edu.startYear) ? "" : edu.startYear}
                      onChange={(e) => updateEducation(index, "startYear", parseInt(e.target.value))}
                      min={1950}
                      max={latestYear}
                      className="mt-2"
                    />
                  </div>

                  {!edu.isCurrently && (
                    <div>
                      <Label htmlFor={`education-${index}-end`}>End year</Label>
                      <Input
                        id={`education-${index}-end`}
                        type="number"
                        value={edu.endYear || ""}
                        onChange={(e) =>
                          updateEducation(index, "endYear", e.target.value ? parseInt(e.target.value) : undefined)
                        }
                        min={1950}
                        max={latestYear}
                        className="mt-2"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2.5 md:col-span-2">
                    <input
                      type="checkbox"
                      id={`education-${index}-current`}
                      checked={edu.isCurrently}
                      onChange={(e) => updateEducation(index, "isCurrently", e.target.checked)}
                      className="size-[18px] accent-brand"
                    />
                    <Label htmlFor={`education-${index}-current`} className="font-medium">
                      Currently studying here
                    </Label>
                  </div>
                </div>
              </fieldset>
            ))}
          </div>

          {editingEducation.length < MAX_ENTRIES && (
            <Button variant="secondary" size="sm" onClick={addNewEducation}>
              <Plus aria-hidden="true" />
              Add another
            </Button>
          )}
        </>
      )}
    </Dialog>
  );
}
