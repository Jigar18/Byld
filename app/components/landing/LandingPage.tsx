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
import { RevealOnce } from "./ProjectModalMockup";
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

const proofProjects = [
  { name: "Stratos", stack: "Java · Spring", background: "repeating-linear-gradient(45deg, #252a29 0 5px, #111413 5px 10px)" },
  { name: "Relay", stack: "React · Node.js", background: "radial-gradient(circle at 25% 30%, #78827f 0 8%, transparent 9%), linear-gradient(135deg, #292f2d, #101312)" },
  { name: "Orbit", stack: "TypeScript", background: "linear-gradient(90deg, transparent 46%, #5d6864 47% 52%, transparent 53%), linear-gradient(#191d1c 48%, #707a76 49% 52%, #191d1c 53%)" },
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

function FeatureDivider() {
  return (
    <div aria-hidden="true" className="mx-auto flex h-14 w-full max-w-[1120px] items-center sm:h-16">
      <span className="h-px w-full bg-gradient-to-r from-white/[0.04] via-white/[0.3] to-white/[0.04]" />
    </div>
  );
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
    <div className="byldit-proof-visual relative mx-auto h-[360px] w-full max-w-[590px]" aria-label="A résumé PDF transforming into a personal developer portfolio">
      <div className="byldit-resume byldit-shadow-proof absolute left-0 top-8 w-[44%] -rotate-2 rounded-lg border border-white/[0.14] bg-[#111315] p-4 sm:left-[2%] sm:p-5">
        <div className="flex items-center justify-between border-b border-white/[0.1] pb-3">
          <div className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-[#9AA8A3]" /><span className="font-mono text-[7px] text-[#9AA8A3]">ALEX_RESUME.PDF</span></div>
          <span className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[6px] text-zinc-600">1 PAGE</span>
        </div>
        <div className="mt-4"><p className="text-[13px] font-semibold tracking-[-0.02em] text-[#F2F7F5]">Alex</p><p className="mt-1 font-mono text-[7px] uppercase tracking-[0.12em] text-[#9AA8A3]">Senior software engineer</p></div>
        <div className="mt-5 border-t border-white/[0.08] pt-3">
          <p className="font-mono text-[6px] font-semibold uppercase tracking-[0.18em] text-[#7FE0C3]">Experience</p>
          <div className="mt-2 flex items-start justify-between gap-2"><p className="text-[8px] font-medium text-zinc-300">Senior Engineer · OpenAI</p><span className="font-mono text-[6px] text-zinc-600">2023—NOW</span></div>
          <ul className="mt-2 space-y-1.5 text-[7px] leading-[1.45] text-zinc-500"><li>• Built reliable developer platforms.</li><li>• Shipped collaborative tooling.</li><li>• Improved release speed by 35%.</li></ul>
        </div>
        <div className="mt-4 border-t border-white/[0.08] pt-3"><p className="font-mono text-[6px] uppercase tracking-[0.18em] text-zinc-500">Skills</p><p className="mt-2 text-[7px] text-zinc-500">TypeScript · React · Node.js · PostgreSQL</p></div>
        <span className="absolute -bottom-3 -right-3 grid h-9 w-9 place-items-center rounded-full border border-white/[0.12] bg-[#111315] font-mono text-[7px] text-[#9AA8A3]">PDF</span>
      </div>

      <div className="absolute left-[39%] top-[47%] z-20 hidden w-[19%] items-center sm:flex"><span className="h-px flex-1 bg-gradient-to-r from-zinc-700 to-[#7FE0C3]" /><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#7FE0C3]/30 bg-[#0c1512] text-[#7FE0C3]"><ArrowRight className="h-3.5 w-3.5" /></span></div>

      <div className="byldit-proof-stack absolute right-0 top-3 w-[58%] rotate-1">
        <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-xl border border-white/[0.05] bg-[#090b0b]" />
        <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-xl border border-white/[0.08] bg-[#0d1010]" />
        <div className="byldit-shadow-proof relative overflow-hidden rounded-xl border border-white/[0.16] bg-[#0a0b0b]">
          <div className="flex h-8 items-center border-b border-white/[0.09] bg-white/[0.025] px-3"><div className="flex gap-1"><span className="h-1.5 w-1.5 rounded-full bg-zinc-600" /><span className="h-1.5 w-1.5 rounded-full bg-zinc-700" /><span className="h-1.5 w-1.5 rounded-full bg-[#7FE0C3]" /></div><span className="mx-auto rounded bg-black/20 px-5 py-1 font-mono text-[6px] text-zinc-500">byldit.vercel.app/alex</span></div>
          <div className="p-3">
            <div className="flex items-center gap-2.5 rounded-lg border border-white/[0.11] bg-white/[0.025] p-3">
              <Image src="/landing/demo-avatar-mono.webp" alt="" width={36} height={36} className="h-9 w-9 rounded-full border-2 border-zinc-600 object-cover" />
              <div><p className="text-[10px] font-semibold text-[#F2F7F5]">Alex</p><p className="mt-0.5 text-[6px] text-[#9AA8A3]">Senior Software Engineer</p><p className="mt-1 font-mono text-[5px] text-zinc-600">Earth, Milky Way</p></div>
              <span className="ml-auto rounded-md border border-white/[0.1] bg-white/[0.03] px-2 py-1.5 font-mono text-[6px] text-[#9AA8A3]">OPENAI</span>
            </div>

            <div className="mt-3 border-l border-[#7FE0C3]/25 pl-3"><p className="font-mono text-[6px] uppercase tracking-[0.18em] text-[#7FE0C3]">About me</p><p className="mt-2 text-[6px] leading-[1.55] text-zinc-500">I build scalable developer tools with a focus on reliability, thoughtful engineering, and software that stays adaptable as teams grow.</p></div>

            <div className="mt-3 border-t border-white/[0.08] pt-3"><div className="flex items-center justify-between"><div className="flex items-center gap-1.5"><span className="grid h-5 w-5 place-items-center rounded border border-[#7FE0C3]/20 text-[#7FE0C3]"><Code2 className="h-2.5 w-2.5" /></span><div><p className="font-mono text-[6px] uppercase tracking-[0.18em] text-[#7FE0C3]">Projects</p><p className="mt-0.5 text-[5px] text-zinc-600">Selected work and proof of craft.</p></div></div><span className="rounded border border-white/[0.09] px-1.5 py-1 font-mono text-[5px] text-zinc-600">+ ADD</span></div>
              <div className="mt-2.5 grid grid-cols-3 gap-1.5">{proofProjects.map((project) => <article key={project.name} className="overflow-hidden rounded-md border border-white/[0.1] bg-[#101212]"><div className="h-10 border-b border-white/[0.08]" style={{ background: project.background }} /><div className="p-2"><p className="text-[7px] font-semibold text-[#F2F7F5]">{project.name}</p><p className="mt-1 font-mono text-[4px] text-zinc-600">{project.stack}</p></div></article>)}</div>
            </div>
          </div>
        </div>
        <span className="byldit-proof-pulse absolute -right-3 top-1/2 h-2 w-2 rounded-full bg-[#7FE0C3]" />
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="byldit-root min-h-screen overflow-hidden bg-[#121212] text-zinc-100 selection:bg-zinc-100 selection:text-zinc-950">
      <LandingNav />

      <section className="byldit-grid relative px-5 pb-24 pt-44 sm:px-8 sm:pb-32 sm:pt-48 lg:pt-52">
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
        <div className="relative z-10 mx-auto mt-20 w-full max-w-[1120px] sm:mt-24"><div className="pointer-events-none absolute inset-x-[26%] bottom-[-2%] h-16 rounded-full bg-white/[0.012] blur-[40px]" /><PortfolioPreview /></div>
      </section>

      <section id="product" className="scroll-mt-28 px-5 py-24 sm:px-8 lg:py-36">
        <FeatureDivider />
        <div className="mx-auto grid max-w-[1120px] items-center gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:py-28">
          <div>
            <Eyebrow>Built for proof</Eyebrow>
            <h2 className="mt-6 text-[clamp(3.2rem,7vw,6.7rem)] font-semibold leading-[0.88] tracking-[-0.065em] text-[#F2F7F5]"><span className="block">Show the <span className="relative inline-block">work.<span className="absolute inset-x-0 bottom-[-0.04em] h-[0.07em] rounded-full bg-[#7FE0C3]" /></span></span><span className="mt-[0.16em] block">Skip the<br className="hidden sm:block" /> résumé PDF.</span></h2>
            <p className="mt-7 max-w-lg text-base leading-7 text-zinc-400">Turn repository links, job titles, and credentials into proof people can actually explore.</p>
          </div>
          <ProofVisual />
        </div>

        <div className="mx-auto max-w-[1120px]">
          <FeatureDivider />
          <div className="grid items-center gap-10 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28"><RevealOnce><div><span className="font-mono text-[10px] text-zinc-700">01 / PROJECTS</span><h3 className="mt-5 text-[clamp(2.25rem,3.4vw,3.5rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-white">Projects, with the why.</h3><p className="mt-5 max-w-lg text-base leading-7 text-zinc-500 sm:text-lg sm:leading-8">Add the story, stack, repository, live link, and demo behind what you shipped.</p></div></RevealOnce><ProjectsEvidence /></div>
          <FeatureDivider />
          <div className="grid items-center gap-10 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:py-28"><div className="order-2 lg:order-1"><ActivityEvidence /></div><div className="order-1 lg:order-2 lg:pl-8"><span className="font-mono text-[10px] text-zinc-700">02 / ACTIVITY</span><h3 className="mt-5 text-[clamp(2.25rem,3.4vw,3.5rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-white">Proof that keeps moving.</h3><p className="mt-5 max-w-lg text-base leading-7 text-zinc-500 sm:text-lg sm:leading-8">Your full year of GitHub activity stays connected, so the portfolio keeps changing with your work.</p></div></div>
          <FeatureDivider />
          <div className="grid items-center gap-10 py-20 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20 lg:py-28"><div><span className="font-mono text-[10px] text-zinc-700">03 / CAREER</span><h3 className="mt-5 text-[clamp(2.25rem,3.4vw,3.5rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-white">More than code.</h3><p className="mt-5 max-w-lg text-base leading-7 text-zinc-500 sm:text-lg sm:leading-8">Bring your experience, skills, education, certifications, and ways to reach you into the same story.</p></div><CareerEvidence /></div>
          <FeatureDivider />
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto grid max-w-[1120px] gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:gap-24"><div><Eyebrow>Yours to keep shaping</Eyebrow><h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-6xl">It grows when<br />you do.</h2><p className="mt-6 max-w-md text-base leading-7 text-zinc-400">Update your portfolio as your work changes—no code, no rebuild, no starting over.</p></div><OwnershipControls /></div>
        <FeatureDivider />
      </section>

      <section id="how-it-works" className="scroll-mt-28 px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-[1120px]"><div className="grid gap-6 lg:grid-cols-2 lg:items-end"><div><Eyebrow>Four steps. No guesswork.</Eyebrow><h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-6xl">From GitHub<br />to live.</h2></div><p className="max-w-md text-sm leading-6 text-zinc-400 lg:justify-self-end">Follow the guided setup once, then keep refining your portfolio whenever your work changes.</p></div>
          <div className="mt-16 grid border-y border-white/[0.08] sm:grid-cols-2 lg:grid-cols-4">{steps.map(({ icon: Icon, title, copy }, index) => <article key={title} className="border-b border-white/[0.08] p-6 sm:border-r sm:p-7 lg:border-b-0 last:border-r-0"><div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 text-zinc-400"><Icon className="h-5 w-5" /></span><span className="font-mono text-[9px] text-zinc-700">0{index + 1}</span></div><h3 className="mt-10 text-base font-semibold text-white">{title}</h3><p className="mt-3 text-xs leading-5 text-zinc-500">{copy}</p></article>)}</div>
        </div>
        <FeatureDivider />
      </section>

      <section id="faq" className="scroll-mt-28 px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto grid max-w-[1000px] gap-12 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20"><div><Eyebrow>Before you connect</Eyebrow><h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">Good to know.</h2></div><div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">{faqs.map(([question, answer]) => <details key={question} className="group"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-6 text-sm font-medium text-white [&::-webkit-details-marker]:hidden">{question}<ChevronDown className="h-4 w-4 shrink-0 text-zinc-600 transition group-open:rotate-180" /></summary><p className="max-w-2xl pb-6 pr-8 text-sm leading-6 text-zinc-400">{answer}</p></details>)}</div></div>
        <FeatureDivider />
      </section>

      <section className="relative overflow-hidden px-5 py-28 sm:px-8 lg:py-40"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,.045),transparent_48%)]" /><ProjectFragment /><div className="relative z-10 mx-auto max-w-4xl text-center"><Eyebrow center>Ready when your work is</Eyebrow><h2 className="mt-6 text-4xl font-semibold leading-[1.02] tracking-[-0.055em] text-white sm:text-7xl">Stop explaining your work.<br /><span className="text-zinc-500">Show it.</span></h2><p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-400">Bring the proof, progress, and story together—and share one link that does them justice.</p><div className="mt-9 flex justify-center"><PrimaryButton className="w-full sm:w-auto" /></div></div></section>

      <footer className="border-t border-white/[0.08] px-5 py-10 sm:px-8"><div className="mx-auto flex max-w-[1120px] flex-col gap-8 sm:flex-row sm:items-center sm:justify-between"><div><Brand compact /><p className="mt-3 text-xs text-zinc-600">One home for the work behind the developer.</p></div><div className="flex flex-wrap gap-x-5 gap-y-3 text-xs text-zinc-600">{nav.map(([label, href]) => <a key={label} href={href} className="transition hover:text-white">{label}</a>)}<a href="https://github.com/Jigar18/Portfolio-Creator" className="transition hover:text-white">GitHub</a><Link href="/login" className="transition hover:text-white">Log in</Link></div></div><div className="mx-auto mt-8 max-w-[1120px] border-t border-white/[0.06] pt-5 font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-800">© {new Date().getFullYear()} Byldit</div></footer>
    </main>
  );
}
