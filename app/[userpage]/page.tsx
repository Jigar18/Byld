import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import PortfolioPageClient from "./PortfolioPageClient";

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ userpage: string }>;
}) {
  const { userpage } = await params;
  const username = decodeURIComponent(userpage);
  const portfolio = await db.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
    select: { details: { select: { id: true } } },
  });

  if (!portfolio?.details) notFound();
  return <PortfolioPageClient />;
}
