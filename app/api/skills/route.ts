import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("skill")?.trim() ?? "";
  if (query.length < 2 || query.length > 80) {
    return NextResponse.json([]);
  }

  try {
    const response = await fetch(
      `https://api.github.com/search/topics?q=${encodeURIComponent(query)}&per_page=8`,
      {
        headers: { Accept: "application/vnd.github+json", "User-Agent": "portfolio-creator" },
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(5_000),
      }
    );
    if (!response.ok) throw new Error("GitHub topics lookup failed");
    const body = (await response.json()) as { items?: Array<{ name?: string }> };
    return NextResponse.json(
      (body.items ?? []).flatMap((item) => {
        const skill = item.name?.replace(/-/g, " ");
        return skill ? [skill.charAt(0).toUpperCase() + skill.slice(1)] : [];
      })
    );
  } catch {
    return NextResponse.json([]);
  }
}
