"use client";

import type { PortfolioExperience } from "@/types/portfolio";
import { useState } from "react";
import { ChevronDown, Pencil, Plus, Trash2 } from "lucide-react";
import { Button, ButtonSpinner } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { fieldClass, Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import PortfolioSection from "../components/PortfolioSection";
import { useUser } from "../context/UserContext";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const COLLAPSED_COUNT = 2;

const dateValue = (year?: string | null, month?: string | null) => {
  const numericYear = Number(year);
  return (Number.isFinite(numericYear) ? numericYear : 0) * 12 + months.indexOf(month ?? "");
};

// Current roles first, then the most recently finished, then the most recently started.
const compareExperienceDates = (first: PortfolioExperience, second: PortfolioExperience) => {
  if (first.isCurrentRole !== second.isCurrentRole) {
    return first.isCurrentRole ? -1 : 1;
  }

  const firstEnd = first.isCurrentRole ? Number.POSITIVE_INFINITY : dateValue(first.endYear, first.endMonth);
  const secondEnd = second.isCurrentRole ? Number.POSITIVE_INFINITY : dateValue(second.endYear, second.endMonth);

  return (
    secondEnd - firstEnd ||
    dateValue(second.startYear, second.startMonth) - dateValue(first.startYear, first.startMonth)
  );
};

const sortExperiences = (experiences: PortfolioExperience[]) => [...experiences].sort(compareExperienceDates);

const formatPeriod = (exp: PortfolioExperience) => {
  const start = `${exp.startMonth.slice(0, 3)} ${exp.startYear}`;
  const end = exp.isCurrentRole ? "Present" : `${(exp.endMonth ?? "").slice(0, 3)} ${exp.endYear ?? ""}`.trim();
  return `${start} – ${end}`;
};

const emptyForm = {
  company: "",
  position: "",
  startMonth: "",
  startYear: "",
  endMonth: "",
  endYear: "",
  isCurrentRole: false,
  contributions: "",
};

function MonthYearSelects({
  label,
  month,
  year,
  onMonthChange,
  onYearChange,
}: {
  label: "Start" | "End";
  month: string;
  year: string;
  onMonthChange: (month: string) => void;
  onYearChange: (year: string) => void;
}) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);
  const idPrefix = label.toLowerCase();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor={`${idPrefix}-month`}>{label} month</Label>
        <select
          id={`${idPrefix}-month`}
          value={month}
          onChange={(e) => onMonthChange(e.target.value)}
          className={cn(fieldClass, "mt-2 h-12")}
        >
          <option value="">Select month</option>
          {months.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-year`}>{label} year</Label>
        <select
          id={`${idPrefix}-year`}
          value={year}
          onChange={(e) => onYearChange(e.target.value)}
          className={cn(fieldClass, "mt-2 h-12")}
        >
          <option value="">Select year</option>
          {years.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function Experience() {
  const { isOwner, portfolioData } = useUser();
  const [experience, setExperience] = useState(() => sortExperiences(portfolioData.experiences));
  const [expanded, setExpanded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editing, setEditing] = useState<PortfolioExperience | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [deleteFailed, setDeleteFailed] = useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState<PortfolioExperience | null>(null);

  const updateForm = (values: Partial<typeof emptyForm>) => setForm((current) => ({ ...current, ...values }));

  const formIsComplete = Boolean(
    form.company &&
      form.position &&
      form.startMonth &&
      form.startYear &&
      (form.isCurrentRole || (form.endMonth && form.endYear)),
  );

  const handleOpenModal = (exp: PortfolioExperience | null = null) => {
    setEditing(exp);
    setForm(exp
      ? {
          company: exp.company,
          position: exp.position,
          startMonth: exp.startMonth,
          startYear: exp.startYear,
          endMonth: exp.endMonth ?? "",
          endYear: exp.endYear ?? "",
          isCurrentRole: exp.isCurrentRole,
          contributions: exp.contributions.join("\n"),
        }
      : emptyForm);
    setSaveFailed(false);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => setIsEditModalOpen(false);

  const handleSaveChanges = async () => {
    if (!formIsComplete || saving) return;

    try {
      setSaving(true);
      setSaveFailed(false);
      const response = await fetch("/api/updateUserExperience", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editing ? { id: editing.id } : {}),
          company: form.company,
          position: form.position,
          startMonth: form.startMonth,
          startYear: form.startYear,
          endMonth: form.isCurrentRole ? null : form.endMonth,
          endYear: form.isCurrentRole ? null : form.endYear,
          isCurrentRole: form.isCurrentRole,
          contributions: form.contributions.split("\n").map((line) => line.trim()).filter(Boolean),
        }),
      });
      if (!response.ok) throw new Error(`Failed to ${editing ? "update" : "add"} experience`);

      const { experience: saved } = (await response.json()) as { experience: PortfolioExperience };
      setExperience((current) => sortExperiences(
        editing ? current.map((item) => (item.id === saved.id ? saved : item)) : [...current, saved],
      ));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error saving experience:", error);
      setSaveFailed(true);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExperience = async () => {
    if (!experienceToDelete) return;

    try {
      setSaving(true);
      setDeleteFailed(false);
      const response = await fetch(`/api/updateUserExperience?id=${experienceToDelete.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete experience");

      setExperience((current) => current.filter((item) => item.id !== experienceToDelete.id));
    } catch (error) {
      console.error("Error deleting experience:", error);
      setDeleteFailed(true);
    } finally {
      // Closed on failure too, so the message under the heading is not hidden behind the sheet.
      setExperienceToDelete(null);
      setSaving(false);
    }
  };

  const shownExperience = expanded ? experience : experience.slice(0, COLLAPSED_COUNT);
  const hiddenCount = experience.length - COLLAPSED_COUNT;

  return (
    <PortfolioSection
      id="experience"
      title="Experience"
      action={
        isOwner && (
          <Button variant="secondary" size="sm" onClick={() => handleOpenModal()}>
            <Plus aria-hidden="true" />
            Add experience
          </Button>
        )
      }
    >
      {deleteFailed && (
        <p role="alert" className="mb-5 text-[15px] font-medium text-danger">
          The experience wasn’t deleted. Check your connection and try again.
        </p>
      )}

      {experience.length === 0 ? (
        <p className="text-ink-soft">No experience yet. Add the roles you want people to see.</p>
      ) : (
        <ol>
          {shownExperience.map((exp, index) => (
            <li key={exp.id} className="relative pb-9 pl-7 last:pb-0 sm:pl-9">
              {index < shownExperience.length - 1 && (
                <span aria-hidden="true" className="absolute bottom-0 left-[5px] top-3 w-px bg-line" />
              )}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-0 top-[9px] size-[11px] rounded-full border-2",
                  exp.isCurrentRole ? "border-brand bg-brand" : "border-ink-faint bg-paper",
                )}
              />

              <div className="flex flex-wrap items-start justify-between gap-x-5 gap-y-1">
                <div className="min-w-0">
                  <h3 className="font-display text-xl font-semibold leading-snug tracking-[-0.01em]">{exp.company}</h3>
                  <p className="mt-0.5 font-medium text-ink-soft">{exp.position}</p>
                </div>
                <div className="flex items-center gap-1">
                  <p className="mr-1 text-sm tabular-nums text-ink-soft">{formatPeriod(exp)}</p>
                  {isOwner && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleOpenModal(exp)}
                        aria-label={`Edit ${exp.company} experience`}
                      >
                        <Pencil aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setExperienceToDelete(exp)}
                        aria-label={`Delete ${exp.company} experience`}
                        className="hover:text-danger"
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {exp.contributions.length > 0 && (
                <ul className="mt-3.5 max-w-[68ch] space-y-2">
                  {exp.contributions.map((text, contributionIndex) => (
                    <li
                      key={contributionIndex}
                      className="relative pl-5 leading-[1.65] before:absolute before:left-0 before:top-[0.8em] before:h-px before:w-2.5 before:bg-ink-faint before:content-['']"
                    >
                      {text}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      )}

      {hiddenCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          className="-ml-3.5 mt-6"
        >
          <ChevronDown aria-hidden="true" className={cn("transition-transform duration-200", expanded && "rotate-180")} />
          {expanded ? "Show fewer" : `Show ${hiddenCount} more`}
        </Button>
      )}

      {isOwner && (
        <Dialog
          open={isEditModalOpen}
          onClose={handleCloseModal}
          title={editing ? "Edit experience" : "Add experience"}
          size="md"
          busy={saving}
          onSubmit={handleSaveChanges}
          footer={
            <>
              {saveFailed && (
                <p role="alert" className="basis-full text-[15px] font-medium text-danger">
                  The experience wasn’t saved. Check your connection and try again.
                </p>
              )}
              <Button variant="ghost" onClick={handleCloseModal} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !formIsComplete}>
                {saving ? (
                  <>
                    <ButtonSpinner />
                    Saving…
                  </>
                ) : editing ? (
                  "Save changes"
                ) : (
                  "Add experience"
                )}
              </Button>
            </>
          }
        >
          <div className="space-y-5">
            <div>
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                value={form.company}
                onChange={(e) => updateForm({ company: e.target.value })}
                placeholder="Where you worked"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={form.position}
                onChange={(e) => updateForm({ position: e.target.value })}
                placeholder="Software engineer"
                className="mt-2"
              />
            </div>

            <MonthYearSelects
              label="Start"
              month={form.startMonth}
              year={form.startYear}
              onMonthChange={(startMonth) => updateForm({ startMonth })}
              onYearChange={(startYear) => updateForm({ startYear })}
            />

            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="currentRole"
                checked={form.isCurrentRole}
                onChange={(e) => updateForm({ isCurrentRole: e.target.checked })}
                className="size-[18px] accent-brand"
              />
              <Label htmlFor="currentRole" className="font-medium">
                This is my current role
              </Label>
            </div>

            {!form.isCurrentRole && (
              <MonthYearSelects
                label="End"
                month={form.endMonth}
                year={form.endYear}
                onMonthChange={(endMonth) => updateForm({ endMonth })}
                onYearChange={(endYear) => updateForm({ endYear })}
              />
            )}

            <div>
              <Label htmlFor="contributions">What you did (optional)</Label>
              <Textarea
                id="contributions"
                value={form.contributions}
                onChange={(e) => updateForm({ contributions: e.target.value })}
                placeholder={"Led development of the core authentication system\nCut database response time by 40%"}
                className="mt-2 min-h-[132px]"
              />
              <p className="mt-2 text-sm text-ink-soft">One per line. Each line becomes its own point.</p>
            </div>
          </div>
        </Dialog>
      )}

      {isOwner && (
        <ConfirmDeleteModal
          isOpen={Boolean(experienceToDelete)}
          title="Delete experience"
          subject={experienceToDelete ? `${experienceToDelete.position} at ${experienceToDelete.company}` : undefined}
          note="This action cannot be undone."
          busyLabel="Deleting…"
          isBusy={saving}
          onClose={() => setExperienceToDelete(null)}
          onConfirm={handleDeleteExperience}
        />
      )}
    </PortfolioSection>
  );
}
