import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import BrandMark from "./BrandMark";
import SheetStack from "./SheetStack";
import ThemeToggle from "./ThemeToggle";

type NotFoundStateProps = {
  kind: "portfolio" | "page";
};

export default function NotFoundState({ kind }: NotFoundStateProps) {
  const isPortfolio = kind === "portfolio";
  const title = isPortfolio
    ? "No portfolio lives at this address."
    : "This page doesn’t exist in the portfolio.";
  const description = isPortfolio
    ? "Check the username in the link, or return to the homepage."
    : "The address may be incorrect, or the page may have moved.";

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
          <SheetStack missing className="[--stack-scale:0.8] sm:[--stack-scale:1.1] lg:[--stack-scale:1.45]" />
        </div>
        <div className="max-w-[520px]">
          <h1 className="font-display text-[40px] font-semibold leading-[1.04] tracking-[-0.035em] sm:text-[56px]">
            {title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">{description}</p>
          <Link href="/" className={buttonVariants({ size: "lg", className: "mt-9" })}>
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
