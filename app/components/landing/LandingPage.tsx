"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  CircleDot,
  Github,
  Link2,
  Menu,
  PenLine,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  ConnectMockup,
  CredentialsMockup,
  ExperienceMockup,
  HeatmapMockup,
  HeroPortfolioPreview,
  ProjectMockup,
} from "./ProductMockups";

const ThreeCommitField = dynamic(() => import("./ThreeCommitField"), {
  ssr: false,
});

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Compare", href: "#compare" },
  { label: "Example", href: "/user/Jigar18" },
];

const steps = [
  {
    number: "01",
    icon: Github,
    title: "Connect GitHub",
    copy: "Sign in and we instantly pull your repositories, contribution graph, and languages used.",
  },
  {
    number: "02",
    icon: PenLine,
    title: "Customize your story",
    copy: "Add your bio, experience, certifications, and education. Keep what matters; skip what doesn’t.",
  },
  {
    number: "03",
    icon: Link2,
    title: "Share your link",
    copy: "Get a clean URL for job applications, LinkedIn, your résumé, or your email signature.",
  },
];

const comparison = [
  ["GitHub project sync", "Manual links", "Usually manual", "Automatic"],
  ["Contribution history", "Link or embed", "Custom setup", "Synced heatmap"],
  ["Project storytelling", "Flexible pages", "Template-led", "Case study + demo"],
  ["Developer credentials", "Build manually", "Assemble sections", "Built in"],
  ["First polished draft", "Manual curation", "Design + content setup", "About 2 minutes"],
  ["Best fit", "Pages and link hubs", "Broad portfolios", "Developer careers"],
];

function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      {...{ className }}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({
  number,
  children,
}: {
  number: string;
  children: React.ReactNode;
}) {
  return (
    <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
      <span className="text-zinc-600">{number}</span>
      <span className="h-px w-8 bg-cyan-300/50" />
      {children}
    </p>
  );
}

function GithubButton({ className = "" }: { className?: string }) {
  return (
    <a
      href="/api/github/auth"
      className={`group inline-flex h-12 items-center justify-center gap-2.5 bg-cyan-300 px-5 text-sm font-semibold text-[#061014] transition hover:-translate-y-0.5 hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-[#05080b] ${className}`}
    >
      <Github className="h-4.5 w-4.5" />
      Continue with GitHub
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </a>
  );
}

function FeatureRow({
  number,
  eyebrow,
  title,
  copy,
  visual,
  reverse = false,
}: {
  number: string;
  eyebrow: string;
  title: string;
  copy: string;
  visual: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <Reveal
      className={`grid items-center gap-10 border-t border-white/10 py-20 lg:grid-cols-2 lg:gap-20 ${
        reverse ? "lg:[&>*:first-child]:order-2" : ""
      }`}
    >
      <div>
        <SectionLabel number={number}>{eyebrow}</SectionLabel>
        <h3 className="mt-6 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-4xl">
          {title}
        </h3>
        <p className="mt-5 max-w-lg text-base leading-7 text-zinc-400">
          {copy}
        </p>
        <div className="mt-7 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600">
          <CircleDot className="h-3.5 w-3.5 text-cyan-300" />
          Included in every portfolio
        </div>
      </div>
      <div className="min-w-0">{visual}</div>
    </Reveal>
  );
}

export default function LandingPage() {
  const heroRef = useRef<HTMLElement>(null);
  const [pastHero, setPastHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateHeader = () => {
      const threshold = (heroRef.current?.offsetHeight ?? 720) - 160;
      setPastHero(window.scrollY > threshold);
    };
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05080b] text-zinc-100 selection:bg-cyan-300 selection:text-[#061014]">
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
          pastHero || menuOpen
            ? "border-white/10 bg-[rgba(5,8,11,0.78)] shadow-lg shadow-black/10 backdrop-blur-xl"
            : "border-transparent bg-transparent"
        }`}
      >
        <nav className="mx-auto flex h-[4.75rem] max-w-7xl items-center px-5 sm:px-8 lg:px-10">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="Portfolio Creator home"
          >
            <span className="relative grid h-9 w-9 place-items-center border border-cyan-300/35 bg-cyan-300/[0.07] font-mono text-xs font-bold text-cyan-200">
              P
              <span className="absolute -right-1 -top-1 h-2 w-2 bg-cyan-300 shadow-[0_0_12px_#67e8f9]" />
            </span>
            <span className="text-sm font-semibold tracking-tight">
              Portfolio{" "}
              <span className="hidden font-mono text-[9px] font-normal uppercase tracking-[0.17em] text-zinc-600 min-[420px]:inline">
                Creator
              </span>
            </span>
          </Link>

          <div className="ml-auto hidden items-center gap-7 lg:flex">
            {navLinks.map((link) =>
              link.href.startsWith("#") ? (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-xs text-zinc-400 transition hover:text-white"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-xs text-zinc-400 transition hover:text-white"
                >
                  {link.label}
                </Link>
              ),
            )}
          </div>

          <div className="ml-auto hidden items-center gap-4 sm:flex lg:ml-9">
            <Link
              href="/login"
              className="text-xs font-medium text-zinc-300 transition hover:text-white"
            >
              Log in
            </Link>
            <a
              href="/api/github/auth"
              className="inline-flex h-9 items-center bg-white px-4 text-xs font-semibold text-zinc-950 transition hover:bg-cyan-200"
            >
              Get started free
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="ml-auto grid h-10 w-10 place-items-center border border-white/10 text-zinc-300 sm:hidden"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </nav>
        {menuOpen && (
          <div className="border-t border-white/10 bg-[#05080b] px-5 py-5 sm:hidden">
            <div className="grid gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="border-b border-white/[0.06] py-3 text-sm text-zinc-300"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Link
                href="/login"
                className="grid h-11 place-items-center border border-white/15 text-sm"
              >
                Log in
              </Link>
              <a
                href="/api/github/auth"
                className="grid h-11 place-items-center bg-cyan-300 text-sm font-semibold text-[#061014]"
              >
                Get started
              </a>
            </div>
          </div>
        )}
      </header>

      <section
        ref={heroRef}
        className="relative mx-auto grid min-h-[52rem] max-w-7xl items-center gap-12 px-5 pb-20 pt-32 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:px-10 lg:pb-24 lg:pt-28"
      >
        <div className="pointer-events-none absolute -right-48 top-10 h-[44rem] w-[52rem] opacity-45 lg:opacity-85">
          <ThreeCommitField />
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(103,232,249,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,.5)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          {...{ className: "relative z-10" }}
        >
          <div className="inline-flex items-center gap-2 border border-cyan-300/20 bg-cyan-300/[0.045] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            GitHub-native portfolio builder
          </div>
          <h1 className="mt-7 max-w-2xl text-[2.8rem] font-semibold leading-[0.9] tracking-[-0.055em] text-white sm:text-[clamp(3.3rem,7vw,6.6rem)] sm:leading-[0.88] sm:tracking-[-0.065em]">
            Your GitHub.
            <br />
            Your Work.
            <br />
            <span className="text-cyan-300">One Link.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
            Sign in with GitHub, and we&apos;ll pull your projects, activity,
            and skills automatically. Add your story, showcase your work, and
            share one link people actually want to click.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <GithubButton />
            <Link
              href="/user/Jigar18"
              className="inline-flex h-12 items-center justify-center gap-2 border border-white/15 px-5 text-sm font-medium text-zinc-200 transition hover:border-cyan-300/40 hover:bg-cyan-300/[0.04] hover:text-white"
            >
              See live example
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-9 flex flex-wrap gap-x-5 gap-y-2 border-l border-cyan-300/40 pl-4 font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-600">
            {["2-minute setup", "No design skills", "Free to start"].map(
              (item) => (
                <span key={item} className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-cyan-300" />
                  {item}
                </span>
              ),
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{
            duration: 0.9,
            delay: 0.14,
            ease: [0.22, 1, 0.36, 1],
          }}
          {...{ className: "relative z-10 min-w-0" }}
        >
          <HeroPortfolioPreview />
        </motion.div>
      </section>

      <section className="border-y border-white/10 bg-[#070b0f]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/10 px-5 sm:px-8 md:grid-cols-4 lg:px-10">
          {[
            ["01", "GitHub connected"],
            ["365", "days of activity"],
            ["04", "project deep-dives"],
            ["01", "link to share"],
          ].map(([value, label]) => (
            <div key={label} className="px-4 py-6 first:pl-0 sm:py-7">
              <p className="font-mono text-xl text-white">{value}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-zinc-600">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-24 px-5 py-24 sm:px-8 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionLabel number="01">How it works</SectionLabel>
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.6fr] lg:items-end">
              <h2 className="max-w-3xl text-4xl font-semibold leading-[1.04] tracking-[-0.045em] text-white sm:text-5xl">
                Live in 3 steps.
                <br />
                No design skills needed.
              </h2>
              <p className="max-w-lg text-sm leading-6 text-zinc-500 lg:justify-self-end">
                Your repositories are the starting point—not another blank
                canvas asking you to become a designer.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid border border-white/10 bg-white/10 md:grid-cols-3 md:gap-px">
            {steps.map(({ number, icon: Icon, title, copy }, index) => (
              <Reveal
                key={title}
                className="group relative bg-[#070b0f] p-7 transition hover:bg-[#091117] sm:p-9"
              >
                <div className="flex items-start justify-between">
                  <span className="grid h-11 w-11 place-items-center border border-cyan-300/20 bg-cyan-300/[0.05] text-cyan-200">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-[10px] text-zinc-700">
                    {number}
                  </span>
                </div>
                <h3 className="mt-12 text-xl font-medium text-white">{title}</h3>
                <p className="mt-4 text-sm leading-6 text-zinc-500">{copy}</p>
                {index < steps.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-12 z-10 hidden h-5 w-5 text-cyan-300 md:block" />
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        id="features"
        className="scroll-mt-24 border-t border-white/10 bg-[#070a0d] px-5 sm:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="py-24 lg:py-28">
            <Reveal>
              <SectionLabel number="02">The portfolio itself</SectionLabel>
              <h2 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.04] tracking-[-0.045em] text-white sm:text-5xl">
                Less telling recruiters what you can do.
                <br />
                <span className="text-zinc-600">More showing them.</span>
              </h2>
            </Reveal>
          </div>

          <FeatureRow
            number="02.1"
            eyebrow="Project deep-dives"
            title="More Than a Link. A Real Case Study for Every Project."
            copy="Each project gets its own detail view—description, tech stack, outcomes, source links, and even a demo video. Let your work speak for itself."
            visual={<ProjectMockup />}
          />
          <FeatureRow
            number="02.2"
            eyebrow="GitHub activity"
            title="Your Commit History, Beautifully Displayed."
            copy="Developers value consistency. Show your real GitHub contribution graph—automatically synced and always ready to back up the story you tell."
            visual={<HeatmapMockup />}
            reverse
          />
          <FeatureRow
            number="02.3"
            eyebrow="Skills and credentials"
            title="Credibility, Organized."
            copy="From certifications to your computer science degree, present your qualifications in a clean, scannable format recruiters can understand in seconds."
            visual={<CredentialsMockup />}
          />
          <FeatureRow
            number="02.4"
            eyebrow="Experience"
            title="Your Career Timeline, Not Just a Resume PDF."
            copy="Show the roles you’ve held, what you built, and the impact you made—in a format far more engaging than a static attachment."
            visual={<ExperienceMockup />}
            reverse
          />
          <FeatureRow
            number="02.5"
            eyebrow="Connect"
            title="One Link to Rule Them All."
            copy="LinkedIn, X, email, GitHub, and more—all your ways to connect, presented in one focused place without turning your portfolio into a link dump."
            visual={<ConnectMockup />}
          />
        </div>
      </section>

      <section
        id="compare"
        className="scroll-mt-24 border-y border-white/10 px-5 py-24 sm:px-8 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
              <div>
                <SectionLabel number="03">Built for developers</SectionLabel>
                <h2 className="mt-6 text-4xl font-semibold leading-tight tracking-[-0.04em] text-white">
                  A portfolio builder should know what a commit is.
                </h2>
                <p className="mt-5 max-w-md text-sm leading-6 text-zinc-500">
                  Link pages are excellent at collecting destinations. Generic
                  builders offer broad design freedom. Portfolio Creator starts
                  from the evidence developers already have.
                </p>
              </div>

              <div className="overflow-x-auto border border-white/10 bg-[#070b0f]">
                <table className="w-full min-w-[44rem] border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="w-[28%] p-4 font-mono text-[9px] font-normal uppercase tracking-[0.15em] text-zinc-600">
                        Workflow
                      </th>
                      <th className="p-4 font-medium text-zinc-400">
                        Notion / Linktree
                      </th>
                      <th className="p-4 font-medium text-zinc-400">
                        Generic builders
                      </th>
                      <th className="border-l border-cyan-300/20 bg-cyan-300/[0.045] p-4 font-medium text-cyan-200">
                        Portfolio Creator
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map(([label, linkPages, generic, product]) => (
                      <tr
                        key={label}
                        className="border-b border-white/[0.07] last:border-0"
                      >
                        <th className="p-4 font-medium text-zinc-300">
                          {label}
                        </th>
                        <td className="p-4 text-zinc-600">{linkPages}</td>
                        <td className="p-4 text-zinc-600">{generic}</td>
                        <td className="border-l border-cyan-300/20 bg-cyan-300/[0.025] p-4 font-medium text-white">
                          <span className="flex items-center gap-2">
                            <Check className="h-3.5 w-3.5 text-cyan-300" />
                            {product}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden px-5 py-28 sm:px-8 lg:py-40">
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(103,232,249,.55)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,.55)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(circle_at_center,black,transparent_70%)]" />
        <Reveal className="relative mx-auto max-w-4xl text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
            Ready when your GitHub is
          </p>
          <h2 className="mt-7 text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-white sm:text-6xl">
            Your Work Deserves Better Than a Resume PDF.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-400">
            Build your developer portfolio in minutes—powered by your actual
            GitHub activity.
          </p>
          <div className="mt-9 flex justify-center">
            <GithubButton className="w-full sm:w-auto" />
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-white/10 bg-[#040608] px-5 py-12 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,0.6fr)]">
            <div>
              <Link href="/" className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center border border-cyan-300/30 font-mono text-xs text-cyan-200">
                  P
                </span>
                <span className="text-sm font-semibold">Portfolio Creator</span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-6 text-zinc-600">
                Turn real GitHub work into one clear, credible developer
                portfolio.
              </p>
            </div>
            {[
              ["Product", ["Features", "How it works", "Examples"]],
              ["Company", ["About", "Contact", "GitHub"]],
              ["Legal", ["Privacy", "Terms", "Security"]],
            ].map(([title, links]) => (
              <div key={title as string}>
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">
                  {title as string}
                </p>
                <div className="mt-4 grid gap-3">
                  {(links as string[]).map((label) => (
                    <a
                      key={label}
                      href={
                        label === "Features"
                          ? "#features"
                          : label === "How it works"
                            ? "#how-it-works"
                            : label === "Examples"
                              ? "/user/Jigar18"
                              : label === "GitHub"
                                ? "https://github.com/Jigar18/Portfolio-Creator"
                                : "#"
                      }
                      className="w-fit text-xs text-zinc-600 transition hover:text-zinc-200"
                    >
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 font-mono text-[9px] uppercase tracking-[0.13em] text-zinc-700 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Portfolio Creator</span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Built by developers, for developers
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
