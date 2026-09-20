"use client";

import type { PortfolioEducation } from "@/types/portfolio";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, BookOpen } from "lucide-react";
import { Button, ButtonSpinner, primaryActionButtonClass, secondaryActionButtonClass } from "@/components/ui/button";
import { createPortal } from "react-dom";

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

  useEffect(() => {
    if (isOpen) {
      setEditingEducation([...education]);
    }
  }, [isOpen, education]);

  const addNewEducation = () => {
    if (editingEducation.length >= 2) return;
    const newEducation: PortfolioEducation = {
      school: "",
      degree: "",
      field: "",
      startYear: new Date().getFullYear(),
      isCurrently: false,
    };
    setEditingEducation([...editingEducation, newEducation]);
  };

  const updateEducation = (
    index: number,
    field: keyof PortfolioEducation,
    value: string | number | boolean | undefined,
  ) => {
    const updated = [...editingEducation];
    updated[index] = { ...updated[index], [field]: value };
    setEditingEducation(updated);
  };

  const removeEducation = (index: number) => {
    const updated = editingEducation.filter((_, i) => i !== index);
    setEditingEducation(updated);
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    try {
      await onSave(editingEducation);
      setSaving(false);
      onClose();
    } catch {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        {...{
          className:
            "fixed inset-0 z-[50000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm",
          onClick: onClose,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          {...{
            className:
              "relative max-h-[calc(100dvh-2rem)] w-full max-w-4xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 shadow-2xl sm:max-h-[90vh]",
            onClick: (e: React.MouseEvent) => e.stopPropagation(),
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-zinc-900/20 p-2 rounded-lg">
                  <BookOpen className="h-6 w-6 text-zinc-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-100">
                  Manage Education
                </h2>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="rounded-full border border-slate-700 bg-slate-800/80 p-2 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
                aria-label="Close education editor"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {editingEducation.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-slate-800 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-300 mb-2">
                  No Education Added
                </h3>
                <p className="text-slate-500 mb-6">
                  Add your educational background to showcase your academic
                  achievements
                </p>
                <Button
                  onClick={addNewEducation}
                  className={primaryActionButtonClass}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Education
                </Button>
              </div>
            ) : (
              <>
                {editingEducation.map((edu, index) => (
                  <motion.div
                    key={index}
                    {...{
                      className:
                        "bg-slate-800/50 rounded-lg p-6 border border-slate-700",
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-200">
                        Education {index + 1}
                      </h3>
                      <Button
                        onClick={() => removeEducation(index)}
                        variant="ghost"
                        size="sm"
                        className="text-zinc-400 hover:text-zinc-300 hover:bg-zinc-900/20"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          School/University *
                        </label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) =>
                            updateEducation(index, "school", e.target.value)
                          }
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                          placeholder="Enter school or university name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Degree *
                        </label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) =>
                            updateEducation(index, "degree", e.target.value)
                          }
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                          placeholder="e.g., Bachelor of Technology"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Field of Study *
                        </label>
                        <input
                          type="text"
                          value={edu.field}
                          onChange={(e) =>
                            updateEducation(index, "field", e.target.value)
                          }
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                          placeholder="e.g., Computer Science"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Start Year *
                        </label>
                        <input
                          type="number"
                          value={edu.startYear}
                          onChange={(e) =>
                            updateEducation(
                              index,
                              "startYear",
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                          min="1950"
                          max="2030"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <div className="flex items-center gap-4 mb-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={edu.isCurrently}
                              onChange={(e) =>
                                updateEducation(
                                  index,
                                  "isCurrently",
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 text-zinc-600 bg-slate-700 border-slate-600 rounded focus:ring-zinc-500"
                            />
                            <span className="text-sm text-slate-300">
                              Currently studying here
                            </span>
                          </label>
                        </div>
                        {!edu.isCurrently && (
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              End Year
                            </label>
                            <input
                              type="number"
                              value={edu.endYear || ""}
                              onChange={(e) =>
                                updateEducation(
                                  index,
                                  "endYear",
                                  e.target.value
                                    ? parseInt(e.target.value)
                                    : undefined
                                )
                              }
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                              min="1950"
                              max="2030"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                <div className="flex flex-col items-center gap-2">
                  <Button
                    onClick={addNewEducation}
                    variant="outline"
                    disabled={editingEducation.length >= 2}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Education
                  </Button>
                  {editingEducation.length >= 2 && (
                    <p className="text-xs text-slate-500">You can add up to two education entries.</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 p-6">
            <div className="flex gap-3 justify-end">
              <Button
                onClick={onClose}
                variant="ghost"
                className={secondaryActionButtonClass}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className={primaryActionButtonClass}
              >
                {saving ? (
                  <><ButtonSpinner />Saving...</>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
