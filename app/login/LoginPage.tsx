"use client";

import { ArrowRight, Github } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-zinc-950 px-6 text-zinc-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.13),transparent_36rem)]" />
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} {...{ className: "relative w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl backdrop-blur-xl" }}>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-400">Portfolio creator</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Build from your real work.</h1>
        <p className="mt-3 leading-7 text-zinc-400">Connect GitHub securely, choose what to show, and publish a portfolio with intent.</p>
        <a href="/api/github/auth" className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 font-medium text-zinc-950 transition hover:-translate-y-0.5 hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-950">
          <Github className="h-5 w-5" /> Continue with GitHub <ArrowRight className="h-4 w-4" />
        </a>
      </motion.section>
    </main>
  );
}
