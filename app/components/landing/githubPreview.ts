export type PreviewProject = {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
};

export type PortfolioPreview = {
  username: string;
  name: string;
  role: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  avatarUrl: string | null;
  followers: number;
  projects: PreviewProject[];
  skills: string[];
  // Work history, education and certificates never come from GitHub, so only the sample has them.
  isSample: boolean;
};

export const samplePortfolio: PortfolioPreview = {
  username: "miracastell",
  name: "Mira Castell",
  role: "Full-stack developer",
  bio: "I build tools for people who work on the water. Mostly TypeScript and Rust, sometimes hardware.",
  location: "Lisbon",
  company: "Harbor Labs",
  avatarUrl: null,
  followers: 1280,
  projects: [
    { name: "tidewatch", description: "Tide and swell alerts for small harbours, sent by SMS.", language: "TypeScript", stars: 412 },
    { name: "ledgerline", description: "Double-entry bookkeeping as a Postgres extension.", language: "Rust", stars: 1240 },
    { name: "buoy", description: "A small CLI that keeps long-running jobs afloat.", language: "Go", stars: 96 },
  ],
  skills: ["TypeScript", "Rust", "Go", "PostgreSQL", "React", "Docker", "GraphQL", "AWS"],
  isSample: true,
};

export const languageColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572a5",
  Go: "#00add8",
  Rust: "#dea584",
  Java: "#b07219",
  Kotlin: "#a97bff",
  Swift: "#f05138",
  C: "#8a8f98",
  "C++": "#f34b7d",
  "C#": "#2fa043",
  Ruby: "#cc342d",
  PHP: "#7a86b8",
  Dart: "#00b4ab",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#8a63d2",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  "Jupyter Notebook": "#da5b0b",
};

export const GITHUB_USERNAME = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

// Carries a message written for the visitor, unlike a raw network failure.
export class GitHubPreviewError extends Error {}

type GitHubUser = {
  login: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  avatar_url: string;
  followers: number;
};

type GitHubRepository = {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
};

export async function fetchGitHubPreview(username: string, signal: AbortSignal): Promise<PortfolioPreview> {
  const request = { headers: { Accept: "application/vnd.github+json" }, signal };
  const [userResponse, repositoriesResponse] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`, request),
    fetch(`https://api.github.com/users/${username}/repos?type=owner&sort=pushed&per_page=100`, request),
  ]);

  if (userResponse.status === 404) throw new GitHubPreviewError(`No GitHub user is named ${username}.`);
  if (userResponse.status === 403 || userResponse.status === 429) {
    throw new GitHubPreviewError("GitHub is rate limiting this network. Try again in a few minutes.");
  }
  if (!userResponse.ok) throw new GitHubPreviewError("GitHub didn’t respond. Try again.");

  const user = (await userResponse.json()) as GitHubUser;
  const repositories = repositoriesResponse.ok ? ((await repositoriesResponse.json()) as GitHubRepository[]) : [];
  const ownWork = repositories.filter((repository) => !repository.fork);

  const repositoriesPerLanguage = new Map<string, number>();
  for (const { language } of ownWork) {
    if (language) repositoriesPerLanguage.set(language, (repositoriesPerLanguage.get(language) ?? 0) + 1);
  }

  return {
    username: user.login,
    name: user.name ?? user.login,
    role: null,
    bio: user.bio,
    location: user.location,
    company: user.company?.replace(/^@/, "") ?? null,
    avatarUrl: user.avatar_url,
    followers: user.followers,
    // The sort is stable, so equally starred repositories stay in most-recently-pushed order.
    projects: [...ownWork]
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 3)
      .map((repository) => ({
        name: repository.name,
        description: repository.description,
        language: repository.language,
        stars: repository.stargazers_count,
      })),
    skills: [...repositoriesPerLanguage]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([language]) => language),
    isSample: false,
  };
}
