import { NextRequest } from "next/server";

type RorOrganization = {
    names?: Array<{ types: string[]; value: string }>;
    locations?: Array<{ geonames_details?: { country_name?: string } }>;
};

export async function GET(req: NextRequest) {
    const {searchParams} = new URL(req.url);
    const name = searchParams.get("name")?.trim() || "";
    if (name.length < 2 || name.length > 100) {
        return Response.json([]);
    }

    try {
        const url = new URL("https://api.ror.org/v2/organizations");
        url.searchParams.set("query", name);
        url.searchParams.set("filter", "types:education");

        const res = await fetch(url, {
            headers: { Accept: "application/json" },
            next: { revalidate: 86_400 },
            signal: AbortSignal.timeout(5_000),
        });
        if (!res.ok) throw new Error("University provider failed");

        const body = await res.json() as { items?: RorOrganization[] };
        const universities = (body.items ?? []).flatMap((organization) => {
            const displayName = organization.names?.find(({ types }) => types.includes("ror_display"))?.value;
            if (!displayName) return [];

            return [{
                name: displayName,
                country: organization.locations?.[0]?.geonames_details?.country_name ?? "",
            }];
        });

        return Response.json(universities);
    } catch {
        return Response.json({ error: "Unable to search universities" }, { status: 502 });
    }
}
