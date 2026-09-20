"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type { PortfolioDetails, PortfolioInitialData } from "@/types/portfolio";

interface UserContextType {
  userDetails: PortfolioDetails | null;
  loading: boolean;
  isOwner: boolean;
  portfolioUsername: string;
  portfolioData: PortfolioInitialData;
  portfolioApiUrl: (path: string) => string;
  updateUserDetails: (details: Partial<PortfolioDetails>) => void;
  refreshUserDetails: () => Promise<void>;
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
  const [userDetails, setUserDetails] = useState<PortfolioDetails | null>(initialData.details);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(initialData.isOwner);

  const portfolioApiUrl = useCallback((path: string) => {
    if (!portfolioUsername) return path;
    const separator = path.includes("?") ? "&" : "?";
    return `${path}${separator}username=${encodeURIComponent(portfolioUsername)}`;
  }, [portfolioUsername]);

  const refreshUserDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(portfolioApiUrl("/api/getUserDetails"), {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.details) {
          setIsOwner(Boolean(data.isOwner));
          setUserDetails({
            firstName: data.details.firstName || "",
            lastName: data.details.lastName || "",
            email: data.details.email || "",
            location: data.details.location || "",
            jobTitle: data.details.jobTitle || "",
            college: data.details.college || "",
            imageUrl: data.details.imageUrl || "",
            about: data.details.about || "",
          });
        }
      } else {
        setUserDetails(null);
        setIsOwner(false);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLoading(false);
    }
  }, [portfolioApiUrl]);

  const updateUserDetails = useCallback((details: Partial<PortfolioDetails>) => {
    setUserDetails((prev) => (prev ? { ...prev, ...details } : null));
  }, []);

  const value: UserContextType = {
    userDetails,
    loading,
    isOwner,
    portfolioUsername,
    portfolioData: initialData,
    portfolioApiUrl,
    updateUserDetails,
    refreshUserDetails,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
