import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hasCompletedPortfolioSetup } from "@/lib/portfolioSetup";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      username: true,
      details: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          location: true,
          jobTitle: true,
          college: true,
          startYear: true,
          endYear: true,
          imageUrl: true,
        },
      },
      skills: { select: { skills: true } },
    },
  });

  if (!user) redirect("/login");
  if (hasCompletedPortfolioSetup(user)) {
    redirect(`/${encodeURIComponent(user.username)}`);
  }

  return children;
}
