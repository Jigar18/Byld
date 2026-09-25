"use client";

import { motion } from "framer-motion";
import { useUser } from "../context/UserContext";

export default function CurrentOrganization() {
  const { userDetails } = useUser();

  return (
    <motion.div
      {...{
        className:
          "flex max-w-full items-center gap-1.5 rounded-lg border border-zinc-500/30 bg-zinc-600/20 px-2.5 py-2 sm:gap-2 sm:px-4",
      }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-500/20 sm:h-6 sm:w-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5 text-zinc-400 sm:h-4 sm:w-4"
        >
          <path d="M2 22h20"></path>
          <path d="M18 2H6l-4 4v10h20V6l-4-4Z"></path>
          <path d="M14 2v4h-4V2"></path>
          <path d="M18 16h2"></path>
          <path d="M4 16h2"></path>
          <path d="M10 16h4"></path>
        </svg>
      </div>
      <h2 className="max-w-[5.5rem] truncate text-center text-[11px] font-medium text-zinc-300 sm:max-w-none sm:whitespace-normal sm:text-base">
        {userDetails.college ? userDetails.college.toUpperCase() : "UNIVERSITY"}
      </h2>
    </motion.div>
  );
}
