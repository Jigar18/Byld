import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/db";
import PortfolioPageClient from "./PortfolioPageClient";

type PortfolioPageProps = {
  params: Promise<{ userpage: string }>;
};

const getPortfolio = cache((username: string) =>
  db.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
    select: { username: true, details: { select: { id: true } } },
  }),
);

export async function generateMetadata({
  params,
}: PortfolioPageProps): Promise<Metadata> {
  const { userpage } = await params;
  const portfolio = await getPortfolio(decodeURIComponent(userpage));

  return portfolio?.details
    ? { title: `Portfolio - ${portfolio.username}` }
    : {};
}

export default async function PortfolioPage({
  params,
}: PortfolioPageProps) {
  const { userpage } = await params;
  const username = decodeURIComponent(userpage);
  const portfolio = await getPortfolio(username);

  if (!portfolio?.details) notFound();
  return <PortfolioPageClient />;
}
