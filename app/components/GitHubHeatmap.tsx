"use client";

import { motion } from "framer-motion";
import { Github, LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "../context/UserContext";

type ContributionDay = {
  contributionCount: number;
  date: string;
  weekday: number;
};

type ContributionCalendar = {
  totalContributions: number;
  weeks: Array<{ contributionDays: ContributionDay[] }>;
};

type ContributionResponse = {
  success: boolean;
  visible?: boolean;
  available?: boolean;
  contributionYear?: number;
  currentYearContributions?: number;
  calendar?: ContributionCalendar;
};

const contributionLevels = [
  "bg-white/[0.035]",
  "bg-zinc-800",
  "bg-zinc-700",
  "bg-zinc-500",
  "bg-zinc-300",
];

const getContributionLevel = (count: number) => {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
};

const formatUtcDate = (date: Date) => date.toISOString().slice(0, 10);

const includeUtcToday = (calendar: ContributionCalendar) => {
  const weeks = calendar.weeks.map((week) => ({
    contributionDays: [...week.contributionDays],
  }));
  const lastWeek = weeks.at(-1);
  const latestDay = lastWeek?.contributionDays.at(-1);
  if (!latestDay) return calendar;

  const today = new Date();
  const todayKey = formatUtcDate(today);
  if (latestDay.date >= todayKey) return calendar;

  const cursor = new Date(`${latestDay.date}T00:00:00.000Z`);
  const missingDayCount = Math.round(
    (new Date(`${todayKey}T00:00:00.000Z`).getTime() - cursor.getTime()) /
      86_400_000,
  );
  if (missingDayCount < 1 || missingDayCount > 7) return calendar;

  for (let index = 0; index < missingDayCount; index += 1) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    const day: ContributionDay = {
      contributionCount: 0,
      date: formatUtcDate(cursor),
      weekday: cursor.getUTCDay(),
    };
    const currentWeek = weeks.at(-1);
    if (!currentWeek || day.weekday === 0) {
      weeks.push({ contributionDays: [day] });
    } else {
      currentWeek.contributionDays.push(day);
    }
  }

  return { ...calendar, weeks };
};

export default function GitHubHeatmap() {
  const { isOwner, portfolioApiUrl } = useUser();
  const [visible, setVisible] = useState(true);
  const [available, setAvailable] = useState(true);
  const [calendar, setCalendar] = useState<ContributionCalendar | null>(null);
  const [contributionYear, setContributionYear] = useState<number | null>(null);
  const [currentYearContributions, setCurrentYearContributions] = useState<
    number | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadContributions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(portfolioApiUrl("/api/github/contributions"), {
        credentials: "include",
      });
      if (!response.ok) {
        setAvailable(false);
        return;
      }
      const data = (await response.json()) as ContributionResponse;
      setVisible(Boolean(data.visible));
      setAvailable(data.available !== false);
      setContributionYear(data.contributionYear ?? null);
      setCurrentYearContributions(data.currentYearContributions ?? null);
      setCalendar(data.calendar ? includeUtcToday(data.calendar) : null);
    } catch (error) {
      console.error("Unable to load GitHub activity", error);
      setAvailable(false);
    } finally {
      setLoading(false);
    }
  }, [portfolioApiUrl]);

  useEffect(() => {
    void loadContributions();
  }, [loadContributions]);

  const updateVisibility = async () => {
    if (!isOwner || saving) return;
    const nextVisible = !visible;
    setSaving(true);
    try {
      const response = await fetch("/api/github/contributions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ visible: nextVisible }),
      });
      if (!response.ok) return;
      setVisible(nextVisible);
    } finally {
      setSaving(false);
    }
  };

  if (!isOwner && !loading && !visible) return null;

  return (
    <section className="profile-accent-green profile-section-rule w-full border-t pt-8">
      <motion.div
        {...{
          className:
            "profile-card profile-surface-neutral profile-card-lift w-full overflow-hidden rounded-3xl border p-5 shadow-xl shadow-black/20 sm:p-7",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="profile-section-label flex items-center gap-3 text-xs font-medium uppercase tracking-[0.22em]">
            <span className="profile-icon inline-flex rounded-lg border p-2">
              <Github className="h-4 w-4" />
            </span>
            GitHub activity
          </p>

          {isOwner && (
            <button
              type="button"
              role="switch"
              aria-checked={visible}
              disabled={saving}
              onClick={updateVisibility}
              className="inline-flex items-center gap-2.5 rounded-full bg-black/20 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-black/30 hover:text-white disabled:cursor-wait disabled:opacity-60"
            >
              <span>{visible ? "Shown publicly" : "Hidden publicly"}</span>
              <span className={`relative h-5 w-9 rounded-full border shadow-inner ring-1 ring-black/30 transition-colors ${visible ? "border-white/30 bg-zinc-600" : "border-white/10 bg-zinc-800"}`}>
                <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full border border-zinc-300 bg-white shadow-md transition-transform duration-200 ${visible ? "translate-x-4" : "translate-x-0"}`} />
              </span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="mt-7 flex h-36 items-center justify-center rounded-2xl border border-white/10 bg-black/15 text-zinc-500">
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Loading activity
          </div>
        ) : !visible ? (
          <div className="mt-7 rounded-2xl border border-dashed border-white/10 bg-black/15 px-5 py-10 text-center text-sm text-zinc-500">
            This heatmap is hidden from public visitors.
          </div>
        ) : !available || !calendar ? (
          <div className="mt-7 rounded-2xl border border-dashed border-white/10 bg-black/15 px-5 py-10 text-center text-sm text-zinc-500">
            GitHub contribution activity is currently unavailable.
          </div>
        ) : (
          <>
            <div className="mt-8 overflow-x-auto">
              <div className="flex w-full min-w-[760px] gap-2 px-1.5 py-2">
                <div className="grid grid-rows-7 gap-1 pr-1 text-[9px] text-zinc-600">
                  {["", "Mon", "", "Wed", "", "Fri", ""].map((label, index) => (
                    <span key={`${label}-${index}`} className="flex w-5 items-center justify-end">
                      {label}
                    </span>
                  ))}
                </div>
                <div
                  className="grid min-w-0 flex-1 gap-1"
                  style={{ gridTemplateColumns: `repeat(${calendar.weeks.length}, minmax(10px, 1fr))` }}
                >
                  {calendar.weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-rows-7 gap-1">
                      {week.contributionDays.map((day) => (
                        <span
                          key={day.date}
                          className={`relative aspect-square w-full rounded-[3px] border border-white/[0.05] transition-transform duration-150 hover:z-10 hover:scale-125 ${contributionLevels[getContributionLevel(day.contributionCount)]}`}
                          title={`${day.contributionCount} contributions on ${day.date}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-white/[0.08] pt-4 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                {(currentYearContributions ?? calendar.totalContributions).toLocaleString()} contributions in{" "}
                {contributionYear ?? new Date().getUTCFullYear()}
              </span>
              <div className="flex items-center gap-2" aria-label="Contribution intensity from less to more">
                <span>Less</span>
                <span className="flex gap-1">
                  {contributionLevels.map((color, index) => (
                    <span
                      key={color}
                      className={`h-3 w-3 rounded-[3px] border border-white/[0.06] ${color}`}
                      title={index === 0 ? "No contributions" : `Intensity level ${index}`}
                    />
                  ))}
                </span>
                <span>More</span>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </section>
  );
}
