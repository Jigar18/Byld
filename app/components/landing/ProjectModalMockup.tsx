"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Code2,
  FileText,
  Images,
  Pause,
  Play,
  X,
} from "lucide-react";
import SkillIcon from "../SkillIcon";

const techStack = ["Java", "JavaScript", "Spring Boot", "TypeScript", "React", "PostgreSQL", "Docker", "Ngrok"];
const mockupSkillIcons = { Ngrok: "simple-icons:ngrok" };

export function RevealOnce({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      {...{ className }}
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.46, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionTitle({ icon: Icon, children }: { icon: typeof FileText; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[8px] font-medium text-zinc-200 sm:text-[9px]">
      <span className="grid h-5 w-5 place-items-center rounded border border-white/[0.08] bg-white/[0.025] text-zinc-500">
        <Icon className="h-2.5 w-2.5" />
      </span>
      {children}
    </div>
  );
}

function DemoPreview() {
  return (
    <div className="relative mt-2 h-[96px] overflow-hidden rounded-md border border-white/[0.08] bg-[#08090b]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:18px_18px]" />
      <div className="absolute inset-x-3 top-2.5 flex items-center justify-between font-mono text-[5px] uppercase tracking-[0.12em] text-zinc-600">
        <span>Stratos deployment</span>
        <span className="flex items-center gap-1 text-emerald-500/70"><i className="h-1 w-1 rounded-full bg-emerald-500" />Live</span>
      </div>
      <div className="absolute inset-x-3 top-8 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="rounded border border-white/[0.06] bg-white/[0.025] px-2 py-2">
          <p className="font-mono text-[5px] text-zinc-600">SOURCE</p>
          <p className="mt-0.5 text-[6px] text-zinc-300">spring-api</p>
        </div>
        <span className="h-px w-3 bg-zinc-700" />
        <div className="rounded border border-white/[0.06] bg-white/[0.025] px-2 py-2">
          <p className="font-mono text-[5px] text-zinc-600">STATUS</p>
          <p className="mt-0.5 text-[6px] text-zinc-300">Build passed</p>
        </div>
      </div>
      <button type="button" aria-label="Pause demo preview" className="absolute bottom-2 left-2 grid h-5 w-5 place-items-center rounded-full border border-white/10 bg-zinc-900 text-zinc-300">
        <Pause className="h-2.5 w-2.5 fill-current" />
      </button>
      <div className="absolute bottom-[15px] left-9 right-3 h-px bg-white/[0.08]"><span className="block h-full w-[62%] bg-zinc-400" /></div>
    </div>
  );
}

function ArchitecturePreview() {
  return (
    <div className="relative mt-2 h-[58px] overflow-hidden rounded-md border border-white/[0.08] bg-[#090a0d] px-3 py-2 text-center">
      <p className="text-[6px] font-semibold tracking-[0.08em] text-[#789fe9]">STRATOS SYSTEM ARCHITECTURE</p>
      <div className="mx-auto mt-1 grid w-[64%] gap-1">
        {["Developer + GitHub", "React + Vite Dashboard", "Spring Cloud API Gateway"].map((label) => (
          <span key={label} className="rounded-[2px] border border-zinc-600/70 bg-white/[0.025] py-0.5 text-[4px] text-zinc-300">{label}</span>
        ))}
      </div>
      <span className="absolute bottom-2 left-[7%] rounded-[2px] border border-zinc-700 px-1.5 py-1 text-[4px] text-zinc-500">GitHub Webhooks</span>
      <span className="absolute bottom-2 right-[7%] rounded-[2px] border border-zinc-700 px-1.5 py-1 text-[4px] text-zinc-500">Observability</span>
    </div>
  );
}

export default function ProjectModalMockup() {
  return (
    <RevealOnce delay={0.06}>
      <article aria-label="Miniature Stratos project modal preview" className="byldit-shadow-card mx-auto h-[410px] w-full max-w-[520px] overflow-hidden rounded-xl border border-white/[0.12] bg-gradient-to-b from-[#18181b] to-[#0d0d0f] transition-[transform,box-shadow] duration-200 ease-out lg:hover:-translate-y-[3px]">
        <header className="relative h-[68px] border-b border-white/[0.09] bg-white/[0.015] px-4 py-3">
          <div className="flex items-center gap-1.5 text-[6px] text-zinc-500 sm:text-[7px]">
            <span>Project 1 of 3</span>
            <span className="grid h-4 w-4 place-items-center rounded-full border border-white/10"><ChevronLeft className="h-2 w-2" /></span>
            <span className="grid h-4 w-4 place-items-center rounded-full border border-white/10"><ChevronRight className="h-2 w-2" /></span>
          </div>
          <h4 className="mt-2 text-[15px] font-semibold leading-none tracking-[-0.025em] text-zinc-100">Stratos</h4>
          <span className="mt-1.5 block h-0.5 w-8 rounded-full bg-zinc-500" />
          <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full border border-white/10 text-zinc-500"><X className="h-2.5 w-2.5" /></span>
        </header>

        <div className="space-y-3 px-4 py-3">
          <section>
            <SectionTitle icon={FileText}>About this project</SectionTitle>
            <p className="mt-1.5 line-clamp-3 text-[6px] leading-[10px] text-zinc-500 sm:text-[7px] sm:leading-[11px]">
              Stratos is a cloud deployment platform that turns GitHub repositories into live, production-ready applications. It automates project setup, builds, deployments, and updates whenever new code is pushed.
            </p>
          </section>

          <section>
            <SectionTitle icon={Code2}>Tech Stack Used</SectionTitle>
            <div className="mt-2 flex flex-wrap gap-1">
              {techStack.map((tech) => (
                <span key={tech} className="inline-flex items-center gap-1 rounded border border-white/[0.09] bg-white/[0.035] px-1.5 py-1 text-[5px] text-zinc-400 sm:text-[6px]">
                  <SkillIcon skill={tech} iconMap={mockupSkillIcons} className="h-2.5 w-2.5 shrink-0" />
                  {tech}
                </span>
              ))}
            </div>
          </section>

          <section className="pt-1">
            <SectionTitle icon={Play}>Project Demo</SectionTitle>
            <DemoPreview />
          </section>

          <section>
            <SectionTitle icon={Images}>Project Images</SectionTitle>
            <ArchitecturePreview />
          </section>
        </div>
      </article>
    </RevealOnce>
  );
}
