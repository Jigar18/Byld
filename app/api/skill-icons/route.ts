import { NextRequest, NextResponse } from "next/server";

interface IconifySearchResponse {
  icons?: string[];
}

const preferredIcons: Record<string, string[]> = {
  react: ["devicon:react", "logos:react", "skill-icons:react-dark"],
  reactjs: ["devicon:react", "logos:react", "skill-icons:react-dark"],
  nextjs: ["devicon:nextjs", "logos:nextjs-icon", "skill-icons:nextjs-dark"],
  typescript: ["devicon:typescript", "logos:typescript-icon", "skill-icons:typescript"],
  javascript: ["devicon:javascript", "logos:javascript", "skill-icons:javascript"],
  java: ["devicon:java", "logos:java", "skill-icons:java-dark"],
  spring: ["devicon:spring", "logos:spring-icon", "skill-icons:spring-dark"],
  springboot: ["devicon:spring", "logos:spring-icon", "skill-icons:spring-dark"],
  springsecurity: ["devicon:spring", "logos:spring-icon", "skill-icons:spring-dark"],
  git: ["devicon:git", "logos:git-icon", "skill-icons:git"],
  github: ["devicon:github", "logos:github-icon", "skill-icons:github-dark"],
  docker: ["devicon:docker", "logos:docker-icon", "skill-icons:docker"],
  postgresql: ["devicon:postgresql", "logos:postgresql", "skill-icons:postgresql-dark"],
  sqlserver: ["devicon:microsoftsqlserver", "logos:microsoft", "devicon:azuresqldatabase"],
};

const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const rankIcon = (icon: string, skill: string) => {
  const [, rawName = ""] = icon.split(":");
  const name = normalise(
    rawName.replace(/(?:-icon|-original|-plain|-wordmark|-dark|-light)$/g, "")
  );
  const target = normalise(skill);
  let score = 0;

  if (name === target) score += 100;
  else if (name.startsWith(target) || target.startsWith(name)) score += 60;
  else if (name.includes(target) || target.includes(name)) score += 35;

  if (icon.startsWith("logos:")) score += 8;
  if (icon.startsWith("devicon:")) score += 6;
  if (icon.includes("wordmark")) score -= 20;
  return score;
};

export async function GET(req: NextRequest) {
  const skill = req.nextUrl.searchParams.get("skill")?.trim() ?? "";
  if (skill.length < 2 || skill.length > 80) {
    return NextResponse.json({ icons: [] });
  }

  const key = normalise(skill);
  const preferred = preferredIcons[key] ?? [];

  try {
    const terms = Array.from(
      new Set([skill, skill.replace(/\s+/g, ""), skill.split(/\s+/)[0]])
    ).filter((term) => term.length >= 2);
    const responses = await Promise.allSettled(
      terms.map(async (term) => {
        const url = new URL("https://api.iconify.design/search");
        url.searchParams.set("query", term);
        url.searchParams.set("prefixes", "logos,devicon,skill-icons");
        url.searchParams.set("limit", "32");
        const response = await fetch(url, {
          next: { revalidate: 86400 },
          signal: AbortSignal.timeout(5_000),
        });
        if (!response.ok) return [];
        const data = (await response.json()) as IconifySearchResponse;
        return data.icons ?? [];
      })
    );

    const searched = responses.flatMap((result) =>
      result.status === "fulfilled" ? result.value : []
    );
    const icons = Array.from(new Set([...preferred, ...searched]))
      .filter((icon) => /^(logos|devicon|skill-icons):[a-z0-9-]+$/.test(icon))
      .sort((a, b) => {
        const preferredDifference = preferred.indexOf(a) - preferred.indexOf(b);
        if (preferred.includes(a) && preferred.includes(b)) return preferredDifference;
        if (preferred.includes(a)) return -1;
        if (preferred.includes(b)) return 1;
        return rankIcon(b, skill) - rankIcon(a, skill);
      })
      .slice(0, 3);

    return NextResponse.json({ icons });
  } catch {
    return NextResponse.json({ icons: preferred.slice(0, 3) });
  }
}
