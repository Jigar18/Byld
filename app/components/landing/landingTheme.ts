export const THEME_STORAGE_KEY = "byldit-landing-theme";

// Inlined by the root layout so the theme is on <html> before the first paint, whichever page loads first.
export const applyThemeBeforePaint =
  `document.documentElement.dataset.lpTheme=localStorage.getItem("${THEME_STORAGE_KEY}")||` +
  `(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light")`;
