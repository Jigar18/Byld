import Image from "next/image";
import {
  Award,
  BookOpen,
  BriefcaseBusiness,
  Code2,
  Download,
  ExternalLink,
  Eye,
  Github,
  Linkedin,
  Mail,
  Pencil,
  Share2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const levels = ["bg-white/[0.035]", "bg-zinc-800", "bg-zinc-700", "bg-zinc-500", "bg-zinc-100"];

const contributionWeeks = Array.from({ length: 52 }, (_, week) =>
  Array.from({ length: 7 }, (_, day) => {
    const signal = (week * 17 + day * 11 + week * day * 3) % 31;
    const active = week > 19 && (signal < 11 || (week > 40 && signal < 17));
    return !active ? (signal === 24 ? 1 : 0) : signal < 3 ? 4 : signal < 7 ? 3 : signal < 12 ? 2 : 1;
  }),
);

const projects = [
  {
    name: "Orbit",
    description: "An observability workspace that turns distributed traces into a clear picture of system health.",
    stack: ["TypeScript", "Next.js", "OpenTelemetry"],
    image: "/landing/project-orbit-mono.webp",
  },
  {
    name: "Relay",
    description: "A collaborative API workspace for designing, testing, and reviewing service contracts.",
    stack: ["React", "Node.js", "PostgreSQL"],
    image: "/landing/project-relay-mono.webp",
  },
];

const skills = ["React", "Node.js", "TypeScript", "Java", "Next.js", "Spring Boot", "PostgreSQL", "Docker"];

function SectionTag({ icon: Icon, children }: { icon: typeof Code2; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-400 sm:text-[9px]">
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
        <Image src={project.image} alt="" fill sizes={compact ? "360px" : "520px"} className="object-cover grayscale" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
      </div>
      <div className={`flex flex-1 flex-col ${compact ? "p-3" : "p-4 sm:p-5"}`}>
        <h4 className={`${compact ? "text-[11px] sm:text-xs" : "text-base"} font-semibold text-white`}>{project.name}</h4>
        <p className={`mt-1.5 text-zinc-500 ${compact ? "line-clamp-2 text-[8px] leading-3 sm:text-[9px] sm:leading-4" : "text-xs leading-5"}`}>{project.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.stack.slice(0, compact ? 2 : 3).map((item) => (
            <span key={item} className="rounded-md border border-white/[0.09] bg-white/[0.025] px-2 py-1 font-mono text-[7px] text-zinc-400 sm:text-[8px]">{item}</span>
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
  return (
    <div className={compact ? "min-w-[360px]" : "min-w-[480px]"}>
      <div className={`grid grid-cols-[repeat(52,minmax(0,1fr))] ${compact ? "gap-[2px]" : "gap-[3px]"}`}>
        {contributionWeeks.map((week, weekIndex) => (
          <div key={weekIndex} className={`grid grid-rows-7 ${compact ? "gap-[2px]" : "gap-[3px]"}`}>
            {week.map((level, dayIndex) => <span key={dayIndex} className={`${compact ? "h-[5px] sm:h-[6px]" : "h-[7px] sm:h-2"} rounded-[2px] border border-white/[0.025] ${levels[level]}`} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityCard({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`rounded-xl border border-white/[0.09] bg-[#0b0b0d] ${compact ? "p-3 sm:p-4" : "p-5 sm:p-7"}`}>
      <div className="flex items-center justify-between gap-4">
        <SectionTag icon={Github}>GitHub activity</SectionTag>
        <span className="font-mono text-[7px] uppercase tracking-wider text-zinc-700 sm:text-[8px]">Last 12 months</span>
      </div>
      <div className={`overflow-x-auto ${compact ? "mt-3" : "mt-6"}`}><ContributionGrid compact={compact} /></div>
      <div className={`flex items-center justify-between border-t border-white/[0.07] text-zinc-600 ${compact ? "mt-3 pt-2 text-[7px]" : "mt-5 pt-4 text-[9px]"}`}>
        <span>186 contributions in 2026</span>
        <span className="hidden items-center gap-1 sm:flex">Less {levels.map((color, index) => <i key={index} className={`h-2 w-2 rounded-[2px] ${color}`} />)} More</span>
      </div>
    </div>
  );
}

export function PortfolioPreview() {
  return (
    <div className="byldit-preview-fade flex h-[760px] flex-col overflow-hidden rounded-[18px] border border-white/[0.11] bg-[#080809] shadow-[0_45px_140px_rgba(0,0,0,.72)] sm:h-[1080px] sm:rounded-[24px]">
      <div className="relative flex h-9 shrink-0 items-center gap-2 border-b border-white/[0.07] bg-[#111113] px-3 sm:h-11 sm:px-4">
        {levels.slice(2, 5).map((color) => <span key={color} className={`h-2 w-2 rounded-full ${color}`} />)}
        <span className="absolute left-1/2 -translate-x-1/2 rounded-md border border-white/[0.06] bg-black/25 px-8 py-1 font-mono text-[6px] text-zinc-600 sm:px-16 sm:text-[7px]">byldit.vercel.app/alex</span>
      </div>
      <div className="relative min-h-0 flex-1">
        <Image
          src="/landing/byldit-portfolio-preview.png"
          alt="A Byldit developer portfolio showing Alex's profile, projects, and GitHub activity"
          fill
          priority
          draggable={false}
          sizes="(max-width: 640px) 100vw, 1120px"
          className="pointer-events-none select-none object-cover object-top [-webkit-user-drag:none]"
        />
      </div>
    </div>
  );
}

export function ProjectsEvidence() {
  return (
    <div className="relative flex h-[370px] items-center justify-center sm:h-[410px]">
      <div
        aria-hidden="true"
        className="absolute h-[72%] w-[72%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(105,132,188,0.1),rgba(255,255,255,0.025)_42%,transparent_72%)] blur-2xl"
      />
      <Image
        src="/landing/stratos-project-detail.png"
        alt="Stratos project details with its story, technology stack, demo, and architecture image"
        width={1387}
        height={1546}
        draggable={false}
        sizes="(max-width: 1024px) 100vw, 520px"
        className="pointer-events-none relative z-10 h-full w-auto max-w-full select-none object-contain drop-shadow-[0_24px_55px_rgba(0,0,0,0.38)] [-webkit-user-drag:none]"
      />
    </div>
  );
}

export function ActivityEvidence() {
  return <ActivityCard />;
}

export function CareerEvidence() {
  const contributions = [
    "Led platform work across shared developer services and release tooling.",
    "Built observability workflows that made production issues faster to diagnose.",
    "Improved service reliability through clearer ownership and safer deployment paths.",
  ];

  return (
    <div className="space-y-3">
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
          <ul className="space-y-3 border-l border-white/[0.08] pl-5">{contributions.map((item) => <li key={item} className="flex gap-2 text-[10px] leading-4 text-zinc-500"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-500" />{item}</li>)}</ul>
        </div>
      </div>
    </div>
  );
}

export function OwnershipControls() {
  const items = [
    { icon: Pencil, title: "Edit where it lives", copy: "Owner controls stay close to your content.", control: <span className="rounded-md border border-white/10 px-2 py-1 font-mono text-[8px] text-zinc-400">EDIT</span> },
    { icon: ShieldCheck, title: "Show what matters", copy: "Keep your contribution heatmap visible or private.", control: <span className="flex h-6 w-11 items-center rounded-full bg-zinc-200 p-1"><span className="ml-auto h-4 w-4 rounded-full bg-zinc-950" /></span> },
    { icon: Eye, title: "See the reach", copy: "Track unique visits without exposing people.", control: <span className="font-mono text-lg text-zinc-100">248</span> },
  ];
  return <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">{items.map(({ icon: Icon, title, copy, control }) => <div key={title} className="flex items-center gap-4 py-5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/[0.08] text-zinc-400"><Icon className="h-4 w-4" /></span><div><p className="text-sm font-medium text-white">{title}</p><p className="mt-1 text-xs text-zinc-600">{copy}</p></div><span className="ml-auto shrink-0">{control}</span></div>)}</div>;
}

export function ProjectFragment() {
  return <div className="pointer-events-none absolute inset-x-0 bottom-[-9rem] mx-auto w-[min(86%,54rem)] opacity-20 blur-[1px]"><ProjectCard project={projects[1]} /></div>;
}
