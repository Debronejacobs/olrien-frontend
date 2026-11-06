"use client";

import { useEffect, useRef } from "react";
import { ArrowDown, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { scrollToId } from "@/lib/scroll";
import { useToast } from "@/hooks/use-toast";

const STATS: { value: string; label: string; sub: string }[] = [
  {
    value: "1",
    label: "door in",
    sub: "one endpoint for every person and AI tool",
  },
  {
    value: "1",
    label: "log out",
    sub: "one immutable audit trail across all access",
  },
  {
    value: "~5 min",
    label: "drafted ontology",
    sub: "schema scan to reviewable draft — illustrative demo",
  },
  {
    value: "0",
    label: "bytes leave",
    sub: "no business data leaves your environment",
  },
];

export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const el = rootRef.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        ".hero-badge",
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.7 },
        0.1
      )
        .fromTo(
          ".hero-line",
          { opacity: 0, y: 34 },
          { opacity: 1, y: 0, duration: 0.95, stagger: 0.12 },
          0.2
        )
        .fromTo(
          ".hero-sub",
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.85 },
          0.55
        )
        .fromTo(
          ".hero-cta",
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.75, stagger: 0.08 },
          0.7
        )
        .fromTo(
          ".hero-stat",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.09 },
          0.85
        );
    }, el);
    return () => ctx.revert();
  }, []);

  const repoToast = () =>
    toast({
      title: "The open-source core ships with the first preview.",
      description:
        "Join the early-access list and the repo link lands in your inbox first.",
    });

  return (
    <section
      ref={rootRef}
      id="top"
      aria-label="Introduction"
      className="relative overflow-hidden pt-[168px] pb-16 sm:pt-[190px] lg:pb-20"
    >
      {/* Blueprint backdrop */}
      <div
        aria-hidden
        className="grid-bg mask-fade-radial absolute inset-0 -z-10"
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-[-220px] -z-10 h-[460px] w-[820px] -translate-x-1/2 rounded-full bg-moss-tint/70 blur-3xl"
      />

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="hero-badge mx-auto inline-flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-1.5 font-mono text-[11.5px] tracking-wide text-ink-soft shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-moss opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-moss" />
            </span>
            v0 preview — early access open
          </p>

          <h1 className="mt-7 font-display text-[2.35rem] font-medium leading-[1.06] tracking-tight text-ink text-balance sm:text-[3.1rem] lg:text-[4rem]">
            <span className="hero-line block">
              One <em className="not-italic text-moss">governed</em> model
            </span>
            <span className="hero-line block">of the company, for</span>
            <span className="hero-line block">every person and</span>
            <span className="hero-line block">every AI tool.</span>
          </h1>

          <p className="hero-sub mx-auto mt-7 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
            Aletheia connects read-only to the systems you already run, drafts
            one shared ontology of your business — the objects, how they
            relate, what may be done to them — and exposes it through a
            single, audited endpoint. Deployed by your own team in days.
            Licensed once. Owned outright.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={() => scrollToId("#early-access")}
              className="hero-cta h-12 px-7 text-[15px] font-medium"
            >
              Join the early-access list
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={repoToast}
              className="hero-cta h-12 gap-2 border-line-strong bg-card px-6 text-[15px] font-medium text-ink hover:bg-muted"
            >
              <Github className="h-4.5 w-4.5" />
              Read the open-source core
            </Button>
          </div>

          <p className="hero-cta mt-5 font-mono text-[11.5px] tracking-wide text-muted-foreground">
            open core · MCP-native · self-hosted · read-only first · no per-seat tax
          </p>
        </div>

        {/* Stat row */}
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="hero-stat bg-card/90 px-5 py-5 text-left backdrop-blur-sm"
            >
              <p className="font-mono text-2xl font-medium tracking-tight text-ink sm:text-[1.7rem]">
                {s.value}
              </p>
              <p className="mt-1 text-[13px] font-semibold uppercase tracking-[0.14em] text-moss">
                {s.label}
              </p>
              <p className="mt-1.5 text-[12.5px] leading-snug text-muted-foreground">
                {s.sub}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <button
            onClick={() => scrollToId("#problem")}
            aria-label="Scroll to the problem section"
            className="group flex flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-ink"
          >
            <span className="font-mono text-[10.5px] uppercase tracking-[0.24em]">
              the problem
            </span>
            <ArrowDown className="h-4 w-4 animate-bounce" />
          </button>
        </div>
      </div>
    </section>
  );
}
