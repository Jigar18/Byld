import Image from "next/image";
import {
  Award,
  BriefcaseBusiness,
  Code2,
  Eye,
  Github,
  GraduationCap,
  MapPin,
  Pencil,
  Radio,
  ShieldCheck,
} from "lucide-react";

const levels = ["bg-white/[0.035]", "bg-zinc-800", "bg-zinc-700", "bg-zinc-500", "bg-zinc-100"];
const activeDays = new Set([8, 9, 18, 19, 20, 32, 33, 41, 42, 43, 55, 56, 68, 69, 70, 81]);
const heatmap = Array.from({ length: 84 }, (_, index) =>
  activeDays.has(index) ? 4 : index % 11 === 0 || index % 17 === 0 ? 3 : index % 5 === 0 || index % 7 === 0 ? 2 : index % 3 === 0 ? 1 : 0,
);

const projects = [
  {
    name: "Orbit",
    description: "An observability workspace that makes distributed systems easier to understand and operate.",
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

function SectionTag({ icon: Icon, children }: { icon: typeof Code2; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400">
      <span className="grid h-7 w-7 place-items-center rounded-md border border-white/10 bg-white/[0.04]">
        <Icon className="h-3.5 w-3.5" />
      </span>
      {children}
    </div>
  );
}

function ProjectCard({ project, compact = false }: { project: (typeof projects)[number]; compact?: boolean }) {
  return (
    <article className="overflow-hidden rounded-xl border border-white/[0.09] bg-zinc-950">
      <div className={`relative overflow-hidden ${compact ? "h-24" : "h-36 sm:h-44"}`}>
        <Image src={project.image} alt="" fill sizes={compact ? "260px" : "500px"} className="object-cover grayscale" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
      </div>
      <div className={compact ? "p-3" : "p-4 sm:p-5"}>
        <div className="flex items-center justify-between gap-3">
          <h4 className={`${compact ? "text-xs" : "text-base"} font-semibold text-white`}>{project.name}</h4>
          <Github className="h-3.5 w-3.5 text-zinc-600" aria-hidden="true" />
        </div>
        {!compact && <p className="mt-2 text-xs leading-5 text-zinc-500">{project.description}</p>}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.stack.slice(0, compact ? 2 : 3).map((item) => (
            <span key={item} className="rounded-md border border-white/[0.08] bg-white/[0.035] px-2 py-1 font-mono text-[8px] text-zinc-400">
              {item}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export function PortfolioPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`byldit-preview-fade overflow-hidden rounded-[22px] border border-white/[0.1] bg-[#09090b] shadow-[0_35px_110px_rgba(0,0,0,.6)] ${compact ? "h-[520px]" : "h-[690px]"}`}>
      <div className="flex h-10 items-center gap-2 border-b border-white/[0.07] bg-zinc-950 px-4">
        {["bg-zinc-500", "bg-zinc-700", "bg-zinc-800"].map((color) => <span key={color} className={`h-2 w-2 rounded-full ${color}`} />)}
        <span className="mx-auto rounded-md border border-white/[0.07] bg-black/20 px-12 py-1 font-mono text-[7px] text-zinc-700">byldit.dev/mark</span>
      </div>

      <div className={compact ? "p-4 sm:p-5" : "p-5 sm:p-8"}>
        <div className={`flex items-center rounded-xl border border-white/[0.08] bg-zinc-900/70 ${compact ? "gap-3 p-3" : "gap-4 p-5"}`}>
          <Image src="/landing/demo-avatar-mono.webp" alt="Mark, fictional senior software developer" width={compact ? 48 : 68} height={compact ? 48 : 68} className="rounded-full border border-white/20 grayscale" />
          <div className="min-w-0">
            <p className={`${compact ? "text-sm" : "text-lg"} font-semibold text-white`}>Mark</p>
            <p className="text-[10px] text-zinc-400 sm:text-xs">Senior Software Developer</p>
            <p className="mt-1 flex items-center gap-1 text-[8px] text-zinc-600 sm:text-[10px]"><MapPin className="h-2.5 w-2.5" />Earth, Milky Way</p>
          </div>
          <span className="ml-auto hidden rounded-md border border-white/[0.08] bg-white/[0.035] px-3 py-2 font-mono text-[8px] uppercase tracking-wider text-zinc-400 sm:block">Google</span>
        </div>

        <div className={compact ? "mt-6" : "mt-9"}>
          <SectionTag icon={Radio}>About</SectionTag>
          <p className={`mt-3 max-w-3xl text-zinc-500 ${compact ? "line-clamp-3 text-[10px] leading-4" : "text-xs leading-5 sm:text-sm sm:leading-6"}`}>
            I build reliable developer tools and distributed systems that make complex workflows feel simple. I care about clear architecture, thoughtful interfaces, and software that stays maintainable as it grows.
          </p>
        </div>

        <div className={compact ? "mt-7" : "mt-10"}>
          <SectionTag icon={Code2}>Selected work</SectionTag>
          <div className={`mt-4 grid gap-3 ${compact ? "grid-cols-2" : "sm:grid-cols-2"}`}>
            {projects.map((project) => <ProjectCard key={project.name} project={project} compact={compact} />)}
          </div>
        </div>

        <div className={compact ? "mt-7" : "mt-10"}>
          <SectionTag icon={Github}>GitHub activity</SectionTag>
          <div className="mt-4 rounded-xl border border-white/[0.08] bg-zinc-950 p-4">
            <div className="grid grid-cols-12 gap-1">
              {heatmap.map((level, index) => <span key={index} className={`aspect-square rounded-[2px] ${levels[level]}`} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectsEvidence() {
  return <div className="grid gap-3 sm:grid-cols-2">{projects.map((project) => <ProjectCard key={project.name} project={project} />)}</div>;
}

export function ActivityEvidence() {
  return (
    <div className="rounded-2xl border border-white/[0.09] bg-zinc-950 p-5 shadow-2xl shadow-black/30 sm:p-7">
      <div className="flex items-center justify-between"><SectionTag icon={Github}>Contribution activity</SectionTag><span className="font-mono text-[9px] text-zinc-700">LAST 12 MONTHS</span></div>
      <div className="mt-7 grid grid-cols-12 gap-1.5">{heatmap.concat(heatmap.slice(0, 12)).map((level, index) => <span key={index} className={`aspect-square rounded-[3px] border border-white/[0.025] ${levels[level]}`} />)}</div>
      <div className="mt-5 flex items-center justify-between text-xs text-zinc-600"><span>Work that stays current.</span><div className="flex items-center gap-1"><span>Less</span>{levels.map((color, index)=><span key={index} className={`h-2.5 w-2.5 rounded-[2px] ${color}`} />)}<span>More</span></div></div>
    </div>
  );
}

export function CareerEvidence() {
  const skills = ["TypeScript", "React", "Next.js", "Java", "Spring Boot", "PostgreSQL", "Kubernetes"];
  return (
    <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.08] sm:grid-cols-2">
      <div className="bg-zinc-950 p-5 sm:p-6"><SectionTag icon={BriefcaseBusiness}>Experience</SectionTag><p className="mt-6 text-sm font-semibold text-white">Senior Software Developer</p><p className="mt-1 text-xs text-zinc-400">Google · Present</p><ul className="mt-4 space-y-2 text-xs leading-5 text-zinc-500"><li>Led platform modernization across shared services.</li><li>Built observability workflows that made releases easier to diagnose.</li></ul></div>
      <div className="bg-zinc-950 p-5 sm:p-6"><SectionTag icon={GraduationCap}>Background</SectionTag><p className="mt-6 text-sm font-semibold text-white">B.S. Computer Science</p><p className="mt-1 text-xs text-zinc-500">Stanford University</p><div className="mt-5 flex items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.025] p-3"><Award className="h-4 w-4 text-zinc-300" /><span className="text-[10px] text-zinc-400">Google Cloud Professional Architect</span></div></div>
      <div className="bg-zinc-950 p-5 sm:col-span-2 sm:p-6"><div className="flex flex-wrap gap-2">{skills.map((skill) => <span key={skill} className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-[10px] text-zinc-400">{skill}</span>)}</div></div>
    </div>
  );
}

export function OwnershipControls() {
  const items = [
    { icon: Pencil, title: "Edit where it lives", copy: "Owner controls stay close to your content.", control: <span className="rounded-md border border-white/10 px-2 py-1 font-mono text-[8px] text-zinc-400">EDIT</span> },
    { icon: ShieldCheck, title: "Show what matters", copy: "Keep contribution activity visible or private.", control: <span className="flex h-6 w-11 items-center rounded-full bg-zinc-200 p-1"><span className="ml-auto h-4 w-4 rounded-full bg-zinc-950" /></span> },
    { icon: Eye, title: "See the reach", copy: "Track unique visits without exposing people.", control: <span className="font-mono text-lg text-zinc-100">248</span> },
  ];
  return <div className="grid gap-3">{items.map(({icon:Icon,title,copy,control})=><div key={title} className="flex items-center gap-4 rounded-xl border border-white/[0.09] bg-zinc-950 p-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/[0.06] text-zinc-300"><Icon className="h-4 w-4" /></span><div><p className="text-sm font-medium text-white">{title}</p><p className="mt-1 text-xs text-zinc-600">{copy}</p></div><span className="ml-auto shrink-0">{control}</span></div>)}</div>;
}

export function ProjectFragment() {
  return <div className="pointer-events-none absolute inset-x-0 bottom-[-9rem] mx-auto w-[min(86%,54rem)] opacity-20 blur-[1px]"><ProjectCard project={projects[1]} /></div>;
}
