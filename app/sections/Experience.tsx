"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
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
import { Button, primaryActionButtonClass, secondaryActionButtonClass } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "../context/UserContext";
import DeleteExperienceModal from "../components/DeleteExperienceModal";

interface ExperienceItem {
  level: number;
  company: string;
  position: string;
  year: string;
  description: Array<{
    icon: React.ReactNode;
    text: string;
  }>;
  id?: string; // Add database ID for updates
}

interface DatabaseExperience {
  id: string;
  company: string;
  position: string;
  startMonth: string;
  startYear: string;
  endMonth?: string;
  endYear?: string;
  isCurrentRole: boolean;
  contributions: string[];
}

const monthOrder = new Map(
  [
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
  ].map((month, index) => [month, index])
);

const dateValue = (year?: string, month?: string) => {
  const numericYear = Number(year);
  return (
    (Number.isFinite(numericYear) ? numericYear : 0) * 12 +
    (monthOrder.get(month ?? "") ?? -1)
  );
};

const compareExperienceDates = (
  first: DatabaseExperience,
  second: DatabaseExperience
) => {
  if (first.isCurrentRole !== second.isCurrentRole) {
    return first.isCurrentRole ? -1 : 1;
  }

  const firstEnd = first.isCurrentRole
    ? Number.POSITIVE_INFINITY
    : dateValue(first.endYear, first.endMonth);
  const secondEnd = second.isCurrentRole
    ? Number.POSITIVE_INFINITY
    : dateValue(second.endYear, second.endMonth);

  return (
    secondEnd - firstEnd ||
    dateValue(second.startYear, second.startMonth) -
      dateValue(first.startYear, first.startMonth)
  );
};

export default function Experience() {
  const { isOwner, portfolioApiUrl } = useUser();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref as React.RefObject<HTMLElement>, {
    once: true,
    margin: "-100px",
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Form states
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempOrganization, setTempOrganization] = useState("");
  const [tempRole, setTempRole] = useState("");
  const [tempStartMonth, setTempStartMonth] = useState("");
  const [tempStartYear, setTempStartYear] = useState("");
  const [tempEndMonth, setTempEndMonth] = useState("");
  const [tempEndYear, setTempEndYear] = useState("");
  const [tempIsCurrentRole, setTempIsCurrentRole] = useState(false);
  const [tempContributions, setTempContributions] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [experienceToDelete, setExperienceToDelete] =
    useState<ExperienceItem | null>(null);

  const fetchExperiences = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(portfolioApiUrl("/api/getUserExperience"));
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.experiences) {
          // Transform database data to component format
          const transformedExperiences = (
            data.experiences as DatabaseExperience[]
          )
            .sort(compareExperienceDates)
            .map((exp: DatabaseExperience, index: number) => ({
              level: index + 1,
              company: exp.company,
              position: exp.position,
              year: exp.isCurrentRole
                ? `${exp.startMonth} ${exp.startYear} - Present`
                : `${exp.startMonth} ${exp.startYear} - ${exp.endMonth} ${exp.endYear}`,
              description: exp.contributions.map(
                (contribution: string, idx: number) => ({
                  icon: getIconForIndex(idx),
                  text: contribution,
                })
              ),
              id: exp.id, // Store database ID for updates
            }));
          setExperience(transformedExperiences);
        } else {
          // If no experiences found, set empty array
          setExperience([]);
        }
      } else {
        // An unauthenticated public portfolio should render its empty state quietly.
        setExperience([]);
      }
    } catch (error) {
      console.error("Error fetching experiences:", error);
      setExperience([]);
    } finally {
      setLoading(false);
    }
  }, [portfolioApiUrl]);

  useEffect(() => {
    setMounted(true);
    fetchExperiences();
    return () => setMounted(false);
  }, [fetchExperiences]);

  const getIconForIndex = (index: number) => {
    const icons = [
      <Briefcase
        className="h-5 w-5 text-zinc-400"
        key={`briefcase-${index}`}
      />,
      <Code className="h-5 w-5 text-zinc-400" key={`code-${index}`} />,
      <Users className="h-5 w-5 text-zinc-400" key={`users-${index}`} />,
      <BarChart2 className="h-5 w-5 text-zinc-400" key={`chart-${index}`} />,
      <Award className="h-5 w-5 text-zinc-400" key={`award-${index}`} />,
      <Clock className="h-5 w-5 text-zinc-400" key={`clock-${index}`} />,
      <Zap className="h-5 w-5 text-zinc-400" key={`zap-${index}`} />,
      <CheckCircle2 className="h-5 w-5 text-zinc-400" key={`check-${index}`} />,
    ];
    return icons[index % icons.length];
  };

  const [experience, setExperience] = useState<ExperienceItem[]>([]);

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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

  const resetForm = () => {
    setTempOrganization("");
    setTempRole("");
    setTempStartMonth("");
    setTempStartYear("");
    setTempEndMonth("");
    setTempEndYear("");
    setTempIsCurrentRole(false);
    setTempContributions("");
  };

  const handleOpenModal = (index?: number) => {
    if (index !== undefined) {
      // Edit existing experience
      const exp = experience[index];
      setEditingIndex(index);
      setTempOrganization(exp.company);
      setTempRole(exp.position);

      // Parse year range
      const yearParts = exp.year.split(" - ");
      if (yearParts.length === 2) {
        const startParts = yearParts[0].trim().split(" ");
        if (startParts.length === 2) {
          setTempStartMonth(startParts[0]);
          setTempStartYear(startParts[1]);
        }

        if (yearParts[1].trim() === "Present") {
          setTempIsCurrentRole(true);
        } else {
          const endParts = yearParts[1].trim().split(" ");
          if (endParts.length === 2) {
            setTempEndMonth(endParts[0]);
            setTempEndYear(endParts[1]);
          }
        }
      }

      // Convert description array to string
      setTempContributions(exp.description.map((item) => item.text).join("\n"));
    } else {
      // Add new experience
      setEditingIndex(null);
      resetForm();
    }
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    resetForm();
    setEditingIndex(null);
    setIsEditModalOpen(false);
  };

  const handleSaveChanges = async () => {
    if (!tempOrganization || !tempRole || !tempStartMonth || !tempStartYear) {
      return;
    }

    try {
      setSaving(true);

      // Prepare the data for the API
      const contributionsArray = tempContributions
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => line.trim());

      const experienceData = {
        company: tempOrganization,
        position: tempRole,
        startMonth: tempStartMonth,
        startYear: tempStartYear,
        endMonth: tempIsCurrentRole ? null : tempEndMonth,
        endYear: tempIsCurrentRole ? null : tempEndYear,
        isCurrentRole: tempIsCurrentRole,
        contributions: contributionsArray,
      };

      if (editingIndex !== null) {
        // Update existing experience
        const existingExp = experience[editingIndex];
        const response = await fetch("/api/updateUserExperience", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: existingExp.id,
            ...experienceData,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update experience");
        }
      } else {
        // Add new experience
        const response = await fetch("/api/updateUserExperience", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(experienceData),
        });

        if (!response.ok) {
          throw new Error("Failed to add experience");
        }
      }

      // Refresh the experiences from the database
      await fetchExperiences();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving experience:", error);
      // You could add a toast notification here to show the error to the user
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExperience = async () => {
    const exp = experienceToDelete;
    if (!exp?.id) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/updateUserExperience?id=${exp.id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete experience");
      }

      await fetchExperiences();
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
          {/* Edit Button */}
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
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-500"></div>
                <span className="ml-3 text-slate-400">
                  Loading experiences...
                </span>
              </div>
            ) : experience.length === 0 ? (
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
              experience.map((level, index) => (
                <motion.div
                  key={level.id ?? level.level}
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
                              onClick={() => handleOpenModal(index)}
                              type="button"
                              aria-label={`Edit ${level.company} experience`}
                              title="Edit experience"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              className="rounded-md p-2 text-slate-400 transition-all duration-200 hover:scale-110 hover:bg-red-500/10 hover:text-red-300"
                              onClick={() => setExperienceToDelete(level)}
                              type="button"
                              aria-label={`Delete ${level.company} experience`}
                              title="Delete experience"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}

                        <h3 className="portfolio-display text-xl font-semibold text-slate-100">
                          {level.company}
                        </h3>
                        <p className="font-medium text-zinc-300">
                          {level.position}
                        </p>
                        <p className="text-slate-400 text-sm mt-1">
                          {level.year}
                        </p>
                      </div>

                      <div className="flex-1 md:border-l md:border-white/10 md:pl-6">
                        <div className="grid grid-cols-1 gap-3">
                          {level.description.map((item, idx) => (
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
                                {item.icon}
                              </div>
                              <span className="text-slate-300">
                                {item.text}
                              </span>
                            </motion.div>
                          ))}
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

      {/* Edit Modal */}
      {mounted &&
        isOwner &&
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
              {/* Close button */}
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
                  {editingIndex !== null ? "Edit Experience" : "Add Experience"}
                </h2>

                <div className="space-y-6">
                  {/* Organization */}
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
                      value={tempOrganization}
                      onChange={(e) => setTempOrganization(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 bg-slate-800 text-slate-200"
                      placeholder="e.g., Google, Microsoft, Startup Inc."
                    />
                  </div>

                  {/* Role */}
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
                      value={tempRole}
                      onChange={(e) => setTempRole(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 bg-slate-800 text-slate-200"
                      placeholder="e.g., Software Engineer, Product Manager"
                    />
                  </div>

                  {/* Time Period */}
                  <div className="space-y-4">
                    <Label className="text-slate-300 font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Time Period <span className="text-zinc-400">*</span>
                    </Label>

                    {/* Start Date */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="text-slate-400 text-sm">
                          Start Month
                        </Label>
                        <select
                          value={tempStartMonth}
                          onChange={(e) => setTempStartMonth(e.target.value)}
                          className="w-full px-4 py-3 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 bg-slate-800 text-slate-200"
                        >
                          <option value="">Select month</option>
                          {months.map((month) => (
                            <option key={month} value={month}>
                              {month}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-slate-400 text-sm">
                          Start Year
                        </Label>
                        <select
                          value={tempStartYear}
                          onChange={(e) => setTempStartYear(e.target.value)}
                          className="w-full px-4 py-3 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 bg-slate-800 text-slate-200"
                        >
                          <option value="">Select year</option>
                          {years.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Current Role Checkbox */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="currentRole"
                        checked={tempIsCurrentRole}
                        onChange={(e) => setTempIsCurrentRole(e.target.checked)}
                        className="rounded border-slate-600 bg-slate-800 text-zinc-600 focus:ring-zinc-500"
                      />
                      <Label
                        htmlFor="currentRole"
                        className="text-slate-300 text-sm"
                      >
                        This is my current role
                      </Label>
                    </div>

                    {/* End Date */}
                    {!tempIsCurrentRole && (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <Label className="text-slate-400 text-sm">
                            End Month
                          </Label>
                          <select
                            value={tempEndMonth}
                            onChange={(e) => setTempEndMonth(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 bg-slate-800 text-slate-200"
                          >
                            <option value="">Select month</option>
                            {months.map((month) => (
                              <option key={month} value={month}>
                                {month}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label className="text-slate-400 text-sm">
                            End Year
                          </Label>
                          <select
                            value={tempEndYear}
                            onChange={(e) => setTempEndYear(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 bg-slate-800 text-slate-200"
                          >
                            <option value="">Select year</option>
                            {years.map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contributions */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="contributions"
                      className="text-slate-300 font-medium"
                    >
                      Key Contributions & Achievements
                    </Label>
                    <Textarea
                      id="contributions"
                      value={tempContributions}
                      onChange={(e) => setTempContributions(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 bg-slate-800 text-slate-200 resize-none min-h-[120px]"
                      placeholder="Enter each contribution on a new line, e.g.:&#10;Led development of core authentication system&#10;Optimized database queries reducing response time by 40%&#10;Mentored 5 junior developers"
                    />
                    <p className="text-xs text-slate-500">
                      Enter each contribution on a new line. These will be
                      displayed as individual achievement cards.
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
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
                      !tempOrganization ||
                      !tempRole ||
                      !tempStartMonth ||
                      !tempStartYear ||
                      (!tempIsCurrentRole && (!tempEndMonth || !tempEndYear))
                    }
                  >
                    <Save className="h-4 w-4" />
                    {saving
                      ? "Saving..."
                      : editingIndex !== null
                      ? "Save Changes"
                      : "Add Experience"}
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {mounted && isOwner && (
        <DeleteExperienceModal
          experience={experienceToDelete}
          isDeleting={saving}
          onClose={() => setExperienceToDelete(null)}
          onConfirm={handleDeleteExperience}
        />
      )}
    </>
  );
}
