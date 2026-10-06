"use client";

import { type PointerEvent, useEffect, useMemo, useRef, useState } from "react";
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

const summarizeCalendar = (calendar: ContributionCalendar) => {
  let longestStreak = 0;
  let streak = 0;
  let busiestDay: ContributionDay | undefined;
  for (const day of calendar.weeks.flatMap((week) => week.contributionDays)) {
    streak = day.contributionCount > 0 ? streak + 1 : 0;
    longestStreak = Math.max(longestStreak, streak);
    if (day.contributionCount > (busiestDay?.contributionCount ?? 0)) busiestDay = day;
  }
  return { longestStreak, busiestDay };
};

const formatDay = (date: string, withYear = true) =>
  new Date(`${date}T00:00:00.000Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: withYear ? "numeric" : undefined,
    timeZone: "UTC",
  });

const countContributions = (count: number) =>
  count === 0 ? "No contributions" : `${count.toLocaleString()} ${count === 1 ? "contribution" : "contributions"}`;

// Narrower than this and the days get too small to point at, so the year scrolls sideways instead.
const MIN_WEEK_WIDTH = 14;
const DAY_LABEL_WIDTH = 34;
const noticeClass = "grid min-h-40 place-items-center rounded-[22px] bg-well px-5 text-center text-[15px] text-ink-soft";
const statRowClass = "flex items-baseline justify-between gap-4";

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
  const [pointedDay, setPointedDay] = useState<{ date: string; count: number } | null>(null);
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

  // Built once per calendar: pointing at a day re-renders the readout, not the year of squares.
  const dayCells = useMemo(
    () =>
      calendar?.weeks.flatMap((week, weekIndex) =>
        week.contributionDays.map((day) => (
          <span
            key={day.date}
            data-date={day.date}
            data-count={day.contributionCount}
            className={cn(
              "aspect-square rounded-[3px] transition-transform duration-150 hover:scale-[1.2] motion-reduce:transform-none",
              contributionLevels[getContributionLevel(day)],
            )}
            style={{ gridColumnStart: weekIndex + 2, gridRowStart: day.weekday + 2 }}
          />
        )),
      ),
    [calendar],
  );
  const summary = useMemo(() => (calendar ? summarizeCalendar(calendar) : null), [calendar]);

  const readPointedDay = (event: PointerEvent<HTMLDivElement>) => {
    const cell = (event.target as HTMLElement).closest<HTMLElement>("[data-date]");
    // Moving across the gap between two days keeps the last one, so the readout does not flicker.
    if (cell?.dataset.date) setPointedDay({ date: cell.dataset.date, count: Number(cell.dataset.count) });
  };

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

      {loading ? (
        <p role="status" className={cn(noticeClass, "grid-flow-col content-center justify-center gap-2.5")}>
          <ButtonSpinner />
          Loading activity…
        </p>
      ) : !visible ? (
        <p className={noticeClass}>Visitors don’t see your GitHub activity. Turn it on to show the last year of contributions.</p>
      ) : !available || !calendar || !summary ? (
        <p className={noticeClass}>GitHub activity is unavailable right now.</p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[212px_minmax(0,1fr)] lg:gap-12">
          <div className="flex flex-wrap items-end gap-x-12 gap-y-5 lg:flex-col lg:flex-nowrap lg:items-stretch lg:gap-y-7">
            <p>
              <span className="block font-display text-[58px] font-semibold leading-[0.9] tracking-[-0.04em] tabular-nums">
                {(currentYearContributions ?? calendar.totalContributions).toLocaleString()}
              </span>
              <span className="mt-2.5 block text-ink-soft">
                contributions on GitHub in {contributionYear ?? new Date().getUTCFullYear()}
              </span>
            </p>
            <dl className="grid min-w-[212px] flex-1 gap-2 text-[15px] lg:flex-none">
              <div className={statRowClass}>
                <dt className="text-ink-soft">Last 12 months</dt>
                <dd className="font-semibold tabular-nums">{calendar.totalContributions.toLocaleString()}</dd>
              </div>
              <div className={statRowClass}>
                <dt className="text-ink-soft">Longest streak</dt>
                <dd className="font-semibold tabular-nums">
                  {summary.longestStreak} {summary.longestStreak === 1 ? "day" : "days"}
                </dd>
              </div>
              {summary.busiestDay && (
                <div className={statRowClass}>
                  <dt className="text-ink-soft">Busiest day</dt>
                  <dd className="font-semibold tabular-nums">
                    {summary.busiestDay.contributionCount} on {formatDay(summary.busiestDay.date, false)}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="min-w-0">
            {/* The padding leaves room for a pointed-at day to grow without being cut off by the scroller. */}
            <div ref={scrollerRef} className="ui-scroll-quiet -m-1 overflow-x-auto p-1">
              <div
                role="img"
                aria-label={`GitHub contributions, day by day, over the last 12 months: ${calendar.totalContributions.toLocaleString()} in total.`}
                onPointerOver={readPointedDay}
                onPointerLeave={() => setPointedDay(null)}
                className="grid w-full gap-[3px]"
                style={{
                  gridTemplateColumns: `auto repeat(${calendar.weeks.length}, minmax(0, 1fr))`,
                  minWidth: calendar.weeks.length * MIN_WEEK_WIDTH + DAY_LABEL_WIDTH,
                }}
              >
                {getMonthLabels(calendar).map(({ label, weekIndex }) => (
                  <span
                    key={`${label}-${weekIndex}`}
                    // Zero width, so a label never widens the week it sits above.
                    className="mb-1 w-0 whitespace-nowrap text-xs text-ink-soft"
                    style={{ gridColumnStart: weekIndex + 2, gridRowStart: 1 }}
                  >
                    {label}
                  </span>
                ))}
                {["Mon", "Wed", "Fri"].map((label, index) => (
                  <span
                    key={label}
                    className="flex items-center pr-2 text-xs leading-none text-ink-soft"
                    style={{ gridColumnStart: 1, gridRowStart: index * 2 + 3 }}
                  >
                    {label}
                  </span>
                ))}
                {dayCells}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-sm text-ink-soft">
              <p>
                {pointedDay ? (
                  <>
                    <span className="font-semibold text-ink">{countContributions(pointedDay.count)}</span> on{" "}
                    {formatDay(pointedDay.date)}
                  </>
                ) : (
                  "Each square is a day. Pick one to see its count."
                )}
              </p>
              <div className="flex items-center gap-2">
                <span>Less</span>
                <span aria-hidden="true" className="flex gap-1">
                  {contributionLevels.map((color) => (
                    <span key={color} className={cn("size-3 rounded-[3px]", color)} />
                  ))}
                </span>
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </PortfolioSection>
  );
}
