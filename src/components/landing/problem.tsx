"use client";

import { useEffect, useRef } from "react";
import { X, Merge } from "lucide-react";
import { SectionHeading } from "@/components/landing/section-heading";
import { Reveal } from "@/components/landing/reveal";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const SOURCES = [
  {
    system: "CRM",
    kind: "SaaS",
    id: "cust_8841",
    name: "N. Okafor",
    meta: "owner: acme-east · updated 3d ago",
    tone: "text-amber-ink",
  },
  {
    system: "Billing",
    kind: "SaaS",
    id: "CUST-2210",
    name: "Ngozi Okafor",
    meta: "plan: growth · updated 12d ago",
    tone: "text-amber-ink",
  },
  {
    system: "Database",
    kind: "PostgreSQL",
    id: "acct 77123",
    name: "N. Okafour",
    meta: "status: active · updated 41d ago",
    tone: "text-amber-ink",
  },
];

const GAPS = [
  "no shared semantics",
  "no permission boundary",
  "no lineage",
  "no unified audit",
];

export function Problem() {
  const sectionRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: sceneRef.current, start: "top 72%" },
        defaults: { ease: "power3.out" },
      });
      tl.to(".src-card-0", { x: "9%", scale: 0.95, duration: 0.8 }, 0.15)
        .to(".src-card-2", { x: "-9%", scale: 0.95, duration: 0.8 }, 0.15)
        .to(
          [".src-card-0", ".src-card-1", ".src-card-2"],
          { opacity: 0.45, filter: "blur(1px)", duration: 0.7 },
          0.5
        )
        .fromTo(
          ".merged-card",
          { opacity: 0, y: 56, scale: 0.94 },
          { opacity: 1, y: 0, scale: 1, duration: 0.9 },
          0.65
        )
        .fromTo(
          ".gap-chip",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.07 },
          1.1
        );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="problem"
      aria-label="The problem"
      className="scroll-mt-20 py-24 lg:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="01 — The problem"
          title={
            <>
              Forty private models
              <br className="hidden sm:block" /> of the truth.
            </>
          }
          lead={
            <>
              Each department bought its own tool, and each tool keeps its own
              model of the same customers, orders and shipments — different
              identifiers, different fields, different freshness. Nobody
              decided it should be this way; the estate simply grew one
              purchase at a time. Reporting becomes reconciliation: numbers
              disagree, and there is no referee.
            </>
          }
        />

        {/* Desktop merge scene */}
        <div
          ref={sceneRef}
          className="relative mt-16 hidden h-[430px] md:block"
          aria-hidden
        >
          <div className="grid grid-cols-3 gap-5">
            {SOURCES.map((s, i) => (
              <div
                key={s.system}
                className={`src-card-${i} rounded-lg border border-line bg-card p-5 shadow-xs`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
                    {s.system}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {s.kind}
                  </p>
                </div>
                <p className="mt-3 font-mono text-[13px] text-amber-ink">
                  id: {s.id}
                </p>
                <p className="mt-2 font-display text-lg text-ink">
                  &ldquo;{s.name}&rdquo;
                </p>
                <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                  {s.meta}
                </p>
              </div>
            ))}
          </div>

          {/* Merged object */}
          <div className="merged-card absolute inset-x-0 bottom-0 mx-auto w-[440px] max-w-full">
            <div className="rounded-xl border-2 border-moss/70 bg-card p-5 shadow-[0_18px_50px_-18px_rgba(20,83,45,0.35)]">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-moss">
                  object · customer
                </p>
                <span className="flex items-center gap-1.5 rounded-full bg-moss-tint px-2.5 py-1 font-mono text-[10px] font-medium text-moss-deep">
                  <Merge className="h-3 w-3" /> merged
                </span>
              </div>
              <p className="mt-3 font-display text-xl font-medium text-ink">
                Customer <span className="text-muted-foreground">— one object</span>
              </p>
              <ul className="mt-4 space-y-2">
                {SOURCES.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between rounded-md bg-paper px-3 py-2 font-mono text-[11.5px]"
                  >
                    <span className="text-ink-soft">{s.system.toLowerCase()}</span>
                    <span className="text-muted-foreground">{s.id}</span>
                    <span className="font-medium text-moss">cited ✓</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Mobile stack */}
        <div className="mt-12 space-y-4 md:hidden">
          {SOURCES.map((s) => (
            <Reveal key={s.id} className="rounded-lg border border-line bg-card p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                {s.system} · {s.kind}
              </p>
              <p className="mt-1.5 font-mono text-[12.5px] text-amber-ink">
                id: {s.id} — &ldquo;{s.name}&rdquo;
              </p>
            </Reveal>
          ))}
          <Reveal className="rounded-xl border-2 border-moss/70 bg-card p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-moss">
              object · customer
            </p>
            <p className="mt-1.5 font-display text-lg text-ink">
              One object, three cited sources.
            </p>
          </Reveal>
        </div>

        {/* What's missing */}
        <Reveal className="mt-12 flex flex-col items-start gap-4 rounded-lg border border-line bg-paper-deep/70 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-sm leading-relaxed text-ink-soft">
            Connect an agent directly to the database and it guesses at all
            four. Confident output, no one able to verify.
          </p>
          <div className="flex flex-wrap gap-2">
            {GAPS.map((g) => (
              <span
                key={g}
                className="gap-chip flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 font-mono text-[11px] text-ink-soft"
              >
                <X className="h-3 w-3 text-destructive" />
                {g}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-14 max-w-3xl">
          <blockquote className="border-l-2 border-moss pl-6">
            <p className="font-serif text-2xl italic leading-snug text-ink sm:text-[1.75rem]">
              &ldquo;Dashboards describe rather than decide. A chart is a
              postcard from a place the company no longer is.&rdquo;
            </p>
          </blockquote>
        </Reveal>
      </div>
    </section>
  );
}
