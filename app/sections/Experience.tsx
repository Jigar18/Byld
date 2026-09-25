"use client";

import type { PortfolioExperience } from "@/types/portfolio";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  BarChart2,
  Award,
  Briefcase,
  Code,
  Users,
  Clock,
  Zap,
  Edit3,
  X,
  Save,
  Calendar,
  Building,
  Trash2,
} from "lucide-react";
import { Button, ButtonSpinner, primaryActionButtonClass, secondaryActionButtonClass } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "../context/UserContext";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

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

const inputClassName =
  "w-full px-4 py-3 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 bg-slate-800 text-slate-200";

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

const contributionIcons = [Briefcase, Code, Users, BarChart2, Award, Clock, Zap, CheckCircle2];

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

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <Label className="text-slate-400 text-sm">{label} Month</Label>
        <select value={month} onChange={(e) => onMonthChange(e.target.value)} className={inputClassName}>
          <option value="">Select month</option>
          {months.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label className="text-slate-400 text-sm">{label} Year</Label>
        <select value={year} onChange={(e) => onYearChange(e.target.value)} className={inputClassName}>
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
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref as React.RefObject<HTMLElement>, {
    once: true,
    margin: "-100px",
  });
  const [experience, setExperience] = useState(() => sortExperiences(portfolioData.experiences));
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editing, setEditing] = useState<PortfolioExperience | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState<PortfolioExperience | null>(null);

  const updateForm = (values: Partial<typeof emptyForm>) => setForm((current) => ({ ...current, ...values }));

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
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => setIsEditModalOpen(false);

  const handleSaveChanges = async () => {
    if (!form.company || !form.position || !form.startMonth || !form.startYear) return;

    try {
      setSaving(true);
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
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExperience = async () => {
    if (!experienceToDelete) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/updateUserExperience?id=${experienceToDelete.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete experience");

      setExperience((current) => current.filter((item) => item.id !== experienceToDelete.id));
      setExperienceToDelete(null);
    } catch (error) {
      console.error("Error deleting experience:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <motion.div
        ref={ref}
        {...{ className: "w-full" }}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          {...{
            className:
              "profile-accent-amber profile-section-rule relative group border-t pt-8",
          }}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.3 }}
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
        >
          {isOwner && <button
            className="absolute right-0 top-4 p-2 rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-300 hover:text-white border border-slate-600 opacity-100 sm:right-4 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 hover:scale-105"
            onClick={() => handleOpenModal()}
            type="button"
          >
            <Edit3 className="h-4 w-4" />
          </button>}

          <h2 className="profile-section-label mb-10 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.22em]">
            <span className="profile-icon inline-flex rounded-lg border p-2">
              <Briefcase className="h-5 w-5" />
            </span>
            Experience
          </h2>

          <div>
            {experience.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No experiences added yet</p>
                {isOwner && <Button
                  onClick={() => handleOpenModal()}
                  className={primaryActionButtonClass}
                >
                  Add Your First Experience
                </Button>}
              </div>
            ) : (
              experience.map((exp, index) => (
                <motion.div
                  key={exp.id}
                  {...{ className: "relative py-7" }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={
                    isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }
                  }
                  transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                >
                  {index > 0 && (
                    <span className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  )}
                  <div className="flex flex-col gap-5 md:flex-row md:gap-6">
                    {/* Timeline dot and line */}
                    <div className="relative hidden w-4 flex-shrink-0 flex-col items-center md:flex">
                      {index > 0 && (
                        <div className="absolute -top-7 left-[7px] h-9 w-px bg-white/10" />
                      )}
                      {index < experience.length - 1 && (
                        <div className="absolute -bottom-7 left-[7px] top-2 w-px bg-white/10" />
                      )}
                      <div className="z-10 h-4 w-4 rounded-full border-2 border-white/20 bg-zinc-700"></div>
                    </div>

                    <div className="group flex flex-1 flex-col gap-5 md:flex-row">
                      <div
                        className={`relative flex-shrink-0 border-l border-white/10 pl-4 md:w-64 md:border-l-0 md:pl-0 ${isOwner ? "pr-20" : ""}`}
                      >
                        {isOwner && (
                          <div className="absolute right-0 top-0 flex gap-1 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100">
                            <button
                              className="rounded-md p-2 text-slate-400 transition-all duration-200 hover:scale-110 hover:bg-white/10 hover:text-white"
                              onClick={() => handleOpenModal(exp)}
                              type="button"
                              aria-label={`Edit ${exp.company} experience`}
                              title="Edit experience"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              className="rounded-md p-2 text-slate-400 transition-all duration-200 hover:scale-110 hover:bg-red-500/10 hover:text-red-300"
                              onClick={() => setExperienceToDelete(exp)}
                              type="button"
                              aria-label={`Delete ${exp.company} experience`}
                              title="Delete experience"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}

                        <h3 className="portfolio-display text-xl font-semibold text-slate-100">
                          {exp.company}
                        </h3>
                        <p className="font-medium text-zinc-300">
                          {exp.position}
                        </p>
                        <p className="text-slate-400 text-sm mt-1">
                          {exp.startMonth} {exp.startYear} - {exp.isCurrentRole ? "Present" : `${exp.endMonth} ${exp.endYear}`}
                        </p>
                      </div>

                      <div className="flex-1 md:border-l md:border-white/10 md:pl-6">
                        <div className="grid grid-cols-1 gap-3">
                          {exp.contributions.map((text, idx) => {
                            const Icon = contributionIcons[idx % contributionIcons.length];
                            return (
                              <motion.div
                                key={idx}
                                {...{
                                  className:
                                    "flex items-start gap-3 text-slate-300",
                                }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={
                                  isInView
                                    ? { opacity: 1, y: 0 }
                                    : { opacity: 0, y: 10 }
                                }
                                transition={{
                                  duration: 0.3,
                                  delay: 0.1 + idx * 0.1 + index * 0.2,
                                }}
                              >
                                <div className="mt-0.5 flex-shrink-0 text-zinc-500">
                                  <Icon className="h-5 w-5 text-zinc-400" />
                                </div>
                                <span className="text-slate-300">
                                  {text}
                                </span>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {experience.length > 2 && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.035] px-4 py-2 text-zinc-300 transition-colors hover:bg-white/[0.07] hover:text-white"
              >
                <span>View More</span>
                <svg
                  className="w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>

      {isOwner &&
        isEditModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={handleCloseModal}
          >
            <div
              className="relative max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 shadow-2xl animate-in zoom-in-95 duration-200 sm:max-h-[90vh]"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <Button
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
                onClick={handleCloseModal}
                aria-label="Close modal"
                size="icon"
              >
                <X className="h-5 w-5" />
              </Button>

              <div className="p-4 sm:p-6">
                <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                  <span className="bg-zinc-900/20 p-1.5 rounded text-zinc-400">
                    <Edit3 className="h-5 w-5" />
                  </span>
                  {editing ? "Edit Experience" : "Add Experience"}
                </h2>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="organization"
                      className="text-slate-300 font-medium flex items-center gap-2"
                    >
                      <Building className="h-4 w-4" />
                      Organization <span className="text-zinc-400">*</span>
                    </Label>
                    <Input
                      id="organization"
                      value={form.company}
                      onChange={(e) => updateForm({ company: e.target.value })}
                      className={inputClassName}
                      placeholder="e.g., Google, Microsoft, Startup Inc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="role"
                      className="text-slate-300 font-medium flex items-center gap-2"
                    >
                      <Briefcase className="h-4 w-4" />
                      Role <span className="text-zinc-400">*</span>
                    </Label>
                    <Input
                      id="role"
                      value={form.position}
                      onChange={(e) => updateForm({ position: e.target.value })}
                      className={inputClassName}
                      placeholder="e.g., Software Engineer, Product Manager"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-slate-300 font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Time Period <span className="text-zinc-400">*</span>
                    </Label>

                    <MonthYearSelects
                      label="Start"
                      month={form.startMonth}
                      year={form.startYear}
                      onMonthChange={(startMonth) => updateForm({ startMonth })}
                      onYearChange={(startYear) => updateForm({ startYear })}
                    />

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="currentRole"
                        checked={form.isCurrentRole}
                        onChange={(e) => updateForm({ isCurrentRole: e.target.checked })}
                        className="rounded border-slate-600 bg-slate-800 text-zinc-600 focus:ring-zinc-500"
                      />
                      <Label
                        htmlFor="currentRole"
                        className="text-slate-300 text-sm"
                      >
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
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="contributions"
                      className="text-slate-300 font-medium"
                    >
                      Key Contributions & Achievements
                    </Label>
                    <Textarea
                      id="contributions"
                      value={form.contributions}
                      onChange={(e) => updateForm({ contributions: e.target.value })}
                      className={`${inputClassName} resize-none min-h-[120px]`}
                      placeholder="Enter each contribution on a new line, e.g.:&#10;Led development of core authentication system&#10;Optimized database queries reducing response time by 40%&#10;Mentored 5 junior developers"
                    />
                    <p className="text-xs text-slate-500">
                      Enter each contribution on a new line. These will be
                      displayed as individual achievement cards.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleCloseModal}
                      className={secondaryActionButtonClass}
                    >
                      Cancel
                    </Button>
                  </div>
                  <Button
                    onClick={handleSaveChanges}
                    className={primaryActionButtonClass}
                    disabled={
                      saving ||
                      !form.company ||
                      !form.position ||
                      !form.startMonth ||
                      !form.startYear ||
                      (!form.isCurrentRole && (!form.endMonth || !form.endYear))
                    }
                  >
                    {saving ? (
                      <><ButtonSpinner />Saving...</>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {editing ? "Save Changes" : "Add Experience"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {isOwner && (
        <ConfirmDeleteModal
          isOpen={Boolean(experienceToDelete)}
          title="Delete Experience"
          message={
            <>
              Are you sure you want to remove{" "}
              <span className="font-semibold text-slate-100">
                {`"${experienceToDelete?.position} at ${experienceToDelete?.company}"`}
              </span>
              ?
            </>
          }
          note="This action cannot be undone."
          busyLabel="Deleting..."
          isBusy={saving}
          onClose={() => setExperienceToDelete(null)}
          onConfirm={handleDeleteExperience}
        />
      )}
    </>
  );
}
