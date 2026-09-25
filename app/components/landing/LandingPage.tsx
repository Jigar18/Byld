import Image from "next/image";
import Link from "next/link";
import { Github, Plus } from "lucide-react";
import LandingNav from "./LandingNav";
import HeroGraph from "./HeroGraph";
import ProductExplorer from "./ProductExplorer";
import { BranchSteps, PreviewReveal, TypedHandle } from "./LandingMotion";
import { PortfolioPreview } from "./ProductMockups";

const faqs = [
  ["How do I create a portfolio website with Byldit?", "Sign in with GitHub, install the GitHub App, and complete your profile. Add your projects, skills, and experience, then share your public portfolio link."],
  ["Do I need a domain or separate hosting?", "No. Your portfolio is hosted on Byldit at byldit.vercel.app followed by your GitHub username. You can share that link once you finish setup."],
  ["What should a developer portfolio include?", "Start with projects that show the work you want to do. Explain the problem, your contribution, and the result. Add repository links or live demos, then include your skills, experience, and ways to contact you."],
  ["What comes from GitHub?", "Your GitHub identity and contribution activity are connected. You choose the projects to feature and write their story."],
  ["Do private repositories appear automatically?", "No. Repositories only become part of your public portfolio when you choose to present them."],
  ["Do I need to code anything?", "No. Guided forms and simple owner controls handle the portfolio content."],
  ["Can I update it later?", "Yes. Keep editing your portfolio as your projects, skills, and experience grow."],
  ["What do visitors see?", "Visitors see the content you publish—not your editing controls or account actions."],
];

const delay = (ms: number) => ({ "--t": `${ms}ms` }) as React.CSSProperties;

function XLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function PrimaryButton({ className = "" }: { className?: string }) {
  return (
    <a href="/api/github/auth" data-landing-cta className={`inline-flex h-14 items-center justify-center gap-2.5 rounded-full bg-[#F3F4F5] px-7 text-[16px] font-semibold text-[#08080A] shadow-[0_0_0_1px_rgba(255,255,255,0.4)_inset,0_12px_32px_-8px_rgba(243,244,245,0.35)] transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_0_0_1px_rgba(255,255,255,0.5)_inset,0_18px_40px_-8px_rgba(243,244,245,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3F4F5] focus-visible:ring-offset-4 focus-visible:ring-offset-[#08080A] ${className}`}>
      <Github className="h-[18px] w-[18px]" />Continue with GitHub
    </a>
  );
}

function SectionHeading({ title, copy, id }: { title: React.ReactNode; copy?: string; id?: string }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:items-end lg:gap-16">
      <h2 id={id} className="byld-wide max-w-[14em] text-[clamp(2.15rem,4.6vw,4.4rem)] font-bold leading-[1.02] tracking-[-0.045em] text-[#F3F4F5]">{title}</h2>
      {copy && <p className="max-w-sm text-[17px] leading-8 text-[#8E9197] lg:justify-self-end">{copy}</p>}
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="byldit-root relative min-h-screen overflow-hidden bg-[#08080A] text-[#C9CBCF] selection:bg-[#F3F4F5] selection:text-[#08080A]">
      <LandingNav />

      <section className="relative z-10 px-5 pt-32 sm:px-8 sm:pt-36 lg:pt-40">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[720px] bg-[radial-gradient(ellipse_60%_55%_at_30%_0%,rgba(243,244,245,0.045),transparent_70%)]" />
        <div className="relative mx-auto max-w-[1280px]">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
            <h1 className="byld-wide text-[clamp(3rem,8.4vw,7.6rem)] font-[750] leading-[0.94] tracking-[-0.055em] text-[#F3F4F5]">
              <span className="byld-line"><span style={delay(80)}>Show what</span></span>
              <span className="byld-line"><span style={delay(220)}>you’ve built.</span></span>
            </h1>
            <p className="byld-fade max-w-[22rem] text-[17px] leading-8 text-[#8E9197] sm:text-[19px] sm:leading-[1.65] lg:pb-3" style={delay(460)}>
              Your GitHub, turned into a portfolio site in minutes. No code, no hosting.
            </p>
          </div>
          <div className="mt-16 sm:mt-20">
            <HeroGraph />
          </div>
        </div>
      </section>

      <section id="product" aria-labelledby="product-title" className="relative z-10 scroll-mt-24 px-5 pt-32 sm:px-8 lg:pt-48">
        <div className="mx-auto max-w-[1280px]">
          <SectionHeading id="product-title" title="One link that does the explaining." copy="Who you are, what you’ve shipped, and how often you ship." />
          <div className="mt-14 sm:mt-20">
            <PreviewReveal><PortfolioPreview /></PreviewReveal>
          </div>
        </div>
      </section>

      <section aria-labelledby="features-title" className="relative z-10 px-5 pb-32 pt-28 sm:px-8 lg:pb-44 lg:pt-40">
        <div className="mx-auto max-w-[1280px]">
          <SectionHeading id="features-title" title="Everything a repository can’t say." />
          <div className="mt-14 lg:mt-20">
            <ProductExplorer />
          </div>
        </div>
      </section>

      <section id="how-it-works" aria-labelledby="how-title" className="relative z-10 scroll-mt-24 border-y border-[#1D1F22] bg-[#0C0D0F] px-5 py-28 sm:px-8 lg:py-40">
        <div className="mx-auto max-w-[1280px]">
          <SectionHeading id="how-title" title="Live in four steps." />
          <div className="mt-16 lg:mt-24">
            <BranchSteps />
          </div>
        </div>
      </section>

      <section id="faq" aria-labelledby="faq-title" className="relative z-10 scroll-mt-24 px-5 py-28 sm:px-8 lg:py-40">
        <div className="mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div>
            <h2 id="faq-title" className="byld-wide text-[clamp(2.15rem,4.6vw,4.4rem)] font-bold leading-[1.02] tracking-[-0.045em] text-[#F3F4F5] lg:sticky lg:top-32">Before you connect.</h2>
          </div>
          <div className="border-t border-[#1D1F22]">
            {faqs.map(([question, answer]) => (
              <details key={question} className="byld-faq group border-b border-[#1D1F22]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-[17px] font-medium text-[#F3F4F5] transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3F4F5] focus-visible:ring-offset-4 focus-visible:ring-offset-[#08080A] sm:text-lg [&::-webkit-details-marker]:hidden">
                  {question}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#1D1F22] text-[#8E9197] transition duration-300 group-open:rotate-45 group-open:border-[#5C6066] group-open:text-[#F3F4F5]"><Plus className="h-4 w-4" /></span>
                </summary>
                <p className="max-w-2xl pb-7 pr-12 text-[16px] leading-7 text-[#8E9197]">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="cta-title" className="relative z-10 overflow-hidden border-t border-[#1D1F22] px-5 py-32 sm:px-8 lg:py-44">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[520px] bg-[radial-gradient(ellipse_55%_60%_at_50%_100%,rgba(243,244,245,0.05),transparent_70%)]" />
        <div className="relative mx-auto max-w-[1280px]">
          <h2 id="cta-title" className="byld-wide max-w-[13em] text-[clamp(2.3rem,5.4vw,5.2rem)] font-bold leading-[1] tracking-[-0.045em] text-[#F3F4F5]">Your GitHub username is already your address.</h2>
          <p className="byld-mono mt-10 break-all text-[clamp(1.2rem,3.6vw,3.1rem)] leading-tight tracking-[-0.02em] text-[#6B6F75] sm:mt-14">
            byldit.vercel.app/<TypedHandle />
          </p>
          <div className="mt-12 sm:mt-16">
            <PrimaryButton className="w-full sm:w-auto" />
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-[#1D1F22] px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3F4F5]" aria-label="Byldit home">
              <Image src="/landing/byldit-mark-mono.webp" alt="" width={30} height={30} className="rounded-[8px]" />
              <span className="byld-wide text-[16px] font-bold tracking-[-0.03em] text-[#F3F4F5]">Byldit</span>
            </Link>
            <p className="text-[14px] text-[#6B6F75]">Developer portfolios, built from GitHub.</p>
          </div>
          <div className="flex items-center gap-6 text-[#8E9197]">
            <span className="text-[13px] text-[#6B6F75]">© {new Date().getFullYear()} Byldit</span>
            <a href="https://github.com/Jigar18/Byld" target="_blank" rel="noreferrer" aria-label="Byldit on GitHub" className="rounded transition hover:text-[#F3F4F5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3F4F5]"><Github className="h-5 w-5" /></a>
            <a href="https://x.com/jigark0" target="_blank" rel="noreferrer" aria-label="Jigar on X" className="rounded transition hover:text-[#F3F4F5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3F4F5]"><XLogo /></a>
          </div>
        </div>
      </footer>
    </main>
  );
}
