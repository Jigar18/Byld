"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { PortfolioDetails, PortfolioInitialData } from "@/types/portfolio";

type SkillIconMap = PortfolioInitialData["iconMap"];

interface UserContextType {
  userDetails: PortfolioDetails;
  isOwner: boolean;
  portfolioUsername: string;
  portfolioData: PortfolioInitialData;
  portfolioApiUrl: (path: string) => string;
  updateUserDetails: (details: Partial<PortfolioDetails>) => void;
  // Shared by the Skills card and the project editor, which both change them.
  skills: string[];
  setSkills: (skills: string[]) => void;
  skillIcons: SkillIconMap;
  setSkillIcons: (icons: SkillIconMap) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const capitalizeFirst = (skill: string) => skill.charAt(0).toUpperCase() + skill.slice(1);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
  initialData: PortfolioInitialData;
}

export const UserProvider = ({ children, initialData }: UserProviderProps) => {
  const portfolioUsername = initialData.username;
  const [userDetails, setUserDetails] = useState(initialData.details);
  const [skills, setSkillList] = useState(() => initialData.skills.map(capitalizeFirst));
  const [skillIcons, setSkillIcons] = useState(initialData.iconMap);

  const portfolioApiUrl = useCallback((path: string) => {
    const separator = path.includes("?") ? "&" : "?";
    return `${path}${separator}username=${encodeURIComponent(portfolioUsername)}`;
  }, [portfolioUsername]);

  const updateUserDetails = useCallback((details: Partial<PortfolioDetails>) => {
    setUserDetails((prev) => ({ ...prev, ...details }));
  }, []);

  const setSkills = useCallback((next: string[]) => setSkillList(next.map(capitalizeFirst)), []);

  const value: UserContextType = {
    userDetails,
    isOwner: initialData.isOwner,
    portfolioUsername,
    portfolioData: initialData,
    portfolioApiUrl,
    updateUserDetails,
    skills,
    setSkills,
    skillIcons,
    setSkillIcons,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
