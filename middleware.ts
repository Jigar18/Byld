import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";

const PROTECTED_ROOT_PAGES = new Set([
  "app-install",
  "app-installed",
  "details",
  "profile-picture",
  "skills",
]);

function isPublicPage(pathname: string) {
  if (pathname === "/" || pathname === "/login") return true;

  const rootPage = pathname.match(/^\/([^/]+)\/?$/);
  return Boolean(rootPage && !PROTECTED_ROOT_PAGES.has(rootPage[1]));
}

export async function middleware(req: NextRequest) {
  const legacyPortfolio = req.nextUrl.pathname.match(/^\/user\/([^/]+)\/?$/);
  if (legacyPortfolio) {
    return NextResponse.redirect(new URL(`/${legacyPortfolio[1]}`, req.url), 308);
  }

  if (isPublicPage(req.nextUrl.pathname)) return NextResponse.next();

  const session = await getSession(req);
  if (session) return NextResponse.next();

  return NextResponse.redirect(new URL("/login", req.url));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
