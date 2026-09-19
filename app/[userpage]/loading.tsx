"use client";

import { useParams } from "next/navigation";
import PortfolioLoader from "../components/PortfolioLoader";

export default function PortfolioLoading() {
  const { userpage } = useParams<{ userpage: string }>();

  return <PortfolioLoader username={userpage} />;
}
