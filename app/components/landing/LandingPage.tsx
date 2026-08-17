import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Code2,
  FileText,
  Github,
  Layers3,
  Sparkles,
  UserRound,
} from "lucide-react";
import LandingNav from "./LandingNav";
import {
  ActivityEvidence,
  CareerEvidence,
  OwnershipControls,
  PortfolioPreview,
  ProjectFragment,
  ProjectsEvidence,
} from "./ProductMockups";

const nav = [
  ["Product", "#product"],
  ["How it works", "#how-it-works"],
  ["FAQ", "#faq"],
];

const steps = [
  { icon: Github, title: "Connect GitHub", copy: "Sign in using the account where your work already lives." },
  { icon: Layers3, title: "Connect repositories", copy: "Install the GitHub App for repository access and contribution data." },
  { icon: UserRound, title: "Set the foundation", copy: "Add your role, location, education, skills, and profile picture." },
  { icon: Sparkles, title: "Publish and keep building", copy: "Share your public link, then add projects and experience at your pace." },
];

const faqs = [
  ["What comes from GitHub?", "Your GitHub identity and contribution activity are connected. You choose the projects to feature and write their story."],
  ["Do private repositories appear automatically?", "No. Repositories only become part of your public portfolio when you choose to present them."],
  ["Do I need to code anything?", "No. Guided forms and simple owner controls handle the portfolio content."],
  ["Can I update it later?", "Yes. Keep editing your portfolio as your projects, skills, and experience grow."],
  ["What do visitors see?", "Visitors see the content you publish—not your editing controls or account actions."],
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Byldit home">
      <Image src="/landing/byldit-mark-mono.webp" alt="" width={compact ? 28 : 32} height={compact ? 28 : 32} className="rounded-lg" priority />
      <span className="text-sm font-semibold tracking-[-0.02em] text-white">Byldit</span>
    </Link>
  );
}

function Eyebrow({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return <p className={`font-mono text-[9px] uppercase leading-5 tracking-[0.2em] text-zinc-500 sm:text-[10px] sm:tracking-[0.22em] ${center ? "text-center" : ""}`}>{children}</p>;
}

function PrimaryButton({ className = "" }: { className?: string }) {
  return (
    <a href="/api/github/auth" className={`group inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-zinc-100 px-5 text-sm font-semibold text-zinc-950 transition hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-950 ${className}`}>
      <Github className="h-4 w-4" />Continue with GitHub<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </a>
  );
}

function ProofVisual() {
  return (
    <div className="byldit-proof-visual relative mx-auto h-[330px] w-full max-w-[520px]" aria-label="A résumé transforming into an interactive portfolio">
      <div className="byldit-resume absolute left-[2%] top-12 w-[42%] rounded-xl border border-white/[0.1] bg-[#0d0d0f] p-5 shadow-2xl shadow-black/40 sm:left-[4%] sm:w-[39%]">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4"><FileText className="h-4 w-4 text-zinc-500" /><span className="font-mono text-[8px] text-zinc-700">RESUME.PDF</span></div>
        <div className="mt-5 h-3 w-3/5 rounded-sm bg-zinc-500" />
        <div className="mt-3 h-1.5 w-4/5 rounded-sm bg-zinc-800" />
        <div className="mt-2 h-1.5 w-2/3 rounded-sm bg-zinc-800" />
        <div className="mt-7 space-y-3">{["w-full", "w-[88%]", "w-[72%]", "w-[94%]", "w-[64%]"].map((width) => <div key={width} className={`h-1 rounded-full bg-zinc-800 ${width}`} />)}</div>
        <span className="absolute -bottom-3 -right-3 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-zinc-950 font-mono text-[8px] text-zinc-500">PDF</span>
      </div>

      <div className="absolute left-[37%] top-[48%] z-10 hidden w-[22%] items-center sm:flex"><span className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-zinc-400" /><ArrowRight className="h-4 w-4 text-zinc-400" /></div>

      <div className="byldit-proof-stack absolute right-[2%] top-4 w-[55%] sm:right-0 sm:w-[52%]">
        <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-xl border border-white/[0.05] bg-[#09090b]" />
        <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-xl border border-white/[0.07] bg-[#0b0b0d]" />
        <div className="relative rounded-xl border border-white/[0.13] bg-[#0d0d0f] p-4 shadow-2xl shadow-black/50">
          <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-zinc-200 text-[9px] font-semibold text-zinc-950">M</span><div><div className="h-2 w-16 rounded-sm bg-zinc-300" /><div className="mt-1.5 h-1 w-11 rounded-sm bg-zinc-700" /></div></div>
          <div className="mt-4 rounded-lg border border-white/[0.08] p-3"><div className="flex items-center gap-2 font-mono text-[7px] text-zinc-500"><Code2 className="h-3 w-3" />PROJECT</div><div className="mt-3 h-10 rounded-md bg-[linear-gradient(135deg,#222226,#0d0d0f)]" /><div className="mt-3 h-1.5 w-20 rounded-sm bg-zinc-400" /><div className="mt-2 h-1 w-full rounded-sm bg-zinc-800" /></div>
          <div className="mt-3 grid grid-cols-[repeat(18,minmax(0,1fr))] gap-1">{Array.from({ length: 54 }, (_, index) => <span key={index} className={`aspect-square rounded-[1px] ${index % 13 === 0 || index % 17 === 0 ? "bg-zinc-300" : index % 5 === 0 ? "bg-zinc-700" : "bg-white/[0.04]"}`} />)}</div>
        </div>
        <span className="byldit-proof-pulse absolute -right-3 top-1/2 h-2 w-2 rounded-full bg-white" />
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="byldit-root min-h-screen overflow-hidden bg-[#080809] text-zinc-100 selection:bg-zinc-100 selection:text-zinc-950">
      <LandingNav />

      <section className="byldit-grid relative px-5 pb-24 pt-36 sm:px-8 sm:pb-32 sm:pt-40">
        <div className="relative z-10 mx-auto max-w-[1280px] text-center">
          <Eyebrow center>Built from your GitHub. Finished by you.</Eyebrow>
          <h1 className="mx-auto mt-7 max-w-[1120px] font-semibold tracking-[-0.055em] text-white">
            <span className="mx-auto block w-fit text-[clamp(2.55rem,5.3vw,5.5rem)] leading-[0.94] lg:whitespace-nowrap">The code shows how.</span>
            <span className="mx-auto mt-4 block w-fit text-[clamp(2.25rem,3.9vw,4.2rem)] leading-[0.96] text-zinc-500 lg:whitespace-nowrap">The portfolio shows why.</span>
            <span className="mx-auto mt-5 block w-fit text-[clamp(1.95rem,3vw,3.35rem)] leading-none tracking-[-0.04em] text-zinc-300">That’s the story.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">Bring your projects, contributions, skills, and experience into one link that shows what you can actually do.</p>
          <div className="mt-8 flex justify-center"><PrimaryButton className="w-full sm:w-auto" /></div>
          <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[10px] text-zinc-600">{["Guided setup", "No code required", "One link to share"].map((item) => <span key={item} className="flex items-center gap-2"><Check className="h-3 w-3 text-zinc-400" />{item}</span>)}</div>
        </div>
        <div className="relative z-10 mx-auto mt-20 w-full max-w-[1120px] sm:mt-24"><div className="pointer-events-none absolute inset-x-[8%] bottom-[-6%] h-28 rounded-full bg-white/[0.035] blur-[70px]" /><PortfolioPreview /></div>
      </section>

      <section id="product" className="scroll-mt-28 px-5 py-24 sm:px-8 lg:py-36">
        <div className="mx-auto grid max-w-[1120px] items-center gap-12 border-y border-white/[0.08] py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:py-28">
          <div>
            <Eyebrow>Built for proof</Eyebrow>
            <h2 className="mt-6 text-[clamp(3.2rem,7vw,6.7rem)] font-semibold leading-[0.88] tracking-[-0.065em] text-white">Show the work.<br /><span className="text-zinc-600">Skip the<br className="hidden sm:block" /> résumé PDF.</span></h2>
            <p className="mt-7 max-w-lg text-base leading-7 text-zinc-400">Turn repository links, job titles, and credentials into proof people can actually explore.</p>
          </div>
          <ProofVisual />
        </div>

        <div className="mx-auto max-w-[1120px]">
          <div className="grid items-center gap-10 border-b border-white/[0.08] py-20 lg:grid-cols-2 lg:gap-20 lg:py-28"><div><span className="font-mono text-[10px] text-zinc-700">01 / PROJECTS</span><h3 className="mt-5 text-3xl font-semibold tracking-[-0.035em] text-white">Projects, with the why.</h3><p className="mt-4 max-w-md text-sm leading-6 text-zinc-500">Add the story, stack, repository, live link, and demo behind what you shipped.</p></div><ProjectsEvidence /></div>
          <div className="grid items-center gap-10 border-b border-white/[0.08] py-20 lg:grid-cols-2 lg:gap-20 lg:py-28"><ActivityEvidence /><div className="lg:pl-8"><span className="font-mono text-[10px] text-zinc-700">02 / ACTIVITY</span><h3 className="mt-5 text-3xl font-semibold tracking-[-0.035em] text-white">Proof that keeps moving.</h3><p className="mt-4 max-w-md text-sm leading-6 text-zinc-500">Your full year of GitHub activity stays connected, so the portfolio keeps changing with your work.</p></div></div>
          <div className="grid items-center gap-10 border-b border-white/[0.08] py-20 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20 lg:py-28"><div><span className="font-mono text-[10px] text-zinc-700">03 / CAREER</span><h3 className="mt-5 text-3xl font-semibold tracking-[-0.035em] text-white">More than code.</h3><p className="mt-4 max-w-md text-sm leading-6 text-zinc-500">Bring your experience, skills, education, certifications, and ways to reach you into the same story.</p></div><CareerEvidence /></div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto grid max-w-[1120px] gap-12 border-b border-white/[0.08] pb-24 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:gap-24 lg:pb-32"><div><Eyebrow>Yours to keep shaping</Eyebrow><h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-6xl">It grows when<br />you do.</h2><p className="mt-6 max-w-md text-base leading-7 text-zinc-400">Update your portfolio as your work changes—no code, no rebuild, no starting over.</p></div><OwnershipControls /></div>
      </section>

      <section id="how-it-works" className="scroll-mt-28 px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-[1120px]"><div className="grid gap-6 lg:grid-cols-2 lg:items-end"><div><Eyebrow>Four steps. No guesswork.</Eyebrow><h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-6xl">From GitHub<br />to live.</h2></div><p className="max-w-md text-sm leading-6 text-zinc-400 lg:justify-self-end">Follow the guided setup once, then keep refining your portfolio whenever your work changes.</p></div>
          <div className="mt-16 grid border-y border-white/[0.08] sm:grid-cols-2 lg:grid-cols-4">{steps.map(({ icon: Icon, title, copy }, index) => <article key={title} className="border-b border-white/[0.08] p-6 sm:border-r sm:p-7 lg:border-b-0 last:border-r-0"><div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 text-zinc-400"><Icon className="h-5 w-5" /></span><span className="font-mono text-[9px] text-zinc-700">0{index + 1}</span></div><h3 className="mt-10 text-base font-semibold text-white">{title}</h3><p className="mt-3 text-xs leading-5 text-zinc-500">{copy}</p></article>)}</div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-28 px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto grid max-w-[1000px] gap-12 border-t border-white/[0.08] pt-24 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20 lg:pt-32"><div><Eyebrow>Before you connect</Eyebrow><h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">Good to know.</h2></div><div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">{faqs.map(([question, answer]) => <details key={question} className="group"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-6 text-sm font-medium text-white [&::-webkit-details-marker]:hidden">{question}<ChevronDown className="h-4 w-4 shrink-0 text-zinc-600 transition group-open:rotate-180" /></summary><p className="max-w-2xl pb-6 pr-8 text-sm leading-6 text-zinc-400">{answer}</p></details>)}</div></div>
      </section>

      <section className="relative overflow-hidden px-5 py-28 sm:px-8 lg:py-40"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,.045),transparent_48%)]" /><ProjectFragment /><div className="relative z-10 mx-auto max-w-4xl text-center"><Eyebrow center>Ready when your work is</Eyebrow><h2 className="mt-6 text-4xl font-semibold leading-[1.02] tracking-[-0.055em] text-white sm:text-7xl">Stop explaining your work.<br /><span className="text-zinc-500">Show it.</span></h2><p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-400">Bring the proof, progress, and story together—and share one link that does them justice.</p><div className="mt-9 flex justify-center"><PrimaryButton className="w-full sm:w-auto" /></div></div></section>

      <footer className="border-t border-white/[0.08] px-5 py-10 sm:px-8"><div className="mx-auto flex max-w-[1120px] flex-col gap-8 sm:flex-row sm:items-center sm:justify-between"><div><Brand compact /><p className="mt-3 text-xs text-zinc-600">One home for the work behind the developer.</p></div><div className="flex flex-wrap gap-x-5 gap-y-3 text-xs text-zinc-600">{nav.map(([label, href]) => <a key={label} href={href} className="transition hover:text-white">{label}</a>)}<a href="https://github.com/Jigar18/Portfolio-Creator" className="transition hover:text-white">GitHub</a><Link href="/login" className="transition hover:text-white">Log in</Link></div></div><div className="mx-auto mt-8 max-w-[1120px] border-t border-white/[0.06] pt-5 font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-800">© {new Date().getFullYear()} Byldit</div></footer>
    </main>
  );
}
