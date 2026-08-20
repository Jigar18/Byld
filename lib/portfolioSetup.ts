import { db } from "@/lib/db";

type PortfolioSetup = {
  details: {
    imageUrl: string | null;
  } | null;
};

export function hasCompletedPortfolioSetup(user: PortfolioSetup) {
  // The profile image is saved by the final onboarding step. Profile fields
  // and skills remain editable afterwards, so they cannot reliably represent
  // whether the portfolio was already created.
  return Boolean(user.details?.imageUrl?.trim());
}

export async function getCompletedPortfolioUsername(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      username: true,
      details: { select: { imageUrl: true } },
    },
  });

  if (!user) return undefined;
  return hasCompletedPortfolioSetup(user) ? user.username : null;
}
