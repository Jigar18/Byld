import {
  Award,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Code2,
  ExternalLink,
  Github,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Play,
  Twitter,
} from "lucide-react";

const heatmap = Array.from({ length: 119 }, (_, index) => {
  if ([3, 8, 19, 20, 34, 51, 72, 86, 87, 104].includes(index)) return 4;
  if (index % 11 === 0 || index % 13 === 0) return 3;
  if (index % 5 === 0 || index % 7 === 0) return 2;
  return index % 3 === 0 ? 1 : 0;
});

const heatColors = [
  "bg-white/[0.045]",
  "bg-cyan-950",
  "bg-cyan-800",
  "bg-cyan-500",
  "bg-cyan-200",
];

function BrowserFrame({
  children,
  className = "",
  label = "portfolio.dev/alex",
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={`overflow-hidden border border-white/10 bg-[#090d11] shadow-2xl shadow-black/40 ${className}`}
    >
      <div className="flex h-10 items-center gap-3 border-b border-white/10 bg-white/[0.035] px-4">
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-cyan-300/80" />
        </div>
        <div className="flex h-5 flex-1 items-center rounded bg-black/30 px-2 font-mono text-[8px] text-zinc-600">
          {label}
        </div>
      </div>
      {children}
    </div>
  );
}

function HeatmapGrid({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`grid grid-flow-col grid-rows-7 gap-1 ${
        compact ? "w-full" : "w-full min-w-[28rem]"
      }`}
      aria-label="Sample contribution heatmap"
    >
      {heatmap.map((level, index) => (
        <span
          key={index}
          className={`aspect-square min-h-1.5 rounded-[2px] border border-white/[0.04] ${heatColors[level]}`}
        />
      ))}
    </div>
  );
}

export function HeroPortfolioPreview() {
  return (
    <div className="relative mx-auto h-[22rem] w-full max-w-[42rem] [perspective:1400px] sm:h-[36rem]">
      <div className="absolute left-1/2 top-0 h-[36rem] w-[36rem] origin-top -translate-x-1/2 scale-[0.58] sm:left-0 sm:h-full sm:w-full sm:translate-x-0 sm:scale-100">
      <div className="absolute left-0 top-24 z-20 w-[42%] -rotate-6 border border-white/10 bg-[#0d1117]/95 p-4 shadow-2xl shadow-black/50 sm:-left-12 sm:top-28">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Github className="h-4 w-4" />
          <span className="font-mono text-[10px] text-zinc-300">
            github.com/alex
          </span>
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center bg-gradient-to-br from-cyan-300 to-blue-600 font-mono text-xs font-bold text-zinc-950">
            AC
          </div>
          <div>
            <p className="text-xs font-medium text-white">Alex Chen</p>
            <p className="mt-1 font-mono text-[8px] text-zinc-500">
              34 repositories
            </p>
          </div>
        </div>
        <div className="mt-5 overflow-hidden">
          <HeatmapGrid compact />
        </div>
      </div>

      <div className="absolute left-[34%] top-20 z-30 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-200 sm:left-[38%]">
        <span className="h-px w-7 bg-cyan-300/50" />
        Syncing
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_14px_#67e8f9]" />
      </div>

      <div className="absolute right-0 top-5 z-10 w-[70%] [transform:rotateY(-10deg)_rotateX(5deg)_rotateZ(1deg)] sm:w-[68%]">
        <BrowserFrame className="rounded-sm">
          <div className="p-5 sm:p-7">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-cyan-300">
                  Software engineer
                </p>
                <h3 className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  Alex Chen
                </h3>
                <p className="mt-2 max-w-[17rem] text-[10px] leading-4 text-zinc-500">
                  I build reliable systems and thoughtful interfaces.
                </p>
              </div>
              <div className="h-11 w-11 border border-cyan-300/30 bg-[linear-gradient(145deg,#164e63,#111827)]" />
            </div>
            <div className="mt-6 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-500">
                  Selected work
                </span>
                <span className="text-[8px] text-cyan-300">04 projects</span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {["Realtime editor", "Deploy monitor"].map((project, index) => (
                  <div
                    key={project}
                    className="border border-white/10 bg-white/[0.025] p-3"
                  >
                    <div
                      className={`h-12 ${
                        index
                          ? "bg-[linear-gradient(125deg,#172554,#164e63)]"
                          : "bg-[linear-gradient(125deg,#083344,#18181b)]"
                      }`}
                    />
                    <p className="mt-3 text-[10px] font-medium text-zinc-200">
                      {project}
                    </p>
                    <p className="mt-1 font-mono text-[7px] text-zinc-600">
                      TypeScript · React · Node
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 border-t border-white/10 pt-4">
              <HeatmapGrid />
            </div>
          </div>
        </BrowserFrame>
      </div>

      <div className="absolute bottom-4 right-4 z-30 border border-cyan-300/20 bg-[#081116]/90 px-3 py-2 font-mono text-[9px] text-cyan-200 shadow-xl shadow-cyan-950/40 backdrop-blur">
        <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Portfolio published
      </div>
      </div>
    </div>
  );
}

export function ProjectMockup() {
  return (
    <BrowserFrame className="rounded-sm">
      <div className="grid gap-0 md:grid-cols-[1.05fr_0.95fr]">
        <div className="relative min-h-64 overflow-hidden border-b border-white/10 bg-[linear-gradient(145deg,#083344_0%,#111827_52%,#09090b_100%)] p-6 md:border-b-0 md:border-r">
          <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full border border-cyan-300/20" />
          <div className="absolute right-4 top-6 h-24 w-36 border border-white/10 bg-black/20 p-2 shadow-2xl">
            <div className="grid h-full place-items-center border border-white/5 bg-black/20">
              <Play className="h-6 w-6 text-cyan-200" fill="currentColor" />
            </div>
          </div>
          <div className="absolute bottom-5 left-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-cyan-300">
              Live demo · 01:42
            </p>
            <p className="mt-2 text-sm font-medium text-white">
              Multiplayer editor
            </p>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">
              Project 01
            </span>
            <ExternalLink className="h-4 w-4 text-zinc-500" />
          </div>
          <h4 className="mt-6 text-xl font-semibold text-white">
            Canvas / Realtime
          </h4>
          <p className="mt-3 text-xs leading-5 text-zinc-500">
            A collaborative editor engineered for low-latency sessions and
            resilient offline updates.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["Next.js", "WebSockets", "Redis", "Postgres"].map((item) => (
              <span
                key={item}
                className="border border-white/10 bg-white/[0.035] px-2 py-1 font-mono text-[8px] text-zinc-400"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="mt-7 border-t border-white/10 pt-4">
            <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-600">
              Outcome
            </p>
            <p className="mt-2 text-xs text-zinc-300">
              34% faster sync under unstable connections.
            </p>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

export function HeatmapMockup() {
  return (
    <div className="border border-white/10 bg-[#090d11] p-5 shadow-2xl shadow-black/30 sm:p-7">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center border border-cyan-300/20 bg-cyan-300/[0.06]">
            <Github className="h-4 w-4 text-cyan-200" />
          </span>
          <div>
            <p className="text-xs font-medium text-white">GitHub activity</p>
            <p className="mt-1 font-mono text-[8px] text-zinc-600">
              Synced 12 seconds ago
            </p>
          </div>
        </div>
        <span className="hidden items-center gap-2 font-mono text-[8px] uppercase tracking-[0.15em] text-emerald-300 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live
        </span>
      </div>
      <div className="mt-8 overflow-hidden">
        <HeatmapGrid />
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 font-mono text-[8px] text-zinc-600">
        <span>843 contributions in 2026</span>
        <span className="flex items-center gap-1">
          Less
          {heatColors.map((color) => (
            <span
              key={color}
              className={`h-2.5 w-2.5 rounded-[2px] ${color}`}
            />
          ))}
          More
        </span>
      </div>
    </div>
  );
}

export function CredentialsMockup() {
  const rows = [
    {
      icon: Award,
      label: "AWS Certified Developer",
      meta: "Amazon Web Services · 2026",
    },
    {
      icon: GraduationCap,
      label: "B.Tech, Computer Science",
      meta: "State University · 2022—2026",
    },
    {
      icon: Code2,
      label: "TypeScript · React · Spring",
      meta: "Primary toolkit",
    },
  ];
  return (
    <div className="border border-white/10 bg-[#090d11] p-6 shadow-2xl shadow-black/30">
      <div className="flex items-end justify-between border-b border-white/10 pb-4">
        <div>
          <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-cyan-300">
            Credentials
          </p>
          <p className="mt-2 text-sm font-medium text-white">
            Proof, without the clutter
          </p>
        </div>
        <span className="font-mono text-[8px] text-zinc-600">03 verified</span>
      </div>
      {rows.map(({ icon: Icon, label, meta }) => (
        <div
          key={label}
          className="flex items-center gap-4 border-b border-white/[0.07] py-5 last:border-0"
        >
          <span className="grid h-9 w-9 place-items-center border border-white/10 bg-white/[0.03] text-zinc-400">
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-medium text-zinc-200">{label}</p>
            <p className="mt-1 font-mono text-[8px] text-zinc-600">{meta}</p>
          </div>
          <Check className="ml-auto h-3.5 w-3.5 text-cyan-300" />
        </div>
      ))}
    </div>
  );
}

export function ExperienceMockup() {
  const roles = [
    {
      year: "2025—NOW",
      role: "Senior Software Engineer",
      company: "Northstar Labs",
      detail: "Led the platform team shipping a new deployment control plane.",
    },
    {
      year: "2023—25",
      role: "Full-stack Engineer",
      company: "Relay Systems",
      detail: "Cut onboarding time by 41% across the developer experience.",
    },
  ];
  return (
    <div className="border border-white/10 bg-[#090d11] p-6 shadow-2xl shadow-black/30">
      <div className="flex items-center gap-3 border-b border-white/10 pb-5">
        <BriefcaseBusiness className="h-4 w-4 text-cyan-200" />
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400">
          Experience
        </span>
      </div>
      <div>
        {roles.map((role, index) => (
          <div
            key={role.role}
            className="grid grid-cols-[4.75rem_1fr] gap-4 border-b border-white/[0.07] py-6 last:border-0 sm:grid-cols-[6rem_1fr]"
          >
            <div className="relative font-mono text-[8px] text-zinc-600">
              {role.year}
              <span className="absolute right-0 top-0 h-2 w-2 translate-x-[1.18rem] rounded-full border border-cyan-200 bg-[#090d11] shadow-[0_0_10px_rgba(103,232,249,0.6)]" />
              {index === 0 && (
                <span className="absolute -bottom-6 right-0 top-2 w-px translate-x-[1.4rem] bg-white/10" />
              )}
            </div>
            <div className="border-l border-white/10 pl-5">
              <p className="text-sm font-medium text-white">{role.role}</p>
              <p className="mt-1 text-xs text-cyan-300/80">{role.company}</p>
              <p className="mt-3 max-w-md text-xs leading-5 text-zinc-500">
                {role.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ConnectMockup() {
  const links = [
    { icon: Github, label: "GitHub", value: "@alexchen" },
    { icon: Linkedin, label: "LinkedIn", value: "/in/alexchen" },
    { icon: Twitter, label: "X / Twitter", value: "@alexbuilds" },
    { icon: Mail, label: "Email", value: "hello@alex.dev" },
  ];
  return (
    <div className="grid gap-px border border-white/10 bg-white/10 shadow-2xl shadow-black/30 sm:grid-cols-2">
      {links.map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          className="group flex items-center gap-4 bg-[#090d11] p-5 transition hover:bg-[#0b151b]"
        >
          <span className="grid h-10 w-10 place-items-center border border-white/10 bg-white/[0.03] transition group-hover:border-cyan-300/30">
            <Icon className="h-4 w-4 text-zinc-400 group-hover:text-cyan-200" />
          </span>
          <div>
            <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-600">
              {label}
            </p>
            <p className="mt-1 text-xs text-zinc-300">{value}</p>
          </div>
          <ChevronRight className="ml-auto h-4 w-4 text-zinc-700 transition group-hover:translate-x-1 group-hover:text-cyan-300" />
        </div>
      ))}
      <div className="col-span-full flex items-center gap-3 bg-[#071014] px-5 py-4 font-mono text-[9px] text-cyan-200">
        <MapPin className="h-3.5 w-3.5" />
        Open to remote roles · Bengaluru, India
      </div>
    </div>
  );
}
