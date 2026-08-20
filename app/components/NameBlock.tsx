"use client";

import { motion } from "framer-motion";
import { useUser } from "../context/UserContext";

export default function NameBlock() {
  const { userDetails, loading } = useUser();

  // Helper function to capitalize first letter of each word
  const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center sm:items-start">
        <div className="h-10 w-48 bg-slate-700 rounded animate-pulse mb-2"></div>
        <div className="h-6 w-32 bg-slate-700 rounded animate-pulse"></div>
      </div>
    );
  }

  const displayName = [userDetails?.firstName, userDetails?.lastName]
    .filter((value): value is string => Boolean(value))
    .map(capitalizeWords)
    .join(" ") || "Your name";

  const displayJobTitle = userDetails?.jobTitle
    ? capitalizeWords(userDetails.jobTitle)
    : "Add a professional title";

  const displayLocation = userDetails?.location || "";

  return (
    <div className="flex min-w-0 flex-col items-start">
      <motion.h1
        {...{ className: "portfolio-display max-w-full truncate text-xl font-bold text-slate-100 sm:whitespace-normal sm:text-4xl" }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {displayName}
      </motion.h1>
      {displayLocation && <motion.p
        {...{ className: "mt-0.5 max-w-full truncate text-xs text-zinc-400 sm:mt-1 sm:whitespace-normal sm:text-lg" }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {displayJobTitle}
      </motion.p>}
      <motion.p
        {...{
          className: "mt-0.5 flex max-w-full items-center gap-1 truncate text-[11px] text-slate-400 sm:mt-1 sm:text-sm",
        }}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <svg
          className="h-3 w-3 shrink-0 sm:h-4 sm:w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        {displayLocation}
      </motion.p>
    </div>
  );
}
