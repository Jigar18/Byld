"use client";

import { Eye } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useUser } from "../context/UserContext";

const VISITOR_STORAGE_KEY = "portfolio_anonymous_visitor_id";

function getAnonymousVisitorId() {
  const existing = window.localStorage.getItem(VISITOR_STORAGE_KEY);
  if (existing) return existing;
  const visitorId = window.crypto.randomUUID();
  window.localStorage.setItem(VISITOR_STORAGE_KEY, visitorId);
  return visitorId;
}

export default function PortfolioViewCount({ className }: { className?: string }) {
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
    <div
      role="img"
      aria-label={count === null ? "Loading unique portfolio views" : `${count} unique portfolio views`}
      title="Unique visitors"
      className={cn("tabular-nums", className)}
    >
      <Eye aria-hidden="true" />
      {count === null ? "—" : `${count.toLocaleString("en")} ${count === 1 ? "view" : "views"}`}
    </div>
  );
}
