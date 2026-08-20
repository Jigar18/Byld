import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCompletedPortfolioUsername } from "@/lib/portfolioSetup";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import LoginPage from "./LoginPage";

export default async function Login() {
  const cookieStore = await cookies();
  const session = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  const username = session && await getCompletedPortfolioUsername(session.userId);
  if (username) redirect(`/${encodeURIComponent(username)}`);

  return <LoginPage />;
}
