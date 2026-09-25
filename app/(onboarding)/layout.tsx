import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCompletedPortfolioUsername } from "@/lib/portfolioSetup";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import AutofillStyles from "./AutofillStyles";

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
    <>
      <AutofillStyles />
      {children}
    </>
  );
}
