import { type RefObject, useEffect } from "react";

const clamp = (value: number) => Math.max(-1, Math.min(1, value));

// Feeds the pointer's position to the portfolio page's CSS (see "Portfolio page" in globals.css):
// --lx/--ly on the page, --mx/--my on every [data-light] surface, and a tilt on every [data-tilt] object,
// whose attribute value is how many degrees it may turn.
export function usePointerLight(pageRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const page = pageRef.current;
    if (!page || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let pointer: { x: number; y: number } | null = null;
    let frame = 0;

    const paint = () => {
      frame = 0;
      if (!pointer) return;

      const pageBox = page.getBoundingClientRect();
      page.style.setProperty("--lx", `${pointer.x - pageBox.left}px`);
      page.style.setProperty("--ly", `${pointer.y - pageBox.top}px`);
      page.dataset.lit = "";

      for (const surface of page.querySelectorAll<HTMLElement>("[data-light]")) {
        const box = surface.getBoundingClientRect();
        surface.style.setProperty("--mx", `${pointer.x - box.left}px`);
        surface.style.setProperty("--my", `${pointer.y - box.top}px`);
      }

      if (reducedMotion.matches) return;
      for (const object of page.querySelectorAll<HTMLElement>("[data-tilt]")) {
        const box = object.getBoundingClientRect();
        const degrees = Number(object.dataset.tilt);
        const across = clamp((pointer.x - (box.left + box.width / 2)) / (window.innerWidth / 2));
        const down = clamp((pointer.y - (box.top + box.height / 2)) / (window.innerHeight / 2));
        object.style.setProperty("--tilt-y", `${(across * degrees).toFixed(2)}deg`);
        object.style.setProperty("--tilt-x", `${(-down * degrees).toFixed(2)}deg`);
      }
    };

    const schedulePaint = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const followPointer = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      schedulePaint();
    };

    window.addEventListener("pointermove", followPointer, { passive: true });
    // Scrolling moves the page under a still pointer, so the light is placed again.
    window.addEventListener("scroll", schedulePaint, { passive: true });
    return () => {
      window.removeEventListener("pointermove", followPointer);
      window.removeEventListener("scroll", schedulePaint);
      cancelAnimationFrame(frame);
    };
  }, [pageRef]);
}
