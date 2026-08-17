"use client";

import Image from "next/image";
import Link from "next/link";
import { Github, Menu } from "lucide-react";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Product", href: "#product", id: "product" },
  { label: "How it works", href: "#how-it-works", id: "how-it-works" },
  { label: "FAQ", href: "#faq", id: "faq" },
];

export default function LandingNav() {
  const [activeId, setActiveId] = useState("");

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
    <header className="fixed inset-x-0 top-4 z-50 px-3 sm:top-5 sm:px-5">
      <nav className="mx-auto h-16 max-w-[1120px] rounded-full border border-white/[0.1] bg-[#0c0c0e]/90 px-3 shadow-[0_18px_70px_rgba(0,0,0,.45)] backdrop-blur-xl sm:px-5" aria-label="Main navigation">
        <div className="flex h-full w-full items-center md:grid md:grid-cols-[1fr_auto_1fr]">
          <Link href="/" className="flex shrink-0 items-center gap-2.5 justify-self-start" aria-label="Byldit home">
            <Image src="/landing/byldit-mark-mono.webp" alt="" width={28} height={28} className="rounded-lg" priority />
            <span className="text-[15px] font-semibold tracking-[-0.02em] text-white">Byldit</span>
          </Link>

          <div className="hidden items-center justify-self-center md:flex">
            {navItems.map((item) => {
              const isActive = activeId === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => setActiveId(item.id)}
                  aria-current={isActive ? "location" : undefined}
                  className={`relative px-4 py-2.5 text-[13px] font-medium transition-colors ${isActive ? "text-white" : "text-zinc-500 hover:text-zinc-200"}`}
                >
                  {item.label}
                  <span className={`absolute inset-x-4 -bottom-px h-px origin-center bg-zinc-100 transition-transform duration-300 ${isActive ? "scale-x-100" : "scale-x-0"}`} />
                </a>
              );
            })}
          </div>

          <div className="hidden items-center justify-self-end gap-4 md:flex">
            <Link href="/login" className="px-1 text-[13px] font-medium text-zinc-400 transition hover:text-white">Log in</Link>
            <a href="/api/github/auth" className="inline-flex h-10 items-center gap-2 rounded-full bg-zinc-100 px-5 text-[13px] font-semibold text-zinc-950 transition hover:bg-white"><Github className="h-3.5 w-3.5" />Continue with GitHub</a>
          </div>

          <details className="group relative ml-auto md:hidden">
            <summary className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-full border border-white/10 text-zinc-300 [&::-webkit-details-marker]:hidden"><Menu className="h-4 w-4" /><span className="sr-only">Open navigation</span></summary>
            <div className="absolute right-0 top-12 w-64 rounded-2xl border border-white/10 bg-zinc-950 p-3 shadow-2xl shadow-black/60">
              {navItems.map((item) => <a key={item.id} href={item.href} onClick={() => setActiveId(item.id)} aria-current={activeId === item.id ? "location" : undefined} className={`block rounded-lg px-3 py-3 text-[15px] transition ${activeId === item.id ? "bg-white/[0.06] text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"}`}>{item.label}</a>)}
              <div className="mt-2 grid gap-2 border-t border-white/[0.07] pt-3"><Link href="/login" className="grid h-10 place-items-center rounded-lg border border-white/10 text-[13px]">Log in</Link><a href="/api/github/auth" className="grid h-10 place-items-center rounded-lg bg-zinc-100 text-[13px] font-semibold text-zinc-950">Continue with GitHub</a></div>
            </div>
          </details>
        </div>
      </nav>
    </header>
  );
}
