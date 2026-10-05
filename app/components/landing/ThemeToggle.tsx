"use client";

import { Moon, Sun } from "lucide-react";
import type { MouseEvent } from "react";
import { THEME_STORAGE_KEY } from "./landingTheme";

export default function ThemeToggle() {
  const switchTheme = (event: MouseEvent<HTMLButtonElement>) => {
    const root = document.documentElement;
    const nextTheme = root.dataset.lpTheme === "dark" ? "light" : "dark";
    const applyTheme = () => {
      root.dataset.lpTheme = nextTheme;
    };
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);

    if (!document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      applyTheme();
      return;
    }

    // landing.css reveals the new theme as a circle growing from the button that was pressed.
    const button = event.currentTarget.getBoundingClientRect();
    root.style.setProperty("--lp-switch-x", `${button.left + button.width / 2}px`);
    root.style.setProperty("--lp-switch-y", `${button.top + button.height / 2}px`);
    document.startViewTransition(applyTheme);
  };

  return (
    <button type="button" className="lp-theme-toggle" aria-label="Switch between light and dark mode" onClick={switchTheme}>
      <Moon className="lp-theme-moon" aria-hidden="true" />
      <Sun className="lp-theme-sun" aria-hidden="true" />
    </button>
  );
}
