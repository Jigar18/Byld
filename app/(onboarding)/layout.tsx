import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCompletedPortfolioUsername } from "@/lib/portfolioSetup";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import BrandMark from "../components/BrandMark";
import ThemeToggle from "../components/ThemeToggle";
import OnboardingStages from "./OnboardingStages";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/login");

  const username = await getCompletedPortfolioUsername(session.userId);
  if (username === undefined) redirect("/login");
  if (username) {
    redirect(`/${encodeURIComponent(username)}`);
  }

  return (
    <div className="relative flex min-h-dvh flex-col">
      <div
        aria-hidden="true"
        className="ui-dots pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_left,black,transparent_72%)]"
      />
      <header className="relative flex items-center justify-between gap-4 px-5 py-5 sm:px-10">
        <BrandMark name="from-sm" />
        <OnboardingStages />
        <ThemeToggle />
      </header>
      <div className="relative flex flex-1 flex-col">{children}</div>
    </div>
  );
}
