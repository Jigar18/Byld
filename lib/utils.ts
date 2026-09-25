import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Suggestions that start with the query come first, then alphabetical order.
export function rankSuggestions(suggestions: string[], query: string, limit = 6) {
  const lowerQuery = query.toLowerCase().trim();
  const startsWithQuery = (value: string) => value.toLowerCase().startsWith(lowerQuery);
  return suggestions
    .sort((a, b) => Number(startsWithQuery(b)) - Number(startsWithQuery(a)) || a.localeCompare(b))
    .slice(0, limit);
}
