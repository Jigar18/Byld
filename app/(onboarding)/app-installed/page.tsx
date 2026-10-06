"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import OnboardingStatus from "../OnboardingStatus";

export default function AppInstalledPage() {
  const router = useRouter();
  useEffect(() => {
    const timer = window.setTimeout(() => router.replace("/details"), 1200);
    return () => window.clearTimeout(timer);
  }, [router]);

  return <OnboardingStatus working title="GitHub App installed." detail="Preparing your profile…" />;
}
