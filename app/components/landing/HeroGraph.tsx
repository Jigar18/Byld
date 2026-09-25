const WEEKS = 53;
const DAYS = 7;
// Weeks outside this range are hidden on narrow screens so the cells stay legible.
const MOBILE_FIRST_WEEK = 6;
const MOBILE_LAST_WEEK = 46;

// 5-row pixel letters, drawn the way people draw words into their GitHub graph.
const glyphs: Record<string, string[]> = {
  B: ["###.", "#..#", "###.", "#..#", "###."],
  Y: ["#...#", ".#.#.", "..#..", "..#..", "..#.."],
  L: ["#...", "#...", "#...", "#...", "####"],
  D: ["###.", "#..#", "#..#", "#..#", "###."],
  I: ["###", ".#.", ".#.", ".#.", "###"],
  T: ["#####", "..#..", "..#..", "..#..", "..#.."],
};

const WORD = "BYLDIT";
const LETTER_GAP = 2;
const wordWidth = [...WORD].reduce((sum, letter) => sum + glyphs[letter][0].length, 0) + LETTER_GAP * (WORD.length - 1);
const wordStart = Math.floor((WEEKS - wordWidth) / 2);

const marks = new Set<string>();
let column = wordStart;
for (const letter of WORD) {
  const rows = glyphs[letter];
  rows.forEach((row, rowIndex) => {
    [...row].forEach((pixel, pixelIndex) => {
      if (pixel === "#") marks.add(`${column + pixelIndex}:${rowIndex + 1}`);
    });
  });
  column += rows[0].length + LETTER_GAP;
}

function random(week: number, day: number, salt = 0) {
  const x = Math.sin(week * 12.9898 + day * 78.233 + salt * 37.719) * 43758.5453;
  return x - Math.floor(x);
}

// Activity gets denser over the year, and quieter behind the letters so they read.
function levelFor(week: number, day: number): number {
  if (marks.has(`${week}:${day}`)) return 4;
  const behindWord = week >= wordStart - 1 && week <= wordStart + wordWidth && day >= 1 && day <= 5;
  const density = behindWord ? 0.14 : 0.3 + 0.4 * (week / WEEKS);
  if (random(week, day) > density) return 0;
  const intensity = random(week, day, 1);
  if (behindWord) return 1;
  return intensity < 0.55 ? 1 : intensity < 0.85 ? 2 : 3;
}

const contributionsPerLevel = [0, 2, 5, 9, 14];

export default function HeroGraph() {
  const today = new Date();
  const weeks = Array.from({ length: WEEKS }, (_, week) => {
    const start = new Date(today);
    start.setDate(today.getDate() - (WEEKS - 1 - week) * 7 - today.getDay());
    return { start, levels: Array.from({ length: DAYS }, (_, day) => levelFor(week, day)) };
  });
  const total = weeks.reduce((sum, week) => sum + week.levels.reduce((s, level) => s + contributionsPerLevel[level], 0), 0);

  return (
    <figure className="relative">
      <div
        className="grid grid-cols-[repeat(41,minmax(0,1fr))] gap-[clamp(3px,0.42vw,5px)] sm:grid-cols-[repeat(53,minmax(0,1fr))]"
        role="img"
        aria-label={`A year of GitHub contributions with the word Byldit drawn into it, ${total.toLocaleString("en-US")} contributions in total`}
      >
        {weeks.map(({ start, levels }, week) => {
          const previous = weeks[week - 1]?.start;
          const month = week > 0 && previous && previous.getMonth() !== start.getMonth()
            ? start.toLocaleString("en-US", { month: "short" })
            : "";
          const mobileHidden = week < MOBILE_FIRST_WEEK || week > MOBILE_LAST_WEEK;
          return (
            <div key={week} className={`${mobileHidden ? "hidden sm:grid" : "grid"} grid-cols-[minmax(0,1fr)] grid-rows-[auto_repeat(7,minmax(0,1fr))] gap-[inherit]`}>
              <span className="byld-fade h-4 overflow-visible whitespace-nowrap text-[10px] leading-none text-[#6B6F75] sm:text-[11px]" style={{ "--t": `${700 + week * 16}ms` } as React.CSSProperties}>{month}</span>
              {levels.map((level, day) => {
                const isMark = level === 4;
                const style = {
                  "--t": `${450 + week * 18 + day * 7}ms`,
                  "--m": `${1500 + (week - wordStart) * 22 + day * 10}ms`,
                } as React.CSSProperties;
                return <span key={day} data-l={level} className={`byld-cell ${isMark ? "is-mark" : ""}`} style={style} />;
              })}
            </div>
          );
        })}
      </div>
      <figcaption className="byld-fade mt-4 flex items-center justify-between gap-4 text-[12px] text-[#8E9197] sm:text-[13px]" style={{ "--t": "1900ms" } as React.CSSProperties}>
        <span>{total.toLocaleString("en-US")} contributions in the last year</span>
        <span className="hidden items-center gap-1.5 sm:flex" aria-hidden="true">
          Less
          {[0, 1, 2, 3, 4].map((level) => <i key={level} data-l={level} className="byld-cell h-3 w-3 [animation:none]" />)}
          More
        </span>
      </figcaption>
    </figure>
  );
}
