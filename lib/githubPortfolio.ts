const GITHUB_HEADERS = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

export type GitHubRepository = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  fork: boolean;
  archived: boolean;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  pushed_at: string | null;
  owner: { login: string };
};

type RepositoryPage = { repositories?: GitHubRepository[] };

async function githubFetch<T>(url: string, token: string, accept = GITHUB_HEADERS.Accept) {
  const response = await fetch(url, {
    headers: { ...GITHUB_HEADERS, Accept: accept, Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`GitHub request failed with ${response.status}`);
  return response.json() as Promise<T>;
}

export async function listInstallationRepositories(token: string) {
  const repositories: GitHubRepository[] = [];
  for (let page = 1; page <= 10; page += 1) {
    const data = await githubFetch<RepositoryPage>(
      `https://api.github.com/installation/repositories?per_page=100&page=${page}`,
      token,
    );
    const current = data.repositories ?? [];
    repositories.push(...current);
    if (current.length < 100) break;
  }
  return repositories;
}

const topicNames: Record<string, string> = {
  react: "React",
  nextjs: "Next.js",
  "next-js": "Next.js",
  typescript: "TypeScript",
  javascript: "JavaScript",
  nodejs: "Node.js",
  "node-js": "Node.js",
  express: "Express",
  tailwindcss: "Tailwind CSS",
  "tailwind-css": "Tailwind CSS",
  spring: "Spring",
  "spring-boot": "Spring Boot",
  docker: "Docker",
  kubernetes: "Kubernetes",
  postgresql: "PostgreSQL",
  mongodb: "MongoDB",
  redis: "Redis",
  prisma: "Prisma",
  firebase: "Firebase",
  supabase: "Supabase",
  graphql: "GraphQL",
};

export const topicSkills = (topics: string[]) =>
  topics.map((topic) => topicNames[topic.toLowerCase()]).filter((skill): skill is string => Boolean(skill));

export async function getRepositoryLanguages(token: string, repository: GitHubRepository) {
  try {
    return await githubFetch<Record<string, number>>(
      `https://api.github.com/repos/${repository.full_name}/languages`,
      token,
    );
  } catch {
    return repository.language ? { [repository.language]: 1 } : {};
  }
}

export async function getRepositoryReadmeSummary(token: string, repository: GitHubRepository) {
  try {
    const response = await fetch(`https://api.github.com/repos/${repository.full_name}/readme`, {
      headers: {
        ...GITHUB_HEADERS,
        Accept: "application/vnd.github.raw+json",
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return null;
    const raw = await response.text();
    const paragraph = raw
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .split(/\n\s*\n/)
      .map((part) => part.replace(/^#{1,6}\s+/gm, "").replace(/\s+/g, " ").trim())
      .find((part) => part.length >= 40 && !part.startsWith("[") && !part.includes("shields.io"));
    return paragraph ? paragraph.slice(0, 900) : null;
  } catch {
    return null;
  }
}

export function repositoryTitle(name: string) {
  return name
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
