import { NextRequest, NextResponse } from "next/server";
import { getInstallationAccessToken } from "@/lib/accessToken";
import { getRepositoryLanguages, listInstallationRepositories, topicSkills } from "@/lib/githubPortfolio";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    const token = await getInstallationAccessToken(request);
    const repositories = (await listInstallationRepositories(token))
      .filter((repo) => !repo.fork && !repo.archived && repo.owner.login.toLowerCase() === session.username.toLowerCase())
      .sort((a, b) => (b.pushed_at ?? "").localeCompare(a.pushed_at ?? ""))
      .slice(0, 20);
    const languageSets = await Promise.all(repositories.map((repo) => getRepositoryLanguages(token, repo)));
    const scores = new Map<string, number>();
    languageSets.forEach((languages) => {
      Object.entries(languages).forEach(([language, bytes]) => scores.set(language, (scores.get(language) ?? 0) + bytes));
    });
    const topicWeight = Math.max(1, Math.max(0, ...scores.values()) * 0.08);
    repositories.flatMap((repo) => topicSkills(repo.topics ?? [])).forEach((skill) => {
      scores.set(skill, (scores.get(skill) ?? 0) + topicWeight);
    });
    const skills = [...scores.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([skill]) => skill);
    return NextResponse.json({ skills, repositoryCount: repositories.length });
  } catch {
    return NextResponse.json({ skills: [], repositoryCount: 0 });
  }
}
