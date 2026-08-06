import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getInstallationAccessToken } from "@/lib/accessToken";
import {
  getRepositoryLanguages,
  getRepositoryReadmeSummary,
  listInstallationRepositories,
  repositoryTitle,
  topicSkills,
} from "@/lib/githubPortfolio";
import { getSession } from "@/lib/session";

const MAX_PROJECTS = 4;

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    const body = (await request.json()) as { repositoryId?: unknown };
    const repositoryId = Number(body.repositoryId);
    if (!Number.isInteger(repositoryId)) return NextResponse.json({ error: "Choose a GitHub repository" }, { status: 400 });
    if (await db.project.count({ where: { userId: session.userId } }) >= MAX_PROJECTS) {
      return NextResponse.json({ error: `A maximum of ${MAX_PROJECTS} projects is allowed` }, { status: 409 });
    }

    const token = await getInstallationAccessToken(request);
    const repository = (await listInstallationRepositories(token)).find((repo) => repo.id === repositoryId);
    if (!repository) return NextResponse.json({ error: "This repository is not available to the GitHub App" }, { status: 404 });
    if (await db.project.findFirst({ where: { userId: session.userId, githubUrl: repository.html_url } })) {
      return NextResponse.json({ error: "This repository is already in your portfolio" }, { status: 409 });
    }

    const [languages, readmeSummary] = await Promise.all([
      getRepositoryLanguages(token, repository),
      repository.description ? Promise.resolve(null) : getRepositoryReadmeSummary(token, repository),
    ]);
    const techStack = Array.from(new Set([
      ...Object.entries(languages).sort((a, b) => b[1] - a[1]).map(([language]) => language),
      ...topicSkills(repository.topics ?? []),
    ])).slice(0, 8);
    const description = repository.description?.trim() || readmeSummary ||
      `${repositoryTitle(repository.name)} is a ${techStack[0] ? `${techStack[0]} ` : ""}project imported from GitHub.`;
    const project = await db.project.create({
      data: {
        userId: session.userId,
        title: repositoryTitle(repository.name),
        description,
        techStack,
        githubUrl: repository.html_url,
        liveUrl: repository.homepage?.trim() || null,
      },
    });
    return NextResponse.json({ project }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "The GitHub project could not be imported" }, { status: 502 });
  }
}
