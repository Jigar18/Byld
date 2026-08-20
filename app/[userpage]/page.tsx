import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { cache } from "react";
import { loadPortfolioData } from "@/lib/portfolioData";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import PortfolioPageClient from "./PortfolioPageClient";

type PortfolioPageProps = {
  params: Promise<{ userpage: string }>;
};

const getPortfolio = cache(loadPortfolioData);

export async function generateMetadata({
  params,
}: PortfolioPageProps): Promise<Metadata> {
  const { userpage } = await params;
  const portfolio = await getPortfolio(decodeURIComponent(userpage));

  return portfolio
    ? { title: `Portfolio - ${portfolio.username}` }
    : {};
}

export default async function PortfolioPage({
  params,
}: PortfolioPageProps) {
  const { userpage } = await params;
  const username = decodeURIComponent(userpage);
  const portfolio = await getPortfolio(username);

  if (!portfolio) notFound();
  const cookieStore = await cookies();
  const session = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  const { id, ...publicPortfolio } = portfolio;

  return (
    <PortfolioPageClient
      initialData={{ ...publicPortfolio, isOwner: session?.userId === id }}
    />
  );
}
