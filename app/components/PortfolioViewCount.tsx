"use client";

import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useUser } from "../context/UserContext";

const VISITOR_STORAGE_KEY = "portfolio_anonymous_visitor_id";

function getAnonymousVisitorId() {
  const existing = window.localStorage.getItem(VISITOR_STORAGE_KEY);
  if (existing) return existing;
  const visitorId = window.crypto.randomUUID();
  window.localStorage.setItem(VISITOR_STORAGE_KEY, visitorId);
  return visitorId;
}

export default function PortfolioViewCount() {
  const { portfolioUsername } = useUser();
  const [count, setCount] = useState<number | null>(null);
  const requested = useRef(false);

  useEffect(() => {
    if (!portfolioUsername || requested.current) return;
    requested.current = true;

    const recordView = async () => {
      try {
        const response = await fetch(
          `/api/portfolio-views?username=${encodeURIComponent(portfolioUsername)}`,
          {
            method: "POST",
            credentials: "include",
            headers: { "x-portfolio-visitor-id": getAnonymousVisitorId() },
          }
        );
        if (!response.ok) return;
        const data = (await response.json()) as { count?: number };
        if (typeof data.count === "number") setCount(data.count);
      } catch (error) {
        console.error("Unable to load portfolio views", error);
      }
    };

    void recordView();
  }, [portfolioUsername]);

  return (
    <motion.div
      {...{
        className:
          "absolute left-5 top-6 z-10 inline-flex items-center gap-1.5 text-rose-300/55 sm:left-8 lg:left-10 lg:top-8",
        "aria-label": count === null
          ? "Loading unique portfolio views"
          : `${count} unique portfolio views`,
      }}
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Eye className="h-3.5 w-3.5" strokeWidth={1.8} />
      <span className="min-w-3 text-xs font-medium tabular-nums">
        {count ?? "—"}
      </span>
    </motion.div>
  );
}
