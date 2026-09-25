import type { Country } from "@/types/api";
import { rankSuggestions } from "@/lib/utils";

// The country list is large and static, so it is downloaded once per page load.
let countries: Promise<Country[]> | null = null;

const loadCountries = () => {
  countries ??= fetch("https://countriesnow.space/api/v0.1/countries")
    .then((response) => response.json())
    .then((data) => {
      if (data.error) throw new Error(data.msg);
      return data.data as Country[];
    })
    .catch((error) => {
      countries = null;
      throw error;
    });
  return countries;
};

export async function searchCities(query: string): Promise<string[]> {
  try {
    const lowerQuery = query.toLowerCase().trim();
    const results = (await loadCountries()).flatMap((country) =>
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
