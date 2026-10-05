import { Github } from "lucide-react";

export default function GitHubButton({ variant = "ink" }: { variant?: "ink" | "paper" | "compact" }) {
  return (
    // OAuth sets cookies and redirects off-site, so this needs a full navigation.
    // eslint-disable-next-line @next/next/no-html-link-for-pages
    <a href="/api/github/auth" className={`lp-button lp-button-${variant}`}>
      <Github aria-hidden="true" />
      Continue with GitHub
    </a>
  );
}
