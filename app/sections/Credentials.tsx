"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Certifications from "./Certifications";
import Education from "../components/Education";
import Skills from "../components/Skills";
import Connect from "../components/Connect";

interface Card {
  id: string;
  title: string;
  pdfUrl: string;
  description: string;
}

interface CredentialsProps {
  onOpenCertificate?: (certificate: Card, certificates: Card[]) => void;
}

export default function Credentials({ onOpenCertificate }: CredentialsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref as React.RefObject<HTMLElement>, {
    once: true,
    margin: "-100px",
  });

  return (
    <motion.div
      {...{
        ref,
        className: "profile-section-rule grid grid-cols-1 items-stretch gap-5 border-t pt-8 md:grid-cols-2 lg:grid-cols-12",
        initial: { opacity: 0 },
        animate: isInView ? { opacity: 1 } : { opacity: 0 },
        transition: { duration: 0.5 },
      }}
    >
      <aside className="profile-accent-lime md:col-span-1 lg:col-span-4">
        <Skills />
      </aside>

      <section className="profile-accent-plum md:col-span-1 lg:col-span-8">
        <Certifications onOpenCertificate={onOpenCertificate} />
      </section>

      <section className="profile-accent-amber md:col-span-1 lg:col-span-8">
        <Education />
      </section>

      <aside className="profile-accent-rose md:col-span-1 lg:col-span-4">
        <Connect />
      </aside>
    </motion.div>
  );
}
