"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { ButtonSpinner } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUser } from "../context/UserContext";
import { contributionLevels } from "./contributionHeatmapStyles";
import PortfolioSection from "./PortfolioSection";

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

// Fixed 11px days: a year of them fits the content column at full width, and narrower screens scroll.
const weekColumnsClass = "grid flex-1 grid-cols-[repeat(var(--heatmap-weeks),11px)] justify-between gap-x-[3px]";
const dayRowsClass = "grid grid-rows-[repeat(7,11px)] gap-[3px]";
const noticeClass = "grid min-h-36 place-items-center px-4 text-center text-[15px] text-ink-soft";

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
  const [visibilityFailed, setVisibilityFailed] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

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
    setVisibilityFailed(false);
    try {
      const response = await fetch("/api/github/contributions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ visible: nextVisible }),
      });
      if (!response.ok) throw new Error("Failed to update heatmap visibility");
      setVisible(nextVisible);
    } catch (error) {
      console.error("Unable to update GitHub heatmap visibility", error);
      setVisibilityFailed(true);
    } finally {
      setSaving(false);
    }
  };

  // Where the year does not fit, start at the most recent weeks; older ones are a scroll to the left.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) scroller.scrollLeft = scroller.scrollWidth;
  }, [calendar, visible]);

  if (!isOwner && !loading && !visible) return null;

  return (
    <PortfolioSection
      id="activity"
      title="Activity"
      action={
        isOwner && (
          <button
            type="button"
            role="switch"
            aria-checked={visible}
            disabled={saving}
            onClick={updateVisibility}
            className="inline-flex h-9 items-center gap-2.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink disabled:cursor-wait disabled:opacity-60"
          >
            <span>{visible ? "Shown to visitors" : "Hidden from visitors"}</span>
            <span
              aria-hidden="true"
              className={cn("relative h-[22px] w-10 rounded-full transition-colors duration-200", visible ? "bg-brand" : "bg-ink/25")}
            >
              <span
                className={cn(
                  "absolute left-0.5 top-0.5 size-[18px] rounded-full bg-white shadow-sm transition-transform duration-200",
                  visible && "translate-x-[18px]",
                )}
              />
            </span>
          </button>
        )
      }
    >
      {visibilityFailed && (
        <p role="alert" className="mb-5 text-[15px] font-medium text-danger">
          That setting wasn’t saved. Check your connection and try again.
        </p>
      )}

      <div className="ui-sheet overflow-hidden rounded-[24px] p-5 sm:p-7">
        {loading ? (
          <p role="status" className={cn(noticeClass, "grid-flow-col content-center justify-center gap-2.5")}>
            <ButtonSpinner />
            Loading activity…
          </p>
        ) : !visible ? (
          <p className={noticeClass}>Visitors don’t see your GitHub activity. Turn it on to show the last year of contributions.</p>
        ) : !available || !calendar ? (
          <p className={noticeClass}>GitHub activity is unavailable right now.</p>
        ) : (
          <>
            <div ref={scrollerRef} className="ui-scroll-quiet overflow-x-auto">
              <div
                className="w-max min-w-full"
                style={{ "--heatmap-weeks": calendar.weeks.length } as CSSProperties}
              >
                <div className="mb-2 flex gap-2">
                  <div className="w-7 shrink-0" aria-hidden="true" />
                  <div className={cn(weekColumnsClass, "text-[11px] text-ink-soft")}>
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
                <div className="flex gap-2">
                  <div
                    aria-hidden="true"
                    className={cn(dayRowsClass, "w-7 shrink-0 text-[11px] leading-none text-ink-soft")}
                  >
                    {["", "Mon", "", "Wed", "", "Fri", ""].map((label, index) => (
                      <span key={`${label}-${index}`} className="flex items-center">
                        {label}
                      </span>
                    ))}
                  </div>
                  <div className={weekColumnsClass}>
                    {calendar.weeks.map((week, weekIndex) => (
                      <div key={weekIndex} className={dayRowsClass}>
                        {week.contributionDays.map((day) => (
                          <span
                            key={day.date}
                            className={cn("size-[11px] rounded-[3px]", contributionLevels[getContributionLevel(day)])}
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

            <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-sheet-line pt-4 text-sm text-ink-soft">
              <p>
                <span className="font-semibold tabular-nums text-ink">
                  {(currentYearContributions ?? calendar.totalContributions).toLocaleString()}
                </span>{" "}
                contributions on GitHub in {contributionYear ?? new Date().getUTCFullYear()}
              </p>
              <div className="flex items-center gap-2">
                <span>Less</span>
                <span aria-hidden="true" className="flex gap-1.5">
                  {contributionLevels.map((color) => (
                    <span key={color} className={cn("size-[11px] rounded-[3px]", color)} />
                  ))}
                </span>
                <span>More</span>
              </div>
            </div>
          </>
        )}
      </div>
    </PortfolioSection>
  );
}
