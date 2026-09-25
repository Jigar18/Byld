import Image from "next/image";
import {
  Award,
  BookOpen,
  BriefcaseBusiness,
  Code2,
  Download,
  ExternalLink,
  Eye,
  FolderPlus,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Pencil,
  Share2,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import SkillIcon from "../SkillIcon";
import { contributionLevels } from "../contributionHeatmapStyles";

const levels = contributionLevels;

const compactMonthLabels = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
const proofMonthLabels = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

const contributionWeeks = Array.from({ length: 52 }, (_, week) =>
  Array.from({ length: 7 }, (_, day) => {
    const signal = (week * 17 + day * 11 + week * day * 3) % 31;
    const active = week > 19 && (signal < 11 || (week > 40 && signal < 17));
    return !active ? (signal === 24 ? 1 : 0) : signal < 3 ? 4 : signal < 7 ? 3 : signal < 12 ? 2 : 1;
  }),
);

const proofContributionWeeks = Array.from({ length: 46 }, (_, week) =>
  Array.from({ length: 7 }, (_, day) => {
    const signal = (week * 19 + day * 11 + week * day * 7) % 43;
    const threshold = week < 12 ? 6 : week < 30 ? 9 : 12;
    const active = signal < threshold || (week + day * 3) % 17 === 0;
    if (!active) return 0;
    return signal < 2 ? 4 : signal < 5 ? 3 : signal < 8 ? 2 : 1;
  }),
);

const projects = [
  {
    name: "Stratos",
    description: "A PaaS that turns GitHub repositories into live, production-ready applications.",
    stack: ["Java", "JavaScript", "Spring Boot", "+2 more"],
    background: "repeating-linear-gradient(90deg, transparent 0 12px, #747a78 13px 15px), repeating-linear-gradient(0deg, #151817 0 12px, #666c69 13px 15px)",
  },
  {
    name: "Relay",
    description: "A collaborative API workspace for designing, testing, and reviewing service contracts.",
    stack: ["React", "Node.js", "PostgreSQL"],
    background: "linear-gradient(90deg, transparent 46%, #666d6a 47% 52%, transparent 53%), linear-gradient(#171a19 46%, #666d6a 47% 52%, #171a19 53%)",
  },
  {
    name: "Orbit",
    description: "An observability workspace that turns distributed traces into a clear picture of system health.",
    stack: ["TypeScript", "JavaScript", "OpenTelemetry"],
    background: "radial-gradient(circle, #737a77 0 18%, #181b1a 19% 35%, #737a77 36% 46%, #111312 47%)",
  },
];

const experience = [
  "Led platform work across shared developer services and release tooling.",
  "Built observability workflows that made production issues faster to diagnose.",
  "Improved service reliability through clearer ownership and safer deployment paths.",
];

const skills = ["React", "Node.js", "TypeScript", "Java", "Next.js", "Spring Boot", "PostgreSQL", "Docker"];

const sectionTones = { neutral: "text-zinc-400", rose: "text-[#c96f7d]", purple: "text-[#b26acb]", green: "text-emerald-400/75" };

function SectionTag({ icon: Icon, children, tone = "neutral" }: { icon: typeof Code2; children: React.ReactNode; tone?: keyof typeof sectionTones }) {
  return (
    <div className={`flex items-center gap-2.5 font-mono text-[8px] uppercase tracking-[0.2em] sm:text-[9px] ${sectionTones[tone]}`}>
      <span className="grid h-7 w-7 place-items-center rounded-md border border-white/10 bg-white/[0.025]">
        <Icon className="h-3.5 w-3.5" />
      </span>
      {children}
    </div>
  );
}

function ProjectCard({ project, compact = false }: { project: (typeof projects)[number]; compact?: boolean }) {
  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-white/[0.1] bg-[#0b0b0d]">
      <div className={`relative overflow-hidden border-b border-white/[0.07] ${compact ? "h-24 sm:h-28" : "h-36 sm:h-44"}`}>
        <div className="absolute inset-0 opacity-80" style={{ background: project.background, backgroundSize: project.name === "Orbit" ? "48px 48px" : "54px 54px" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
      </div>
      <div className={`flex flex-1 flex-col ${compact ? "p-3" : "p-4 sm:p-5"}`}>
        <h4 className={`${compact ? "text-[11px] sm:text-xs" : "text-base"} font-semibold text-white`}>{project.name}</h4>
        <p className={`mt-1.5 text-zinc-500 ${compact ? "line-clamp-2 text-[8px] leading-3 sm:text-[9px] sm:leading-4" : "text-xs leading-5"}`}>{project.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.stack.slice(0, compact ? 2 : 3).map((item) => (
            <span key={item} className="inline-flex items-center gap-1 rounded-md border border-white/[0.09] bg-white/[0.025] px-2 py-1 font-mono text-[7px] text-zinc-400 sm:text-[8px]"><SkillIcon skill={item} className="h-2.5 w-2.5 shrink-0" />{item}</span>
          ))}
        </div>
        <div className="mt-auto flex justify-end gap-2 pt-3 text-zinc-500">
          <Github className="h-3.5 w-3.5" aria-label="Repository" />
          <ExternalLink className="h-3.5 w-3.5" aria-label="Live project" />
        </div>
      </div>
    </article>
  );
}

function ContributionGrid({ compact = false }: { compact?: boolean }) {
  const weeks = compact ? contributionWeeks : proofContributionWeeks;
  const months = compact ? compactMonthLabels : proofMonthLabels;
  // Columns share the available width, so the whole year fits on any screen instead of scrolling.
  const columns = { gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` };
  const gap = compact ? "gap-[2px] sm:gap-[4px]" : "gap-[2px] sm:gap-[3px]";

  return (
    <div className="w-full">
      <div className={`mb-2 grid font-mono text-[7px] text-zinc-600 sm:text-[8px] ${gap}`} style={columns}>
        {months.map((month, index) => (
          <span key={month} className="whitespace-nowrap" style={{ gridColumn: `${index * 4 + 1} / span 4` }}>{month}</span>
        ))}
      </div>
      <div className={`grid ${gap}`} style={columns}>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className={`grid grid-rows-7 ${gap}`}>
            {week.map((level, dayIndex) => <span key={dayIndex} className={`aspect-square w-full ${compact ? "rounded-[2px] sm:rounded-[3px]" : "rounded-[1px] sm:rounded-[2px]"} ${levels[level]}`} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivityCard({ compact = false }: { compact?: boolean }) {
  return (
    <div aria-label="GitHub activity preview" className={`min-w-0 rounded-xl border border-white/[0.09] bg-[#0b0b0d] ${compact ? "p-3 sm:p-4" : "byld-shadow p-5 pb-3 sm:p-7 sm:pb-3"}`}>
      <div className="flex items-center justify-between gap-4">
        <SectionTag icon={Github} tone="green">GitHub activity</SectionTag>
        <span className="font-mono text-[7px] uppercase tracking-wider text-zinc-700 sm:text-[8px]">Last 12 months</span>
      </div>
      <div className="mt-3"><ContributionGrid compact={compact} /></div>
      <div className={`flex items-center justify-between border-t border-white/[0.07] text-zinc-600 ${compact ? "mt-3 pt-2 text-[7px]" : "mt-5 pt-4 text-[9px]"}`}>
        <span>186 contributions in 2026</span>
        <span className="hidden items-center gap-1.5 sm:flex">Less {levels.map((color, index) => <i key={index} className={`h-2.5 w-2.5 rounded-[2px] ${color}`} />)} More</span>
      </div>
    </div>
  );
}

export function PortfolioPreview() {
  return (
    <div className="flex flex-col overflow-hidden rounded-[18px] border border-white/[0.11] bg-[#0E0F11] sm:rounded-[24px]">
      <div className="relative flex h-9 shrink-0 items-center gap-2 border-b border-white/[0.07] bg-[#111113] px-3 sm:h-11 sm:px-4">
        {levels.slice(2, 5).map((color) => <span key={color} className={`h-2 w-2 rounded-full ${color}`} />)}
        <span className="absolute left-1/2 -translate-x-1/2 rounded-md border border-white/[0.06] bg-black/25 px-8 py-1 font-mono text-[6px] text-zinc-600 sm:px-16 sm:text-[7px]">byldit.vercel.app/alex</span>
      </div>
      <div className="px-4 py-5 sm:px-10 sm:py-8">
        <div className="mx-auto w-full max-w-[980px]">
          <section data-assemble="0" className="flex items-center gap-4 rounded-2xl border border-white/[0.12] bg-[#121313] p-4 shadow-[0_22px_55px_rgba(0,0,0,0.32)] sm:gap-6 sm:p-7">
            <Image src="/landing/demo-avatar-mono.webp" alt="Alex" width={88} height={88} className="h-14 w-14 shrink-0 rounded-full border-[3px] border-zinc-600 object-cover sm:h-20 sm:w-20" priority />
            <div className="min-w-0"><h3 className="text-xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">Alex</h3><p className="mt-1 text-[11px] text-zinc-400 sm:text-base">Senior Software Engineer</p><p className="mt-1.5 flex items-center gap-1 text-[8px] text-zinc-500 sm:text-xs"><MapPin className="h-3 w-3" />Earth, Milky Way</p></div>
            <span className="ml-auto inline-flex items-center gap-2 rounded-lg border border-white/[0.11] bg-white/[0.035] px-3 py-2 text-[8px] text-zinc-300 sm:px-4 sm:py-3 sm:text-xs"><BriefcaseBusiness className="h-3.5 w-3.5 text-zinc-500" />OPENAI</span>
          </section>

          <section data-assemble="0" className="mt-12 border-l border-[#c96f7d]/25 pl-5 sm:mt-16 sm:pl-7">
            <SectionTag icon={UserRound} tone="rose">About me</SectionTag>
            <p className="mt-4 max-w-[920px] text-[10px] leading-5 text-zinc-400 sm:mt-5 sm:text-sm sm:leading-7">I build scalable, high-performance systems and developer tools designed for reliability and long-term growth. I focus on clean architecture, thoughtful engineering decisions, and solving complex technical challenges with simple, effective solutions. I care deeply about code quality, performance, and maintainability, while building software that remains robust and adaptable as products, teams, and requirements evolve.</p>
          </section>

          <section className="mt-14 border-t border-[#b26acb]/20 pt-6 sm:mt-20 sm:pt-8">
            <div data-assemble="0" className="flex items-center justify-between gap-4"><SectionTag icon={Code2} tone="purple">Projects</SectionTag><span className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-[10px] font-medium text-zinc-950 sm:px-5 sm:py-2.5 sm:text-sm"><FolderPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />Add project</span></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 sm:gap-4">{projects.map((project, index) => <div key={project.name} data-assemble={index + 1} className={index === 2 ? "hidden sm:block" : undefined}><ProjectCard project={project} /></div>)}</div>
          </section>

          <section data-assemble="0" className="mt-14 border-t border-emerald-400/15 pt-7 sm:mt-20 sm:pt-9"><ActivityCard compact /></section>
        </div>
      </div>
    </div>
  );
}

export function CareerEvidence() {
  return (
    <div aria-label="Career details preview" className="byld-shadow space-y-3 rounded-xl">
      <div className="grid gap-3 sm:grid-cols-[0.82fr_1.18fr]">
        <div className="rounded-xl border border-white/[0.1] bg-[#0b0b0d] p-5"><SectionTag icon={Sparkles}>Skills</SectionTag><div className="mt-5 flex flex-wrap gap-2">{skills.map((skill) => <span key={skill} className="rounded-full border border-white/10 bg-white/[0.025] px-2.5 py-1.5 text-[9px] text-zinc-400">{skill}</span>)}</div></div>
        <div className="rounded-xl border border-white/[0.1] bg-[#0b0b0d] p-5"><SectionTag icon={Award}>Certifications</SectionTag><div className="mt-5 border-t border-white/[0.07] pt-4"><p className="text-xs font-medium text-white">Professional Cloud Developer</p><p className="mt-1 text-[9px] text-zinc-600">Google Cloud · 2025</p><div className="mt-3 flex gap-3 text-[8px] text-zinc-500"><span className="flex items-center gap-1"><Download className="h-3 w-3" />Download</span><span className="flex items-center gap-1"><Eye className="h-3 w-3" />View certificate</span></div></div></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-xl border border-white/[0.1] bg-[#0b0b0d] p-5"><SectionTag icon={BookOpen}>Education</SectionTag><div className="mt-5 flex items-start justify-between border-t border-white/[0.07] pt-4"><div><p className="text-xs font-semibold text-white">Carnegie Mellon University</p><p className="mt-1 text-[10px] text-zinc-400">M.S. Software Engineering</p><p className="mt-1 text-[9px] text-zinc-600">Computer Science</p></div><span className="text-[9px] text-zinc-600">2015 – 2017</span></div></div>
        <div className="rounded-xl border border-white/[0.1] bg-[#0b0b0d] p-5"><SectionTag icon={Share2}>Connect</SectionTag><div className="mt-5 flex flex-wrap gap-2 border-t border-white/[0.07] pt-4">{[Linkedin, Mail, Github].map((Icon, index) => <span key={index} className="grid h-8 w-8 place-items-center rounded-md border border-white/10 text-zinc-400"><Icon className="h-3.5 w-3.5" /></span>)}</div></div>
      </div>
      <div className="rounded-xl border border-white/[0.1] bg-[#0b0b0d] p-5 sm:p-6">
        <SectionTag icon={BriefcaseBusiness}>Experience</SectionTag>
        <div className="mt-6 grid gap-6 border-t border-white/[0.07] pt-5 sm:grid-cols-[0.7fr_1.3fr]">
          <div><p className="text-sm font-semibold text-white">Google</p><p className="mt-1 text-[10px] text-zinc-400">Senior Software Developer</p><p className="mt-2 text-[9px] text-zinc-600">2022 – Present</p></div>
          <ul className="space-y-3 border-l border-white/[0.08] pl-5">{experience.map((item) => <li key={item} className="flex gap-2 text-[10px] leading-4 text-zinc-500"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-500" />{item}</li>)}</ul>
        </div>
      </div>
    </div>
  );
}

export function OwnershipControls() {
  const items = [
    { icon: Pencil, title: "Edit in place", copy: "Pencil buttons sit beside each section, only for you.", control: <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-zinc-300"><Pencil className="h-3 w-3" />Edit</span> },
    { icon: ShieldCheck, title: "Show or hide your graph", copy: "Keep the contribution heatmap public or private.", control: <span className="flex h-6 w-11 items-center rounded-full bg-zinc-200 p-1"><span className="ml-auto h-4 w-4 rounded-full bg-zinc-950" /></span> },
    { icon: Eye, title: "See who stopped by", copy: "Unique visits, counted without tracking people.", control: <span className="text-2xl font-semibold tabular-nums tracking-[-0.03em] text-zinc-100">248</span> },
  ];
  return (
    <div aria-label="Owner controls preview" className="byld-shadow w-full max-w-[560px] overflow-hidden rounded-xl border border-white/[0.1] bg-[#0b0b0d]">
      <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-4">
        <Image src="/landing/demo-avatar-mono.webp" alt="" width={36} height={36} className="h-9 w-9 rounded-full border-2 border-zinc-700 object-cover" />
        <div className="min-w-0"><p className="text-sm font-semibold text-white">Alex</p><p className="text-[11px] text-zinc-500">Signed in as the owner</p></div>
        <span className="ml-auto rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-zinc-400">Only you see this</span>
      </div>
      <div className="divide-y divide-white/[0.07] px-5">
        {items.map(({ icon: Icon, title, copy, control }) => (
          <div key={title} className="flex items-center gap-4 py-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/[0.08] text-zinc-400"><Icon className="h-4 w-4" /></span>
            <div className="min-w-0"><p className="text-sm font-medium text-white">{title}</p><p className="mt-1 text-xs leading-5 text-zinc-500">{copy}</p></div>
            <span className="ml-auto shrink-0">{control}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
