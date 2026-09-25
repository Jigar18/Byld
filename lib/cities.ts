import type { Country } from "@/types/api";
import { rankSuggestions } from "@/lib/utils";

export async function searchCities(query: string): Promise<string[]> {
  try {
    const response = await fetch("https://countriesnow.space/api/v0.1/countries");
    const data = await response.json();
    if (data.error) throw new Error(data.msg);

    const lowerQuery = query.toLowerCase().trim();
    const results = (data.data as Country[]).flatMap((country) =>
      country.cities
        .filter((city) =>
          city.toLowerCase().includes(lowerQuery) ||
          country.country.toLowerCase().includes(lowerQuery)
        )
        .map((city) => `${city}, ${country.country}`)
    );
    return rankSuggestions(results, query);
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
}
