import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Github,
  Layers3,
  Menu,
  Sparkles,
  UserRound,
} from "lucide-react";
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
  ["See it live", "/user/Jigar18"],
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
    <Link href="/" className="flex items-center gap-2.5" aria-label="Byldit home">
      <Image src="/landing/byldit-mark-mono.webp" alt="" width={compact ? 30 : 34} height={compact ? 30 : 34} className="rounded-lg" priority />
      <span className="text-sm font-semibold tracking-[-0.02em] text-white">Byldit</span>
    </Link>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="max-w-[18rem] font-mono text-[9px] uppercase leading-5 tracking-[0.18em] text-zinc-500 sm:max-w-none sm:text-[10px] sm:tracking-[0.22em]">{children}</p>;
}

function PrimaryButton({ className = "" }: { className?: string }) {
  return (
    <a href="/api/github/auth" className={`group inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-zinc-100 px-5 text-sm font-semibold text-zinc-950 transition hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-950 ${className}`}>
      <Github className="h-4 w-4" />Build mine with GitHub<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </a>
  );
}

export default function LandingPage() {
  return (
    <main className="byldit-root min-h-screen overflow-hidden bg-[#09090b] text-zinc-100 selection:bg-zinc-100 selection:text-zinc-950">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.07] bg-[#09090b]/85 backdrop-blur-xl">
        <nav className="mx-auto flex h-[72px] max-w-[1280px] items-center px-5 sm:px-8 lg:px-10" aria-label="Main navigation">
          <Brand />
          <div className="ml-auto hidden items-center gap-7 md:flex">
            {nav.map(([label, href]) => <a key={label} href={href} className="text-xs text-zinc-500 transition hover:text-white">{label}</a>)}
          </div>
          <div className="ml-8 hidden items-center gap-4 md:flex">
            <Link href="/login" className="text-xs font-medium text-zinc-300 transition hover:text-white">Log in</Link>
            <a href="/api/github/auth" className="inline-flex h-9 items-center rounded-lg bg-zinc-100 px-4 text-xs font-semibold text-zinc-950 transition hover:bg-white">Build yours</a>
          </div>
          <details className="group relative ml-auto md:hidden">
            <summary className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-lg border border-white/10 text-zinc-300 [&::-webkit-details-marker]:hidden"><Menu className="h-4 w-4" /><span className="sr-only">Open navigation</span></summary>
            <div className="absolute right-0 top-12 w-64 rounded-xl border border-white/10 bg-zinc-950 p-3 shadow-2xl shadow-black/50">
              {nav.map(([label, href]) => <a key={label} href={href} className="block rounded-lg px-3 py-3 text-sm text-zinc-400 hover:bg-white/5 hover:text-white">{label}</a>)}
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-white/[0.07] pt-3"><Link href="/login" className="grid h-10 place-items-center rounded-lg border border-white/10 text-xs">Log in</Link><a href="/api/github/auth" className="grid h-10 place-items-center rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-950">Build yours</a></div>
            </div>
          </details>
        </nav>
      </header>

      <section className="byldit-grid relative mx-auto grid min-h-[880px] max-w-[1280px] items-center gap-14 px-5 pb-24 pt-32 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:px-10 lg:pt-28">
        <div className="pointer-events-none absolute right-[-12%] top-20 h-[38rem] w-[52rem] rounded-full bg-white/[0.025] blur-[120px]" />
        <div className="relative z-10">
          <Eyebrow>Built from your GitHub. Finished by you.</Eyebrow>
          <h1 className="mt-7 max-w-3xl text-[2.55rem] font-semibold leading-[0.94] tracking-[-0.055em] text-white sm:text-[clamp(3.3rem,7.2vw,6.45rem)] sm:leading-[0.9] sm:tracking-[-0.065em]">
            Your GitHub<br />shows the code.<br /><span className="text-zinc-500">Your portfolio</span><br />tells the story.
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">Bring your projects, contributions, skills, and experience into one link that shows what you can actually do.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row"><PrimaryButton /><Link href="/user/Jigar18" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/12 bg-white/[0.025] px-5 text-sm font-medium text-zinc-300 transition hover:border-white/25 hover:bg-white/[0.06] hover:text-white">See a live portfolio<ArrowRight className="h-4 w-4" /></Link></div>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-zinc-600">{["Guided setup", "No code required", "One link to share"].map(item=><span key={item} className="flex items-center gap-2"><Check className="h-3 w-3 text-zinc-400" />{item}</span>)}</div>
        </div>
        <div className="relative z-10 mx-auto w-full max-w-2xl lg:translate-x-8 lg:rotate-[0.5deg]"><PortfolioPreview compact /></div>
      </section>

      <section id="product" className="scroll-mt-24 border-y border-white/[0.07] bg-[#0c0c0e] px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-[1120px]">
          <div className="grid gap-8 lg:grid-cols-[0.68fr_1.32fr] lg:items-end"><div><Eyebrow>See the result</Eyebrow><h2 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.045em] text-white sm:text-6xl">This is what<br />“done” looks like.</h2></div><p className="max-w-xl text-base leading-7 text-zinc-400 lg:justify-self-end">One focused page for the work, proof, and experience people came to see.</p></div>
          <div className="relative mx-auto mt-16 max-w-[980px]"><PortfolioPreview /></div>
          <div className="mt-8 flex flex-wrap justify-center gap-2">{["Profile & story", "Projects & demos", "GitHub activity", "Experience", "Skills & education", "Credentials", "Contact links"].map(item=><span key={item} className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-[10px] text-zinc-600">{item}</span>)}</div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 lg:py-36">
        <div className="mx-auto max-w-[1120px]">
          <Eyebrow>Built for proof</Eyebrow>
          <h2 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-white sm:text-6xl">Show the work.<br /><span className="text-zinc-600">Skip the résumé PDF.</span></h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400">Turn repository links, job titles, and credentials into proof people can actually explore.</p>

          <div className="mt-20 grid items-center gap-10 border-t border-white/[0.08] py-20 lg:grid-cols-2 lg:gap-20"><div><span className="font-mono text-[10px] text-zinc-700">01 / PROJECTS</span><h3 className="mt-5 text-3xl font-semibold tracking-[-0.035em] text-white">Projects, with the why.</h3><p className="mt-4 max-w-md text-sm leading-6 text-zinc-500">Add the story, stack, repository, live link, and demo behind what you shipped.</p></div><ProjectsEvidence /></div>
          <div className="grid items-center gap-10 border-t border-white/[0.08] py-20 lg:grid-cols-2 lg:gap-20"><ActivityEvidence /><div className="lg:pl-8"><span className="font-mono text-[10px] text-zinc-700">02 / ACTIVITY</span><h3 className="mt-5 text-3xl font-semibold tracking-[-0.035em] text-white">Proof that keeps moving.</h3><p className="mt-4 max-w-md text-sm leading-6 text-zinc-500">Your GitHub contribution heatmap stays connected, so your portfolio does not freeze when you publish it.</p></div></div>
          <div className="grid items-center gap-10 border-y border-white/[0.08] py-20 lg:grid-cols-2 lg:gap-20"><div><span className="font-mono text-[10px] text-zinc-700">03 / CAREER</span><h3 className="mt-5 text-3xl font-semibold tracking-[-0.035em] text-white">More than code.</h3><p className="mt-4 max-w-md text-sm leading-6 text-zinc-500">Bring your experience, skills, education, certifications, and ways to reach you into the same story.</p></div><CareerEvidence /></div>
        </div>
      </section>

      <section className="border-y border-white/[0.07] bg-[#0c0c0e] px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto grid max-w-[1120px] gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:gap-24"><div><Eyebrow>Yours to keep shaping</Eyebrow><h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-6xl">It grows when<br />you do.</h2><p className="mt-6 max-w-md text-base leading-7 text-zinc-400">Update your portfolio as your work changes—no code, no rebuild, no starting over.</p></div><OwnershipControls /></div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 px-5 py-24 sm:px-8 lg:py-36">
        <div className="mx-auto max-w-[1120px]"><div className="grid gap-6 lg:grid-cols-2 lg:items-end"><div><Eyebrow>Four steps. No guesswork.</Eyebrow><h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-6xl">From GitHub<br />to live.</h2></div><p className="max-w-md text-sm leading-6 text-zinc-400 lg:justify-self-end">Follow the guided setup once, then keep refining your portfolio whenever your work changes.</p></div>
          <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2 lg:grid-cols-4">{steps.map(({icon:Icon,title,copy},index)=><article key={title} className="bg-zinc-950 p-6 sm:p-7"><div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300"><Icon className="h-5 w-5" /></span><span className="font-mono text-[9px] text-zinc-700">0{index+1}</span></div><h3 className="mt-10 text-base font-semibold text-white">{title}</h3><p className="mt-3 text-xs leading-5 text-zinc-500">{copy}</p></article>)}</div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 border-y border-white/[0.07] bg-[#0c0c0e] px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto grid max-w-[1000px] gap-12 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20"><div><Eyebrow>Before you connect</Eyebrow><h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">Good to know.</h2></div><div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">{faqs.map(([question,answer])=><details key={question} className="group"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-6 text-sm font-medium text-white [&::-webkit-details-marker]:hidden">{question}<ChevronDown className="h-4 w-4 shrink-0 text-zinc-600 transition group-open:rotate-180" /></summary><p className="max-w-2xl pb-6 pr-8 text-sm leading-6 text-zinc-400">{answer}</p></details>)}</div></div>
      </section>

      <section className="relative overflow-hidden px-5 py-28 sm:px-8 lg:py-40"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,.055),transparent_48%)]" /><ProjectFragment /><div className="relative z-10 mx-auto max-w-4xl text-center"><Eyebrow>Ready when your work is</Eyebrow><h2 className="mt-6 text-4xl font-semibold leading-[1.02] tracking-[-0.055em] text-white sm:text-7xl">Stop explaining your work.<br /><span className="text-zinc-500">Show it.</span></h2><p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-400">Bring the proof, progress, and story together—and share one link that does them justice.</p><div className="mt-9 flex justify-center"><PrimaryButton className="w-full sm:w-auto" /></div></div></section>

      <footer className="border-t border-white/[0.08] bg-[#060607] px-5 py-10 sm:px-8"><div className="mx-auto flex max-w-[1120px] flex-col gap-8 sm:flex-row sm:items-center sm:justify-between"><div><Brand compact /><p className="mt-3 text-xs text-zinc-600">One home for the work behind the developer.</p></div><div className="flex flex-wrap gap-x-5 gap-y-3 text-xs text-zinc-600">{nav.map(([label,href])=><a key={label} href={href} className="transition hover:text-white">{label}</a>)}<a href="https://github.com/Jigar18/Portfolio-Creator" className="transition hover:text-white">GitHub</a><Link href="/login" className="transition hover:text-white">Log in</Link></div></div><div className="mx-auto mt-8 max-w-[1120px] border-t border-white/[0.06] pt-5 font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-800">© {new Date().getFullYear()} Byldit</div></footer>
    </main>
  );
}
