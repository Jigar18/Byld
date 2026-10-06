"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import OnboardingStatus from "../OnboardingStatus";

const INSTALL_URL =
  process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL ??
  "https://github.com/apps/byld-portfolio/installations/new";

export default function InstallApp() {
  const router = useRouter();
  const [checkFailed, setCheckFailed] = useState(false);

  const checkInstallation = useCallback(async () => {
    setCheckFailed(false);

    let response: Response;
    try {
      response = await fetch("/api/github/installations");
    } catch {
      setCheckFailed(true);
      return;
    }

    if (response.status === 401) {
      router.replace("/login");
      return;
    }

    if (!response.ok) {
      setCheckFailed(true);
      return;
    }

    const data = (await response.json()) as { installations: unknown[] };
    if (data.installations.length > 0) {
      router.replace("/details");
    } else {
      window.location.assign(INSTALL_URL);
    }
  }, [router]);

  useEffect(() => {
    void checkInstallation();
  }, [checkInstallation]);

  if (checkFailed) {
    return (
      <OnboardingStatus title="We could not check GitHub App access." detail="Please try again.">
        <Button className="mt-7" onClick={() => void checkInstallation()}>
          Try again
        </Button>
      </OnboardingStatus>
    );
  }

  return (
    <OnboardingStatus
      working
      title="Checking your GitHub App access…"
      detail="If Byldit isn’t installed yet, GitHub opens next so you can pick the repositories it may read."
    />
  );
}
