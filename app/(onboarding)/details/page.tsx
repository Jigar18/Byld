"use client";

import React, { useState, useEffect, useRef, type ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Button, ButtonSpinner, primaryActionButtonClass, secondaryActionButtonClass } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { searchCities } from "@/lib/cities";
import { getUniversities } from "@/lib/universities";

const inputClassName =
  "w-full px-3 py-2 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 bg-slate-800 text-slate-200";

const TOTAL_STEPS = 6;

const Spinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-zinc-400"></div>
);

function Field({
  id,
  label,
  loading,
  className = "",
  ...props
}: { id: string; label: string; loading?: boolean } & React.ComponentProps<typeof Input>) {
  const input = <Input id={id} name={id} className={`${inputClassName} ${className}`.trim()} {...props} />;
  return (
    <>
      <Label htmlFor={id} className="text-slate-300 font-medium">
        {label}
      </Label>
      {loading === undefined ? input : (
        <div className="relative">
          {input}
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Spinner />
            </div>
          )}
        </div>
      )}
    </>
  );
}

function SuggestionList({ items, onSelect }: { items: string[]; onSelect: (item: string) => void }) {
  return (
    <div className="absolute left-0 right-0 bg-slate-800 border border-slate-700 rounded-b-md shadow-lg max-h-[180px] overflow-y-auto z-10">
      <ul className="py-1 divide-y divide-slate-700">
        {items.map((item, index) => (
          <li
            key={index}
            className="px-4 py-2.5 hover:bg-slate-700 cursor-pointer text-slate-200 text-sm transition-colors"
            onClick={() => onSelect(item)}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Step({
  step,
  currentStep,
  title,
  onBack,
  children,
  footer,
}: {
  step: number;
  currentStep: number;
  title: string;
  onBack: () => void;
  children: ReactNode;
  footer: ReactNode;
}) {
  const completed = currentStep > step;
  return (
    <div
      className={`transition-all duration-500 ease-in-out transform ${
        completed ? "-translate-y-2 opacity-80 scale-98 bg-slate-800/50 rounded-lg p-4" : "translate-y-0"
      }`}
    >
      {completed && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <CheckCircle2 className="h-5 w-5 text-zinc-400 mr-2" />
            <span className="text-sm font-medium text-slate-300">{title}</span>
          </div>
          {currentStep === step + 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-slate-300 hover:text-slate-100 p-0 h-auto"
            >
              <span className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Edit
              </span>
            </Button>
          )}
        </div>
      )}
      <div className={completed ? "opacity-70" : ""}>{children}</div>
      {currentStep === step && footer}
    </div>
  );
}

export default function Details() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    location: "",
    jobTitle: "",
    school: "",
    startYear: "",
    endYear: "",
    degree: "",
    field: "",
  });
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [universitySuggestions, setUniversitySuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchTimer = useRef<number | undefined>(undefined);
  const latestSearch = useRef(0);

  const router = useRouter();

  useEffect(() => {
    const fetchGitHubDetails = async () => {
      try {
        const response = await fetch("/api/github/profile");
        if (!response.ok) return;
        const profile = await response.json() as { firstName?: string; lastName?: string; location?: string; email?: string };
        setFormData((current) => ({
          ...current,
          firstName: current.firstName || profile.firstName || "",
          lastName: current.lastName || profile.lastName || "",
          location: current.location || profile.location || "",
          email: current.email || profile.email || "",
        }));
      } catch {
        // GitHub profile data is optional; all fields remain editable.
      } finally {
        setIsLoadingEmail(false);
      }
    };

    void fetchGitHubDetails();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Debounced so a search runs once typing pauses, and only the latest result is shown.
  const searchWhileTyping = (
    e: React.ChangeEvent<HTMLInputElement>,
    search: (query: string) => Promise<string[]>,
    setSuggestions: (suggestions: string[]) => void,
  ) => {
    const { value } = e.target;
    handleInputChange(e);
    window.clearTimeout(searchTimer.current);
    const searchId = ++latestSearch.current;
    if (value.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    searchTimer.current = window.setTimeout(async () => {
      const suggestions = await search(value);
      if (searchId !== latestSearch.current) return;
      setSuggestions(suggestions);
      setIsSearching(false);
    }, 300);
  };

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const handleCompleteProfile = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/detailsToDB", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        setIsSubmitting(false);
        return;
      }

      router.push("/skills");
    } catch (error) {
      console.error("Error saving profile details:", error);
      setIsSubmitting(false);
    }
  };

  const backButton = (
    <Button onClick={prevStep} variant="outline" className={secondaryActionButtonClass}>
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back
    </Button>
  );

  // Extra padding keeps the suggestion dropdown from covering the navigation buttons.
  const navigation = (canContinue: boolean, reserveDropdownSpace = false) => (
    <div className={`mt-6 flex justify-between ${reserveDropdownSpace ? "pt-48" : ""}`}>
      {backButton}
      <Button onClick={nextStep} className={primaryActionButtonClass} disabled={!canContinue}>
        Continue
      </Button>
    </div>
  );

  const stepProps = { currentStep, onBack: prevStep };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 py-12 px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-2xl mx-auto bg-slate-900 rounded-xl shadow-xl overflow-hidden border border-slate-800">
        <div className="w-full bg-slate-800 h-2">
          <div
            className="bg-zinc-600 h-2 transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        <div className="p-8">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-slate-100 mb-2">
              {"Let's fill the details for your portfolio"}
            </h1>
            <p className="text-slate-400">
              Step {currentStep} of {TOTAL_STEPS}
            </p>
          </div>

          <div className="space-y-8 max-w-xl mx-auto">
            <Step
              {...stepProps}
              step={1}
              title="Personal Information"
              footer={
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={nextStep}
                    className={primaryActionButtonClass}
                    disabled={!formData.firstName || !formData.lastName}
                  >
                    Continue
                  </Button>
                </div>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Field
                    id="firstName"
                    label="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    disabled={currentStep > 1}
                  />
                </div>
                <div>
                  <Field
                    id="lastName"
                    label="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                    disabled={currentStep > 1}
                  />
                </div>
              </div>
            </Step>

            {currentStep >= 2 && (
              <Step {...stepProps} step={2} title="Email" footer={navigation(Boolean(formData.email))}>
                <Field
                  id="email"
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={isLoadingEmail ? "Loading..." : "Enter your email"}
                  disabled={currentStep > 2 || isLoadingEmail}
                  autoComplete="off"
                />
                {isLoadingEmail && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Spinner />
                  </div>
                )}
                {!isLoadingEmail && !formData.email && (
                  <p className="text-xs text-slate-400 mt-1">
                    Note: You need to be logged in with GitHub to auto-fill
                    your email
                  </p>
                )}
              </Step>
            )}

            {currentStep >= 3 && (
              <Step
                {...stepProps}
                step={3}
                title="Location"
                footer={navigation(Boolean(formData.location), citySuggestions.length > 0)}
              >
                <div className="relative">
                  <Field
                    id="location"
                    label="Select your city?"
                    value={formData.location}
                    onChange={(e) => searchWhileTyping(e, searchCities, setCitySuggestions)}
                    className={citySuggestions.length > 0 ? "rounded-b-none border-b-0" : ""}
                    placeholder="Enter your city"
                    disabled={currentStep > 3}
                    autoComplete="off"
                    loading={isSearching}
                  />
                  {citySuggestions.length > 0 && currentStep === 3 && (
                    <SuggestionList
                      items={citySuggestions}
                      onSelect={(city) => {
                        setFormData((prev) => ({ ...prev, location: city }));
                        setCitySuggestions([]);
                      }}
                    />
                  )}
                </div>
              </Step>
            )}

            {currentStep >= 4 && (
              <Step
                {...stepProps}
                step={4}
                title="Professional Experience"
                footer={navigation(Boolean(formData.jobTitle.trim()))}
              >
                <Field
                  id="jobTitle"
                  label="Most Recent Job Title"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  placeholder="e.g. Software Engineer"
                  disabled={currentStep > 4}
                  autoComplete="off"
                />
              </Step>
            )}

            {currentStep >= 5 && (
              <Step
                {...stepProps}
                step={5}
                title="School and Study Years"
                footer={navigation(
                  Boolean(formData.school.trim() && formData.startYear && formData.endYear),
                  universitySuggestions.length > 0,
                )}
              >
                <div className="space-y-6">
                  <div className="relative">
                    <Field
                      id="school"
                      label="School or College/University"
                      value={formData.school}
                      onChange={(e) => searchWhileTyping(e, getUniversities, setUniversitySuggestions)}
                      className={universitySuggestions.length > 0 ? "rounded-b-none border-b-0" : ""}
                      placeholder="e.g. Stanford University"
                      autoComplete="off"
                      disabled={currentStep > 5}
                      loading={isSearching}
                    />
                    {universitySuggestions.length > 0 && currentStep === 5 && (
                      <SuggestionList
                        items={universitySuggestions}
                        onSelect={(university) => {
                          setFormData((prev) => ({ ...prev, school: university }));
                          setUniversitySuggestions([]);
                        }}
                      />
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Field
                        id="startYear"
                        label="Start Year"
                        value={formData.startYear}
                        onChange={handleInputChange}
                        placeholder="e.g. 2018"
                        disabled={currentStep > 5}
                      />
                    </div>
                    <div>
                      <Field
                        id="endYear"
                        label="End Year"
                        value={formData.endYear}
                        onChange={handleInputChange}
                        placeholder="e.g. 2022"
                        disabled={currentStep > 5}
                      />
                    </div>
                  </div>
                </div>
              </Step>
            )}

            {currentStep >= 6 && (
              <Step
                {...stepProps}
                step={6}
                title="Degree"
                footer={
                  <div className="mt-6 flex justify-between">
                    {backButton}
                    <Button
                      className={primaryActionButtonClass}
                      disabled={!formData.degree.trim() || !formData.field.trim() || isSubmitting}
                      onClick={handleCompleteProfile}
                    >
                      {isSubmitting ? (
                        <>
                          <ButtonSpinner />
                          Saving...
                        </>
                      ) : (
                        "Complete Profile"
                      )}
                    </Button>
                  </div>
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Field
                      id="degree"
                      label="Degree"
                      value={formData.degree}
                      onChange={handleInputChange}
                      placeholder="e.g. Bachelor of Technology"
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Field
                      id="field"
                      label="Field of Study"
                      value={formData.field}
                      onChange={handleInputChange}
                      placeholder="e.g. Computer Science"
                      autoComplete="off"
                    />
                  </div>
                </div>
              </Step>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
