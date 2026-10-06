import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// The stylesheets reach the browser in rem (see postcss-px-to-rem.cjs). A length set from JavaScript goes
// through this so that it scales with the root font size in the same way.
export const pxToRem = (pixels: number) => `${pixels / 16}rem`;

// Suggestions that start with the query come first, then alphabetical order.
export function rankSuggestions(suggestions: string[], query: string, limit = 6) {
  const lowerQuery = query.toLowerCase().trim();
  const startsWithQuery = (value: string) => value.toLowerCase().startsWith(lowerQuery);
  return suggestions
    .sort((a, b) => Number(startsWithQuery(b)) - Number(startsWithQuery(a)) || a.localeCompare(b))
    .slice(0, limit);
}
