import { Github } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import BrandMark from "../components/BrandMark";
import SheetStack from "../components/SheetStack";
import ThemeToggle from "../components/ThemeToggle";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="ui-dots pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_left,black,transparent_72%)]"
      />
      <header className="relative flex items-center justify-between px-5 py-5 sm:px-10">
        <BrandMark />
        <ThemeToggle />
      </header>

      <div className="relative mx-auto grid w-full max-w-[1180px] flex-1 content-center items-center gap-2 px-5 pb-20 sm:px-10 lg:grid-cols-2 lg:gap-10">
        <div className="flex justify-center lg:order-last">
          <SheetStack motion="land" className="[--stack-scale:0.8] sm:[--stack-scale:1.1] lg:[--stack-scale:1.45]" />
        </div>
        <div className="max-w-[500px]">
          <h1 className="font-display text-[44px] font-semibold leading-[1.02] tracking-[-0.035em] sm:text-[62px]">
            Sign in with GitHub.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">
            Byldit uses your GitHub account, so there is no new password to keep. You choose which
            repositories it can read in the next step.
          </p>
          {/* OAuth sets cookies and redirects off-site, so this needs a full navigation. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/api/github/auth" className={buttonVariants({ size: "lg", className: "mt-9" })}>
            <Github aria-hidden="true" />
            Continue with GitHub
          </a>
          <p className="mt-5 text-[15px] text-ink-soft">
            New here? The same button starts your portfolio.
          </p>
        </div>
      </div>
    </main>
  );
}
