"use client";

import Image from "next/image";
import Link from "next/link";
import { Github, Menu, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const navItems = [
  { label: "Product", href: "#product", id: "product" },
  { label: "How it works", href: "#how-it-works", id: "how-it-works" },
  { label: "FAQ", href: "#faq", id: "faq" },
];

export default function LandingNav() {
  const [activeId, setActiveId] = useState("");
  const [hovered, setHovered] = useState("");
  const [scrolled, setScrolled] = useState(false);
  // The nav holds the sign-in button, except while a large one further down the page is on screen.
  const [showCta, setShowCta] = useState(true);
  const linksRef = useRef<HTMLDivElement>(null!);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  // One highlight slides between the links: to the hovered one, else the section in view.
  const highlighted = hovered || activeId;
  useLayoutEffect(() => {
    const link = linksRef.current.querySelector<HTMLElement>(`[data-nav="${highlighted}"]`);
    setPill(link ? { left: link.offsetLeft, width: link.offsetWidth } : null);
  }, [highlighted]);

  useEffect(() => {
    const buttons = document.querySelectorAll("[data-landing-cta]");
    if (!buttons.length) return;
    const visible = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      setShowCta(visible.size === 0);
    });
    buttons.forEach((button) => observer.observe(button));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;

    const updateActiveSection = () => {
      const marker = window.innerHeight * 0.32;
      let current = "";

      for (const item of navItems) {
        const section = document.getElementById(item.id);
        if (section && section.getBoundingClientRect().top <= marker) current = item.id;
      }

      const isAtPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
      if (isAtPageEnd) current = navItems[navItems.length - 1].id;

      setActiveId((previous) => previous === current ? previous : current);
      setScrolled(window.scrollY > 24);
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateActiveSection();
      });
    };

    updateActiveSection();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        aria-label="Main navigation"
        className={`pointer-events-auto relative flex h-[60px] w-full max-w-[1080px] items-center gap-2 rounded-full border pl-4 pr-2 transition-[background-color,border-color,box-shadow] duration-500 sm:h-16 sm:pl-6 sm:pr-2.5 md:gap-6 ${scrolled ? "border-white/[0.09] bg-[#0E0F11]/80 shadow-[0_18px_48px_-18px_rgba(0,0,0,0.9)] backdrop-blur-xl" : "border-white/[0.06] bg-[#0E0F11]/40 backdrop-blur-md"}`}
      >
        <Link href="/" className="mr-auto flex shrink-0 items-center gap-2.5 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3F4F5] md:mr-0" aria-label="Byldit home">
          <Image src="/landing/byldit-mark-mono.webp" alt="" width={28} height={28} className="rounded-[8px]" priority />
          <span className="byld-wide text-[17px] font-bold tracking-[-0.03em] text-[#F3F4F5]">Byldit</span>
        </Link>

        <div ref={linksRef} className="relative mx-auto hidden items-center gap-1.5 md:flex lg:gap-3" onMouseLeave={() => setHovered("")}>
          <span
            aria-hidden="true"
            className={`absolute left-0 top-0 h-full rounded-full bg-white/[0.07] transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.19,1,0.22,1)] ${pill ? "opacity-100" : "opacity-0"}`}
            style={pill ? { width: pill.width, transform: `translateX(${pill.left}px)` } : undefined}
          />
          {navItems.map((item) => {
            const isActive = activeId === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                data-nav={item.id}
                onClick={() => setActiveId(item.id)}
                onMouseEnter={() => setHovered(item.id)}
                aria-current={isActive ? "location" : undefined}
                className={`relative rounded-full px-4 py-2.5 text-[16px] font-medium lg:px-5 tracking-[-0.01em] transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3F4F5] ${isActive || hovered === item.id ? "text-[#F3F4F5]" : "text-[#8E9197]"}`}
              >
                {item.label}
              </a>
            );
          })}
        </div>

        {/* Folds away while the closing section's own sign-in button is on screen. */}
        <div className={`grid transition-[grid-template-columns,opacity] duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${showCta ? "grid-cols-[1fr] opacity-100" : "grid-cols-[0fr] opacity-0"}`}>
          <div className="min-w-0 overflow-hidden">
            <a
              href="/api/github/auth"
              aria-hidden={!showCta}
              tabIndex={showCta ? undefined : -1}
              className="flex h-11 items-center gap-2.5 whitespace-nowrap rounded-full bg-[#F3F4F5] px-4 text-[14px] font-semibold text-[#08080A] shadow-[0_0_0_1px_rgba(255,255,255,0.4)_inset] transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#08080A] sm:px-6 md:text-[15px]"
            >
              <Github className="h-4 w-4" />
              <span className="sm:hidden">Sign in</span>
              <span className="hidden sm:inline">Continue with GitHub</span>
            </a>
          </div>
        </div>

        <details className="group/menu relative md:hidden">
          <summary className="grid h-11 w-11 cursor-pointer list-none place-items-center rounded-full border border-white/10 text-[#C9CBCF] [&::-webkit-details-marker]:hidden"><Menu className="h-4 w-4 group-open/menu:hidden" /><X className="hidden h-4 w-4 group-open/menu:block" /><span className="sr-only">Open navigation</span></summary>
          <div className="absolute right-0 top-[calc(100%+14px)] w-[min(18rem,calc(100vw-1.5rem))] rounded-3xl border border-white/10 bg-[#0E0F11]/95 p-2 shadow-2xl shadow-black/60 backdrop-blur-xl">
            {navItems.map((item) => <a key={item.id} href={item.href} onClick={() => setActiveId(item.id)} aria-current={activeId === item.id ? "location" : undefined} className={`block rounded-2xl px-4 py-3.5 text-[17px] font-medium transition ${activeId === item.id ? "bg-white/[0.07] text-[#F3F4F5]" : "text-[#8E9197] hover:bg-white/5 hover:text-[#F3F4F5]"}`}>{item.label}</a>)}
          </div>
        </details>
      </nav>
    </header>
  );
}
