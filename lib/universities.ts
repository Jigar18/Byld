import type { University } from "@/types/api";
import { rankSuggestions } from "@/lib/utils";

export async function getUniversities(query: string): Promise<string[]> {
  try {
    const response = await fetch(`/api/universities?name=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error("University search failed");
    const data = await response.json() as University[] | { error?: string; msg?: string };
    if (!Array.isArray(data)) throw new Error(data.msg ?? data.error ?? "University search failed");

    return rankSuggestions(
      data.map((university) => university.country ? `${university.name}, ${university.country}` : university.name),
      query,
    );
  } catch (error) {
    console.error("Error fetching universities:", error);
    return [];
  }
}
