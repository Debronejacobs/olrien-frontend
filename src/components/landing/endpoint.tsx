"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ScrollText, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/landing/section-heading";
import { Reveal } from "@/components/landing/reveal";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type LogLine = {
  t: string;
  action: string;
  object: string;
  actor: string;
  verdict: "allowed" | "denied";
  note: string;
};

const LOG: LogLine[] = [
  { t: "09:14:02", action: "READ", object: "Customer#1042", actor: "agent-7", verdict: "allowed", note: "3 fields · lineage: crm/billing/db" },
  { t: "09:14:19", action: "LIST", object: "Shipments?status=pending", actor: "analyst", verdict: "allowed", note: "12 rows" },
  { t: "09:15:40", action: "UPDATE", object: "Invoice#8841", actor: "agent-7", verdict: "allowed", note: "dry run ok · approved by j.moreau" },
  { t: "09:16:05", action: "READ", object: "Account#77123", actor: "agent-2", verdict: "denied", note: "policy: pii.masked" },
  { t: "09:17:22", action: "CREATE", object: "Order#90211", actor: "assistant", verdict: "allowed", note: "typed action · idempotency key set" },
  { t: "09:18:47", action: "DELETE", object: "Draft#221", actor: "steward", verdict: "allowed", note: "duplicate merged into Customer#1042" },
  { t: "09:19:03", action: "WRITE", object: "Payroll.run", actor: "agent-2", verdict: "denied", note: "policy: writes.payroll.blocked" },
  { t: "09:20:11", action: "EXPORT", object: "audit.segment", actor: "auditor", verdict: "allowed", note: "signed export · 09:14 to 09:20" },
];


function LogRow({ l, idx, hidden }: { l: LogLine; idx: number; hidden?: boolean }) {
  return (
    <p
      data-idx={idx}
      className={cn(
        "al-line flex items-baseline gap-3 whitespace-nowrap rounded px-1 font-mono text-[11px] leading-[1.95]",
        hidden && "opacity-0"
      )}
    >
      <span className="text-ink/40">[{l.t}]</span>
      <span
        className={cn(
          "w-14 font-medium",
          l.action === "READ" || l.action === "LIST"
            ? "text-ink/70"
            : "text-moss-bright"
        )}
      >
        {l.action}
      </span>
      <span className="w-52 truncate text-ink/90">{l.object}</span>
      <span className="hidden w-20 text-ink/50 sm:inline">{l.actor}</span>
      <span
        className={cn(
          "w-14 font-medium",
          l.verdict === "allowed" ? "text-moss-bright" : "text-[#e5704a]"
        )}
      >
        {l.verdict}
      </span>
      <span className="hidden truncate text-ink/40 md:inline">{l.note}</span>
    </p>
  );
}

export function Endpoint() {
  const scrubRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);


  /* Sticky scrubbed audit console (desktop): scroll writes the log */
  useEffect(() => {
    const el = scrubRef.current;
    if (!el || prefersReducedMotion()) return;

    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const ctx = gsap.context(() => {
        const lines = gsap.utils.toArray<HTMLElement>(".al-line");
        const counter = { n: 0 };

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            start: "top 20%",
            end: "bottom bottom",
            scrub: 0.5,
          },
        });

        tl.fromTo(
          ".al-progress",
          { scaleX: 0 },
          { scaleX: 1, duration: lines.length, ease: "none" },
          0
        );

        lines.forEach((line, i) => {
          const at = i + 0.5;
          tl.to(line, { opacity: 1, y: 0, duration: 0.32, ease: "power2.out" }, at);
          tl.to(
            counter,
            {
              n: i + 1,
              duration: 0.32,
              onUpdate: () => {
                if (counterRef.current) {
                  counterRef.current.textContent = String(Math.round(counter.n));
                }
              },
            },
            at
          );
          if (LOG[i]?.verdict === "denied") {
            tl.fromTo(
              line,
              { backgroundColor: "rgba(229,112,74,0.16)" },
              { backgroundColor: "rgba(229,112,74,0)", duration: 1.4 },
              at + 0.05
            );
          }
        });
      }, el);
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, []);

  const consoleCard = (sticky: boolean) => (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-night-line bg-night shadow-[0_30px_80px_-30px_rgba(12,14,12,0.7)]",
        sticky && "lg:my-[16vh]"
      )}
    >
      <div className="flex items-center justify-between border-b border-night-line px-4 py-2.5">
        <p className="flex items-center gap-2 font-mono text-[11px] text-ink/60">
          <ScrollText className="h-3.5 w-3.5 text-moss-bright" />
          Changes tracked are immutable
        </p>
      </div>
      <span aria-hidden className="al-progress block h-px w-full origin-left scale-x-0 bg-moss-bright/70" />
      <div className="console-scroll h-[210px] overflow-hidden px-4 py-3" aria-live="polite">
        {LOG.map((l, i) => (
          <LogRow key={l.t} l={l} idx={i} hidden={sticky} />
        ))}
      </div>
    </div>
  );

  return (
    <section
      id="endpoint"
      aria-label="The product: endpoint"
      className="scroll-mt-20 py-28 lg:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          align="center"
          eyebrow="03 · One way in"
          title="One front door. One record of everything."
          lead={
            <>
              Every AI assistant, agent and reporting tool goes through the
              same front door. Each request is checked: who is asking, are they
              allowed, what will change. The answer says where it came from, and
              the whole thing is written down in one record you can never
              quietly edit. Nothing touches your systems except through that
              door.
            </>
          }
        />

        {/* Flow diagram */}
        <div className="mx-auto mt-14 max-w-5xl">
          <div className="grid-bg rounded-xl border border-line bg-background p-4 shadow-xs sm:p-6">
            <Image
              src="/ontology.png"
              alt="Reporting tools and AI assistants all connect through one front door; the front door reads your database, data warehouse, customer system and documents, and writes every request into one record."
              width={1139}
              height={530}
              className="h-auto w-full"
            />
          </div>
        </div>

        {/* Audit console: sticky + scrubbed on desktop, static on mobile */}
        {/* Desktop */}
        <div
          ref={scrubRef}
          className="relative mx-auto mt-16 hidden h-[260vh] max-w-5xl lg:block"
        >
          <div className="lg:sticky lg:top-[16vh]">
            {consoleCard(true)}
          </div>
        </div>
        {/* Mobile */}
        <div className="mx-auto mt-10 max-w-5xl lg:hidden">
          {consoleCard(false)}
        </div>
      </div>
    </section>
  );
}
