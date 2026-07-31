"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import CurrentOrganization from "../components/CurrentOrganization";
import NameBlock from "../components/NameBlock";
import ProfileImage from "../components/ProfileImage";
import {
  Edit3,
  X,
  Save,
  User,
  Mail,
  MapPin,
  Briefcase,
  Building,
  Camera,
} from "lucide-react";
import { Button, primaryActionButtonClass, secondaryActionButtonClass } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ProfileImageModal from "../components/ProfileImageModal";
import { useUser } from "../context/UserContext";

function InfoCard() {
  const { userDetails, isOwner, updateUserDetails, refreshUserDetails } = useUser();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Temporary form state
  const [tempDetails, setTempDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    location: "",
    jobTitle: "",
    college: "",
  });

  const [tempImagePreview, setTempImagePreview] = useState<string>("");

  // Validate form fields
  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!tempDetails.firstName.trim()) {
      errors.push("First name is required");
    }

    if (!tempDetails.lastName.trim()) {
      errors.push("Last name is required");
    }

    if (tempDetails.email && !/\S+@\S+\.\S+/.test(tempDetails.email)) {
      errors.push("Please enter a valid email address");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleImageEditModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleOpenModal = () => {
    if (userDetails) {
      setTempDetails({
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        email: userDetails.email,
        location: userDetails.location,
        jobTitle: userDetails.jobTitle,
        college: userDetails.college,
      });
      setTempImagePreview(userDetails.imageUrl);
    }
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setTempDetails({
      firstName: "",
      lastName: "",
      email: "",
      location: "",
      jobTitle: "",
      college: "",
    });
    setTempImagePreview("");
    setIsEditModalOpen(false);
  };

  const handleImageChange = async (newImageUrl: string) => {
    setTempImagePreview(newImageUrl);
    updateUserDetails({ imageUrl: newImageUrl });
    await refreshUserDetails();
    setIsModalOpen(false);
  };

  const handleSaveChanges = async () => {
    // Validate form before saving
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      // Update user details
      const response = await fetch("/api/updateUserDetails", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...tempDetails,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the global state with the new details
        updateUserDetails({
          ...tempDetails,
          imageUrl: tempImagePreview || userDetails?.imageUrl || "",
        });

        handleCloseModal();
      } else {
        console.error("Failed to update user details:", data.error);
      }
    } catch (error) {
      console.error("Error updating user details:", error);
    } finally {
      setSaving(false);
    }
  };
  return (
    <>
      <motion.div
        {...{
          className:
            "relative group w-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-9 before:pointer-events-none before:absolute before:inset-x-12 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent",
        }}
        whileHover={{ y: -3, boxShadow: "0 24px 80px rgba(0, 0, 0, 0.38)" }}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      >
        {/* Edit Button */}
        {isOwner && <button
          className="absolute right-3 top-3 p-2 rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-300 hover:text-white border border-slate-600 opacity-100 sm:right-4 sm:top-4 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 hover:scale-105"
          onClick={handleOpenModal}
          type="button"
          title="Edit profile information"
        >
          <Edit3 className="h-4 w-4" />
        </button>}

        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 text-center sm:text-left">
          <div className="flex min-w-0 flex-col sm:flex-row items-center gap-6">
            <ProfileImage />
            <NameBlock />
          </div>
          <CurrentOrganization />
        </div>
      </motion.div>

      {/* Edit Modal */}
      {typeof window !== "undefined" &&
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
                  Edit Profile Information
                </h2>

                <div className="space-y-6 max-h-96 overflow-y-auto">
                  {/* Validation Errors */}
                  {validationErrors.length > 0 && (
                    <div className="bg-zinc-900/20 border border-zinc-500/30 rounded-lg p-3">
                      <ul className="text-zinc-300 text-sm space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Profile Image Section */}
                  <div className="space-y-2">
                    <Label className="text-slate-300 font-medium flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Profile Picture
                    </Label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-600">
                        <img
                          src={
                            tempImagePreview ||
                            userDetails?.imageUrl ||
                            "/placeholder.png"
                          }
                          alt="Profile Preview"
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div>
                        {/* <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="profile-image-input"
                        /> */}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleImageEditModal}
                          className="bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-300 hover:text-slate-100"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Change Picture
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="firstName"
                        className="text-slate-300 font-medium flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        value={tempDetails.firstName}
                        onChange={(e) => {
                          setTempDetails((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }));
                          if (validationErrors.length > 0) {
                            setValidationErrors([]);
                          }
                        }}
                        className="w-full px-4 py-3 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 bg-slate-800 text-slate-200"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="lastName"
                        className="text-slate-300 font-medium"
                      >
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        value={tempDetails.lastName}
                        onChange={(e) => {
                          setTempDetails((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }));
                          // Clear validation errors when user types
                          if (validationErrors.length > 0) {
                            setValidationErrors([]);
                          }
                        }}
                        className="w-full px-4 py-3 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 bg-slate-800 text-slate-200"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-slate-300 font-medium flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={tempDetails.email}
                      onChange={(e) => {
                        setTempDetails((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }));
                        // Clear validation errors when user types
                        if (validationErrors.length > 0) {
                          setValidationErrors([]);
                        }
                      }}
                      className="w-full px-4 py-3 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 bg-slate-800 text-slate-200"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  {/* Job Title */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="jobTitle"
                      className="text-slate-300 font-medium flex items-center gap-2"
                    >
                      <Briefcase className="h-4 w-4" />
                      Job Title
                    </Label>
                    <Input
                      id="jobTitle"
                      value={tempDetails.jobTitle}
                      onChange={(e) =>
                        setTempDetails((prev) => ({
                          ...prev,
                          jobTitle: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 bg-slate-800 text-slate-200"
                      placeholder="e.g., Software Engineer"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="location"
                      className="text-slate-300 font-medium flex items-center gap-2"
                    >
                      <MapPin className="h-4 w-4" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={tempDetails.location}
                      onChange={(e) =>
                        setTempDetails((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 bg-slate-800 text-slate-200"
                      placeholder="City, Country"
                    />
                  </div>

                  {/* College/Organization */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="college"
                      className="text-slate-300 font-medium flex items-center gap-2"
                    >
                      <Building className="h-4 w-4" />
                      College/Organization
                    </Label>
                    <Input
                      id="college"
                      value={tempDetails.college}
                      onChange={(e) =>
                        setTempDetails((prev) => ({
                          ...prev,
                          college: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 bg-slate-800 text-slate-200"
                      placeholder="e.g., University of Technology"
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <Button
                    variant="outline"
                    onClick={handleCloseModal}
                    className={secondaryActionButtonClass}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveChanges}
                    disabled={
                      saving ||
                      !tempDetails.firstName ||
                      !tempDetails.lastName ||
                      validationErrors.length > 0
                    }
                    className={primaryActionButtonClass}
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
            <ProfileImageModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onImageChange={handleImageChange}
              currentImage={
                tempImagePreview || userDetails?.imageUrl || "/placeholder.png"
              }
            />
          </div>,
          document.body
        )}
    </>
  );
}

export default InfoCard;
