"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, BookOpen, GraduationCap, Mail, MapPin, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button, ButtonSpinner } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { searchCities } from "@/lib/cities";
import { getUniversities } from "@/lib/universities";

const TOTAL_STEPS = 6;

const QUESTIONS = [
  { title: "What’s your name?", hint: "It goes at the top of your portfolio." },
  { title: "Where can people reach you?", hint: "Visitors see this address on your portfolio." },
  { title: "Where are you based?", hint: "Start typing and pick your city." },
  { title: "What do you do?", hint: "Your most recent job title." },
  { title: "Where did you study?", hint: "Your school, college or university, and the years you were there." },
  { title: "What did you study?", hint: "Your degree and its field." },
];

type DetailsForm = {
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  jobTitle: string;
  school: string;
  startYear: string;
  endYear: string;
  degree: string;
  field: string;
};

function Field({
  id,
  label,
  loading = false,
  ...props
}: { id: string; label: string; loading?: boolean } & React.ComponentProps<typeof Input>) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative mt-2">
        <Input id={id} name={id} {...props} />
        {loading && <ButtonSpinner className="absolute right-4 top-1/2 -mt-2 text-ink-soft" />}
      </div>
    </div>
  );
}

// Rendered in the flow rather than floating, so it never covers the Back and Continue buttons.
function SuggestionList({ items, onSelect }: { items: string[]; onSelect: (item: string) => void }) {
  return (
    <ul className="mt-2 max-h-[232px] overflow-y-auto rounded-[14px] border-[1.5px] border-line bg-raised p-1.5">
      {items.map((item, index) => (
        <li key={index}>
          <button
            type="button"
            onClick={() => onSelect(item)}
            className="w-full rounded-[10px] px-3 py-2.5 text-left text-[15px] transition-colors hover:bg-ink/[0.07]"
          >
            {item}
          </button>
        </li>
      ))}
    </ul>
  );
}

// A line on the draft sheet: a dashed slot until it has a value, highlighted while its question is open.
function DraftSlot({
  value,
  width,
  active,
  className = "",
}: {
  value: string;
  width: string;
  active: boolean;
  className?: string;
}) {
  if (value) return <span className={`ob-written block ${className}`}>{value}</span>;
  return (
    <span
      className={`block h-[1.15em] rounded-md border border-dashed ${active ? "border-brand-text" : "border-line"} ${className}`}
      style={{ width }}
    />
  );
}

function DraftRow({ icon: Icon, ...slot }: { icon: LucideIcon } & React.ComponentProps<typeof DraftSlot>) {
  return (
    <li className="flex items-center gap-3">
      <Icon className={`size-[18px] shrink-0 ${slot.active ? "text-brand-text" : "text-ink-faint"}`} />
      <span className="min-w-0 flex-1">
        <DraftSlot {...slot} className="truncate" />
      </span>
    </li>
  );
}

function DraftSheet({ form, activeStep }: { form: DetailsForm; activeStep: number }) {
  const fullName = `${form.firstName} ${form.lastName}`.trim();
  const initials = `${form.firstName.trim().charAt(0)}${form.lastName.trim().charAt(0)}`.toUpperCase();
  const years = [form.startYear, form.endYear].filter(Boolean).join(" – ");
  const school = [form.school, years].filter(Boolean).join(", ");
  const study = [form.degree, form.field].filter(Boolean).join(", ");

  return (
    <aside aria-hidden="true" className="hidden lg:block">
      <div className="ui-sheet ob-sheet rounded-[28px] p-8 [transform:perspective(1600px)_rotateY(-9deg)_rotateX(3deg)]">
        <div
          className={`grid size-[92px] place-items-center rounded-[24px] font-display text-[34px] font-semibold ${
            initials ? "bg-brand text-white" : `border border-dashed ${activeStep === 1 ? "border-brand-text" : "border-line"}`
          }`}
        >
          {initials}
        </div>
        <DraftSlot
          value={fullName}
          width="72%"
          active={activeStep === 1}
          className="mt-7 break-words font-display text-[32px] font-semibold leading-[1.1] tracking-[-0.02em]"
        />
        <DraftSlot value={form.jobTitle} width="50%" active={activeStep === 4} className="mt-2.5 text-[17px] text-ink-soft" />
        <ul className="mt-7 space-y-4 border-t border-sheet-line pt-6 text-[15px]">
          <DraftRow icon={MapPin} value={form.location} width="44%" active={activeStep === 3} />
          <DraftRow icon={GraduationCap} value={school} width="78%" active={activeStep === 5} />
          <DraftRow icon={BookOpen} value={study} width="62%" active={activeStep === 6} />
          <DraftRow icon={Mail} value={form.email} width="56%" active={activeStep === 2} />
        </ul>
      </div>
      <p className="mt-7 max-w-[340px] text-[15px] leading-relaxed text-ink-soft">
        This is the sheet visitors see first. It fills in as you answer.
      </p>
    </aside>
  );
}

export default function Details() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DetailsForm>({
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
  const [saveFailed, setSaveFailed] = useState(false);

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

  const goToStep = (step: number) => {
    // A search still in flight belongs to the question being left.
    window.clearTimeout(searchTimer.current);
    latestSearch.current += 1;
    setIsSearching(false);
    setCitySuggestions([]);
    setUniversitySuggestions([]);
    setSaveFailed(false);
    setCurrentStep(step);
  };

  const handleCompleteProfile = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSaveFailed(false);

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
        setSaveFailed(true);
        return;
      }

      router.push("/skills");
    } catch (error) {
      console.error("Error saving profile details:", error);
      setIsSubmitting(false);
      setSaveFailed(true);
    }
  };

  const canContinueByStep = [
    Boolean(formData.firstName && formData.lastName),
    Boolean(formData.email),
    Boolean(formData.location),
    Boolean(formData.jobTitle.trim()),
    Boolean(formData.school.trim() && formData.startYear && formData.endYear),
    Boolean(formData.degree.trim() && formData.field.trim()),
  ];
  const canContinue = canContinueByStep[currentStep - 1];
  const isLastStep = currentStep === TOTAL_STEPS;
  const question = QUESTIONS[currentStep - 1];

  const handleSubmitStep = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canContinue) return;
    if (isLastStep) void handleCompleteProfile();
    else goToStep(currentStep + 1);
  };

  const emailHint = isLoadingEmail
    ? "Looking for the email on your GitHub profile…"
    : formData.email
      ? question.hint
      : "We couldn’t read an email from GitHub, so type the one you want visitors to use.";

  return (
    <main className="mx-auto grid w-full max-w-[1180px] flex-1 items-center gap-14 px-5 pb-20 pt-6 sm:px-10 lg:grid-cols-[minmax(0,1fr)_400px]">
      <form onSubmit={handleSubmitStep} noValidate className="w-full max-w-[540px]">
        <p className="text-[15px] font-semibold text-ink-soft">
          Question {currentStep} of {TOTAL_STEPS}
        </p>
        <div className="mt-3 h-1 w-[220px] max-w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-ink transition-[width] duration-500 ease-out"
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        <div key={currentStep} className="ob-step mt-9">
          <h1 className="font-display text-[38px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[52px]">
            {question.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">{currentStep === 2 ? emailHint : question.hint}</p>

          <div className="mt-9 space-y-5">
            {currentStep === 1 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  id="firstName"
                  label="First name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Ada"
                  autoComplete="given-name"
                  autoFocus
                />
                <Field
                  id="lastName"
                  label="Last name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Lovelace"
                  autoComplete="family-name"
                />
              </div>
            )}

            {currentStep === 2 && (
              <Field
                id="email"
                label="Email address"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={isLoadingEmail ? "Loading…" : "you@example.com"}
                disabled={isLoadingEmail}
                loading={isLoadingEmail}
                autoComplete="off"
                autoFocus
              />
            )}

            {currentStep === 3 && (
              <div>
                <Field
                  id="location"
                  label="City"
                  value={formData.location}
                  onChange={(e) => searchWhileTyping(e, searchCities, setCitySuggestions)}
                  placeholder="Bengaluru"
                  autoComplete="off"
                  loading={isSearching}
                  autoFocus
                />
                {citySuggestions.length > 0 && (
                  <SuggestionList
                    items={citySuggestions}
                    onSelect={(city) => {
                      setFormData((prev) => ({ ...prev, location: city }));
                      setCitySuggestions([]);
                    }}
                  />
                )}
              </div>
            )}

            {currentStep === 4 && (
              <Field
                id="jobTitle"
                label="Most recent job title"
                value={formData.jobTitle}
                onChange={handleInputChange}
                placeholder="Software Engineer"
                autoComplete="off"
                autoFocus
              />
            )}

            {currentStep === 5 && (
              <>
                <div>
                  <Field
                    id="school"
                    label="School, college or university"
                    value={formData.school}
                    onChange={(e) => searchWhileTyping(e, getUniversities, setUniversitySuggestions)}
                    placeholder="Stanford University"
                    autoComplete="off"
                    loading={isSearching}
                    autoFocus
                  />
                  {universitySuggestions.length > 0 && (
                    <SuggestionList
                      items={universitySuggestions}
                      onSelect={(university) => {
                        setFormData((prev) => ({ ...prev, school: university }));
                        setUniversitySuggestions([]);
                      }}
                    />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <Field
                    id="startYear"
                    label="Start year"
                    value={formData.startYear}
                    onChange={handleInputChange}
                    placeholder="2018"
                    inputMode="numeric"
                    autoComplete="off"
                  />
                  <Field
                    id="endYear"
                    label="End year"
                    value={formData.endYear}
                    onChange={handleInputChange}
                    placeholder="2022"
                    inputMode="numeric"
                    autoComplete="off"
                  />
                </div>
              </>
            )}

            {currentStep === 6 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  id="degree"
                  label="Degree"
                  value={formData.degree}
                  onChange={handleInputChange}
                  placeholder="Bachelor of Technology"
                  autoComplete="off"
                  autoFocus
                />
                <Field
                  id="field"
                  label="Field of study"
                  value={formData.field}
                  onChange={handleInputChange}
                  placeholder="Computer Science"
                  autoComplete="off"
                />
              </div>
            )}
          </div>
        </div>

        {saveFailed && (
          <p role="alert" className="mt-6 text-[15px] font-medium text-danger">
            Your details weren’t saved. Check your connection and try again.
          </p>
        )}

        <div className="mt-9 flex items-center gap-3">
          {currentStep > 1 && (
            <Button variant="secondary" onClick={() => goToStep(currentStep - 1)} disabled={isSubmitting}>
              <ArrowLeft aria-hidden="true" />
              Back
            </Button>
          )}
          <Button type="submit" disabled={!canContinue || isSubmitting}>
            {isSubmitting ? (
              <>
                <ButtonSpinner />
                Saving…
              </>
            ) : isLastStep ? (
              "Save and continue"
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </form>

      <DraftSheet form={formData} activeStep={currentStep} />
    </main>
  );
}
