"use client";

import { motion } from "framer-motion";
import { Github, LoaderCircle } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { contributionLevels } from "./contributionHeatmapStyles";

type ContributionDay = {
  contributionCount: number;
  contributionLevel?: ContributionLevel;
  date: string;
  weekday: number;
};

type ContributionLevel =
  | "NONE"
  | "FIRST_QUARTILE"
  | "SECOND_QUARTILE"
  | "THIRD_QUARTILE"
  | "FOURTH_QUARTILE";

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

const contributionLevelIndexes: Record<ContributionLevel, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const getContributionLevel = (day: ContributionDay) => {
  if (day.contributionLevel) return contributionLevelIndexes[day.contributionLevel];

  const count = day.contributionCount;
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
      contributionLevel: "NONE",
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

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const getMonthLabels = (calendar: ContributionCalendar) =>
  calendar.weeks.flatMap((week, weekIndex) => {
    const firstOfMonth = week.contributionDays.find(
      (day) => new Date(`${day.date}T00:00:00.000Z`).getUTCDate() === 1,
    );
    const labelDay = firstOfMonth ?? (weekIndex === 0 ? week.contributionDays[0] : undefined);
    if (!labelDay) return [];

    return [{
      label: monthNames[new Date(`${labelDay.date}T00:00:00.000Z`).getUTCMonth()],
      weekIndex,
    }];
  });

export default function GitHubHeatmap() {
  const { isOwner, portfolioApiUrl, portfolioData } = useUser();
  // Visitors never load (or see) a heatmap the owner has hidden.
  const [visible, setVisible] = useState(portfolioData.showGitHubHeatmap);
  const shouldLoad = isOwner || portfolioData.showGitHubHeatmap;
  const [available, setAvailable] = useState(true);
  const [calendar, setCalendar] = useState<ContributionCalendar | null>(null);
  const [contributionYear, setContributionYear] = useState<number | null>(null);
  const [currentYearContributions, setCurrentYearContributions] = useState<
    number | null
  >(null);
  const [loading, setLoading] = useState(shouldLoad);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!shouldLoad) return;
    const loadContributions = async () => {
      try {
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
    };
    void loadContributions();
  }, [portfolioApiUrl, shouldLoad]);

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
      if (response.ok) setVisible(nextVisible);
    } catch (error) {
      console.error("Unable to update GitHub heatmap visibility", error);
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
            <div className="mt-6 overflow-x-auto">
              <div
                className="w-[920px] px-1.5 py-2 sm:w-full sm:min-w-[760px]"
                style={{ "--heatmap-weeks": calendar.weeks.length } as CSSProperties}
              >
                <div className="mb-2 flex gap-2 pl-1">
                  <div className="w-5 shrink-0 pr-1" aria-hidden="true" />
                  <div
                    className="grid min-w-0 flex-1 grid-cols-[repeat(var(--heatmap-weeks),12px)] gap-x-[4.5px] text-[9px] text-zinc-600 sm:grid-cols-[repeat(var(--heatmap-weeks),minmax(10px,1fr))]"
                  >
                    {getMonthLabels(calendar).map(({ label, weekIndex }) => (
                      <span
                        key={`${label}-${weekIndex}`}
                        className="whitespace-nowrap"
                        style={{ gridColumnStart: weekIndex + 1 }}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pl-1">
                  <div className="grid w-5 shrink-0 grid-rows-[repeat(7,12px)] gap-[4.5px] pr-1 text-[9px] text-zinc-600 sm:grid-rows-7">
                    {["", "Mon", "", "Wed", "", "Fri", ""].map((label, index) => (
                      <span key={`${label}-${index}`} className="flex items-center justify-end">
                        {label}
                      </span>
                    ))}
                  </div>
                  <div
                    className="grid min-w-0 flex-1 grid-cols-[repeat(var(--heatmap-weeks),12px)] gap-[4.5px] sm:grid-cols-[repeat(var(--heatmap-weeks),minmax(10px,1fr))]"
                  >
                    {calendar.weeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="grid grid-rows-[repeat(7,12px)] gap-[4.5px] sm:grid-rows-7">
                        {week.contributionDays.map((day) => (
                          <span
                            key={day.date}
                            className={`relative h-3 w-3 rounded-[2.5px] border border-white/[0.05] transition-transform duration-150 hover:z-10 hover:scale-125 sm:aspect-square sm:h-auto sm:w-full ${contributionLevels[getContributionLevel(day)]}`}
                            style={{ gridRowStart: day.weekday + 1 }}
                            title={`${day.contributionCount} contributions on ${day.date}`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
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
                <span className="flex gap-1.5">
                  {contributionLevels.map((color, index) => (
                    <span
                      key={color}
                      className={`h-3 w-3 rounded-[2.5px] border border-white/[0.06] ${color}`}
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
