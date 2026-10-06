import { type RefObject, useEffect } from "react";

// The portfolio page's cards come in as they are scrolled to. A card is marked once, when it first enters
// the window; the page is marked too, so the cards are only held back when this script is there to release them.
export function useRevealOnScroll(pageRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.seen = "";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    for (const card of page.querySelectorAll(".pf-card")) observer.observe(card);
    page.dataset.reveals = "";
    return () => observer.disconnect();
  }, [pageRef]);
}
