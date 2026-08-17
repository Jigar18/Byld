import { University } from "@/types/api";

export async function getUniversities(query: string): Promise<string[]> {
    try {
        const response = await fetch(`/api/universities?name=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error("University search failed");
        }
        const data = await response.json() as University[] | { error?: string; msg?: string };
        if (!Array.isArray(data)) throw new Error(data.msg ?? data.error ?? "University search failed");

        const universities = data.map((university: University) =>
            university.country ? `${university.name}, ${university.country}` : university.name
        );

        return universities.sort((a, b) => {
            const aStartsWith = a.toLowerCase().startsWith(query.toLowerCase());
            const bStartsWith = b.toLowerCase().startsWith(query.toLowerCase());
            if (aStartsWith && !bStartsWith) return -1;
            if (!aStartsWith && bStartsWith) return 1;
            return a.localeCompare(b);
        }).slice(0, 6);
    }
    catch (error) {
        console.error("Error fetching universities:", error);
        return [];
    }
}
