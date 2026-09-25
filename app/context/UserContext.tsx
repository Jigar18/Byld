"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { PortfolioDetails, PortfolioInitialData } from "@/types/portfolio";

interface UserContextType {
  userDetails: PortfolioDetails;
  isOwner: boolean;
  portfolioUsername: string;
  portfolioData: PortfolioInitialData;
  portfolioApiUrl: (path: string) => string;
  updateUserDetails: (details: Partial<PortfolioDetails>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

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

  const portfolioApiUrl = useCallback((path: string) => {
    const separator = path.includes("?") ? "&" : "?";
    return `${path}${separator}username=${encodeURIComponent(portfolioUsername)}`;
  }, [portfolioUsername]);

  const updateUserDetails = useCallback((details: Partial<PortfolioDetails>) => {
    setUserDetails((prev) => ({ ...prev, ...details }));
  }, []);

  const value: UserContextType = {
    userDetails,
    isOwner: initialData.isOwner,
    portfolioUsername,
    portfolioData: initialData,
    portfolioApiUrl,
    updateUserDetails,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
