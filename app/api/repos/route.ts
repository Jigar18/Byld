import { NextRequest, NextResponse } from "next/server";
import { getInstallationAccessToken } from "@/lib/accessToken";
import { listInstallationRepositories } from "@/lib/githubPortfolio";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const accessToken = await getInstallationAccessToken(req);
    const [repositories, imported] = await Promise.all([
      listInstallationRepositories(accessToken),
      db.project.findMany({ where: { userId: session.userId, githubUrl: { not: null } }, select: { githubUrl: true } }),
    ]);
    const importedUrls = new Set(imported.map((project) => project.githubUrl));
    return NextResponse.json({
      repositories: repositories
        .filter((repo) => !repo.archived)
        .sort((a, b) => (b.pushed_at ?? "").localeCompare(a.pushed_at ?? ""))
        .map((repo) => ({
          id: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          private: repo.private,
          language: repo.language,
          updatedAt: repo.pushed_at,
          imported: importedUrls.has(repo.html_url),
        })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch repositories";
    const status = message.includes("Authentication") ? 401 : message.includes("installation") ? 404 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
