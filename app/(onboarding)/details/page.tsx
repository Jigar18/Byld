"use client";

import React, { useState, useEffect } from "react";

import { Input } from "@/components/ui/input";
import { Button, primaryActionButtonClass, secondaryActionButtonClass } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { searchCities } from "@/lib/cities";
import { getUniversities } from "@/lib/universities";

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
  "w-full px-3 py-2 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 bg-slate-800 text-slate-200";

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
  });
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [universitySuggestions, setUniversitySuggestions] = useState<string[]>(
    []
  );
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(true);

  const router = useRouter();

  const totalSteps = 5;

  useEffect(() => {
    const fetchGitHubDetails = async () => {
      try {
        const [profileResponse, emailResponse] = await Promise.all([
          fetch("/api/github/profile"),
          fetch("/api/emailFetch"),
        ]);
        const profile = profileResponse.ok
          ? await profileResponse.json() as { firstName?: string; lastName?: string; location?: string }
          : {};
        const email = emailResponse.ok ? await emailResponse.json() as { email?: string } : {};
        setFormData((current) => ({
          ...current,
          firstName: current.firstName || profile.firstName || "",
          lastName: current.lastName || profile.lastName || "",
          location: current.location || profile.location || "",
          email: current.email || email.email || "",
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const debouncedSearch = React.useMemo(
    () => async (query: string) => {
      if (query.length < 2) {
        setCitySuggestions([]);
        return;
      }
      const results = await searchCities(query);
      setCitySuggestions(results);
      setIsSearching(false);
    },
    []
  );

  const debouncedSearchUniversity = React.useMemo(
    () => async (query: string) => {
      if (query.length < 2) {
        setUniversitySuggestions([]);
        return;
      }
      const results = await getUniversities(query);
      setUniversitySuggestions(results);
      setIsSearching(false);
    },
    []
  );

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    handleInputChange(e);
    setIsSearching(true);
    debouncedSearch(value);
  };

  const handleCitySelect = (city: string) => {
    setFormData((prev) => ({ ...prev, location: city }));
    setCitySuggestions([]);
  };

  const handleUniversityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    handleInputChange(e);
    setIsSearching(true);
    debouncedSearchUniversity(value);
  };

  const handleUniversitySelect = (university: string) => {
    setFormData((prev) => ({ ...prev, school: university }));
    setUniversitySuggestions([]);
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  return (
    <>
      <style jsx global>
        {globalStyles}
      </style>

      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 py-12 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-2xl mx-auto bg-slate-900 rounded-xl shadow-xl overflow-hidden border border-slate-800">
          <div className="w-full bg-slate-800 h-2">
            <div
              className="bg-zinc-600 h-2 transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>

          <div className="p-8">
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-bold text-slate-100 mb-2">
                {"Let's fill the details for your portfolio"}
              </h1>
              <p className="text-slate-400">
                Step {currentStep} of {totalSteps}
              </p>
            </div>

            <div className="space-y-8 max-w-xl mx-auto">
              {/* Step 1: Name */}
              <div
                className={`transition-all duration-500 ease-in-out ${
                  currentStep > 1
                    ? "-translate-y-2 opacity-80 scale-98 bg-slate-800/50 rounded-lg p-4"
                    : ""
                }`}
              >
                {currentStep > 1 && (
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-zinc-400 mr-2" />
                      <span className="text-sm font-medium text-slate-300">
                        Personal Information
                      </span>
                    </div>
                    {currentStep === 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={prevStep}
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

                <div
                  className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${
                    currentStep > 1 ? "opacity-70" : ""
                  }`}
                >
                  <div>
                    <Label
                      htmlFor="firstName"
                      className="text-slate-300 font-medium"
                    >
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                      className={inputClassName}
                      disabled={currentStep > 1}
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="lastName"
                      className="text-slate-300 font-medium"
                    >
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={inputClassName}
                      placeholder="Enter your last name"
                      disabled={currentStep > 1}
                    />
                  </div>
                </div>

                {currentStep === 1 && (
                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={nextStep}
                      className={primaryActionButtonClass}
                      disabled={!formData.firstName || !formData.lastName}
                    >
                      Continue
                    </Button>
                  </div>
                )}
              </div>

              {/* Step 2: Email */}
              {currentStep >= 2 && (
                <div
                  className={`transition-all duration-500 ease-in-out transform ${
                    currentStep > 2
                      ? "-translate-y-2 opacity-80 scale-98 bg-slate-800/50 rounded-lg p-4"
                      : "translate-y-0"
                  }`}
                >
                  {currentStep > 2 && (
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-zinc-400 mr-2" />
                        <span className="text-sm font-medium text-slate-300">
                          Email
                        </span>
                      </div>
                      {currentStep === 3 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={prevStep}
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
                  <div className={`${currentStep > 2 ? "opacity-70" : ""}`}>
                    <Label
                      htmlFor="email"
                      className="text-slate-300 font-medium"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={inputClassName}
                      placeholder={
                        isLoadingEmail ? "Loading..." : "Enter your email"
                      }
                      disabled={currentStep > 2 || isLoadingEmail}
                      autoComplete="off"
                    />
                    {isLoadingEmail && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-zinc-400"></div>
                      </div>
                    )}
                    {!isLoadingEmail && !formData.email && (
                      <p className="text-xs text-slate-400 mt-1">
                        Note: You need to be logged in with GitHub to auto-fill
                        your email
                      </p>
                    )}
                  </div>
                  {currentStep === 2 && (
                    <div className="mt-6 flex justify-between">
                      <Button
                        onClick={prevStep}
                        variant="outline"
                        className={secondaryActionButtonClass}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        onClick={nextStep}
                        className={primaryActionButtonClass}
                        disabled={!formData.email}
                      >
                        Continue
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Location */}
              {currentStep >= 3 && (
                <div
                  className={`transition-all duration-500 ease-in-out transform ${
                    currentStep > 3
                      ? "-translate-y-2 opacity-80 scale-98 bg-slate-800/50 rounded-lg p-4"
                      : "translate-y-0"
                  }`}
                >
                  {currentStep > 3 && (
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-zinc-400 mr-2" />
                        <span className="text-sm font-medium text-slate-300">
                          Location
                        </span>
                      </div>
                      {currentStep === 4 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={prevStep}
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

                  <div
                    className={`${
                      currentStep > 3 ? "opacity-70" : ""
                    } relative`}
                  >
                    <Label
                      htmlFor="location"
                      className="text-slate-300 font-medium"
                    >
                      Select your city?
                    </Label>
                    <div className="relative">
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleLocationChange}
                        className={`${inputClassName} ${
                          citySuggestions.length > 0
                            ? "rounded-b-none border-b-0"
                            : ""
                        }`}
                        placeholder="Enter your city"
                        disabled={currentStep > 3}
                        autoComplete="off"
                      />
                      {isSearching && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-zinc-400"></div>
                        </div>
                      )}
                    </div>
                    {citySuggestions.length > 0 && currentStep === 3 && (
                      <div className="absolute left-0 right-0 bg-slate-800 border border-slate-700 rounded-b-md shadow-lg max-h-[180px] overflow-y-auto z-10">
                        <ul className="py-1 divide-y divide-slate-700">
                          {citySuggestions.map((city, index) => (
                            <li
                              key={index}
                              className="px-4 py-2.5 hover:bg-slate-700 cursor-pointer text-slate-200 text-sm transition-colors"
                              onClick={() => handleCitySelect(city)}
                            >
                              {city}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {currentStep === 3 && (
                    <div
                      className={`mt-6 flex justify-between ${
                        citySuggestions.length > 0 ? "pt-48" : ""
                      }`}
                    >
                      <Button
                        onClick={prevStep}
                        variant="outline"
                        className={secondaryActionButtonClass}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        onClick={nextStep}
                        className={primaryActionButtonClass}
                        disabled={!formData.location}
                      >
                        Continue
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Job Title */}
              {currentStep >= 4 && (
                <div
                  className={`transition-all duration-500 ease-in-out transform ${
                    currentStep > 4
                      ? "-translate-y-2 opacity-80 scale-98 bg-slate-800/50 rounded-lg p-4"
                      : "translate-y-0"
                  }`}
                >
                  {currentStep > 4 && (
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-zinc-400 mr-2" />
                        <span className="text-sm font-medium text-slate-300">
                          Professional Experience
                        </span>
                      </div>
                      {currentStep === 5 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={prevStep}
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

                  <div className={currentStep > 4 ? "opacity-70" : ""}>
                    <Label
                      htmlFor="jobTitle"
                      className="text-slate-300 font-medium"
                    >
                      Most Recent Job Title
                    </Label>
                    <Input
                      id="jobTitle"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      className={inputClassName}
                      placeholder="e.g. Software Engineer"
                      disabled={currentStep > 4}
                      autoComplete="off"
                    />
                  </div>

                  {currentStep === 4 && (
                    <div className="mt-6 flex justify-between">
                      <Button
                        onClick={prevStep}
                        variant="outline"
                        className={secondaryActionButtonClass}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        onClick={nextStep}
                        className={primaryActionButtonClass}
                        disabled={!formData.jobTitle.trim()}
                      >
                        Continue
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 5: Education */}
              {currentStep >= 5 && (
                <div className="transition-all duration-500 ease-in-out transform translate-y-0">
                  <div className="space-y-6">
                    <div className="relative">
                      <Label
                        htmlFor="school"
                        className="text-slate-300 font-medium"
                      >
                        School or College/University
                      </Label>
                      <div className="relative">
                        <Input
                          id="school"
                          name="school"
                          value={formData.school}
                          onChange={handleUniversityChange}
                          className={`${inputClassName} ${
                            universitySuggestions.length > 0
                              ? "rounded-b-none border-b-0"
                              : ""
                          }`}
                          placeholder="e.g. Stanford University"
                          autoComplete="off"
                        />
                        {isSearching && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-zinc-400"></div>
                          </div>
                        )}
                      </div>
                      {universitySuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 bg-slate-800 border border-slate-700 rounded-b-md shadow-lg max-h-[180px] overflow-y-auto z-10">
                          <ul className="py-1 divide-y divide-slate-700">
                            {universitySuggestions.map((university, index) => (
                              <li
                                key={index}
                                className="px-4 py-2.5 hover:bg-slate-700 cursor-pointer text-slate-200 text-sm transition-colors"
                                onClick={() =>
                                  handleUniversitySelect(university)
                                }
                              >
                                {university}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label
                          htmlFor="startYear"
                          className="text-slate-300 font-medium"
                        >
                          Start Year
                        </Label>
                        <Input
                          id="startYear"
                          name="startYear"
                          value={formData.startYear}
                          onChange={handleInputChange}
                          className={inputClassName}
                          placeholder="e.g. 2018"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="endYear"
                          className="text-slate-300 font-medium"
                        >
                          End Year
                        </Label>
                        <Input
                          id="endYear"
                          name="endYear"
                          onChange={handleInputChange}
                          value={formData.endYear}
                          className={inputClassName}
                          placeholder="e.g. 2022"
                        />
                      </div>
                    </div>
                    <div
                      className={`mt-6 flex justify-between ${
                        universitySuggestions.length > 0 ? "pt-48" : ""
                      }`}
                    >
                      <Button
                        onClick={prevStep}
                        variant="outline"
                        className={secondaryActionButtonClass}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        className={primaryActionButtonClass}
                        disabled={!formData.school || !formData.startYear}
                        onClick={async () => {
                          const response = await fetch("/api/detailsToDB", {
                            method: "POST",
                            headers: {
                              "Content-type": "application/json",
                            },
                            body: JSON.stringify(formData),
                          });
                          if (response.ok) router.push("/skills");
                        }}
                      >
                        Complete Profile
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
