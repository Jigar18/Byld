"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const INSTALL_URL =
  process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL ??
  "https://github.com/apps/byld-portfolio/installations/new";

export default function InstallApp() {
  const router = useRouter();
  const [message, setMessage] = useState("Checking your GitHub App access…");

  useEffect(() => {
    async function checkInstallation() {
      const response = await fetch("/api/github/installations");
      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        setMessage("We could not check GitHub App access. Please try again.");
        return;
      }

      const data = (await response.json()) as { installations: unknown[] };
      if (data.installations.length > 0) {
        router.replace("/details");
      } else {
        window.location.assign(INSTALL_URL);
      }
    }

    void checkInstallation();
  }, [router]);

  return <main className="grid min-h-screen place-items-center bg-zinc-950 px-6 text-center text-zinc-100"><p className="animate-pulse text-sm tracking-wide text-zinc-400">{message}</p></main>;
}
