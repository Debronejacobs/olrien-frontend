"use client";

import { useEffect, useRef } from "react";
import { ArrowDown, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimText } from "@/components/landing/animated-text";
import { Magnetic } from "@/components/landing/magnetic";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { scrollToId } from "@/lib/scroll";
import { useToast } from "@/hooks/use-toast";

const STATS: { value: string; label: string; sub: string }[] = [
  {
    value: "1",
    label: "door in",
    sub: "one endpoint for every person and every AI tool",
  },
  {
    value: "1",
    label: "log out",
    sub: "one append-only audit trail across all access",
  },
  {
    value: "CRUD",
    label: "fully guarded",
    sub: "typed actions · dry runs · approvals · rollback",
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
      // Load-in cascade for everything that is not split by AnimText
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        ".hero-badge",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7 },
        0.15
      )
        .fromTo(
          ".hero-sub",
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.85 },
          0.85
        )
        .fromTo(
          ".hero-cta",
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.75, stagger: 0.08 },
          1.0
        )
        .fromTo(
          ".hero-stat",
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.09 },
          1.15
        )
        .fromTo(
          ".hero-scroll",
          { opacity: 0 },
          { opacity: 1, duration: 0.6 },
          1.5
        );

      // Ledger rule draws in under the stat strip
      gsap.fromTo(
        ".hero-rule",
        { scaleX: 0 },
        { scaleX: 1, duration: 1.2, ease: "power4.inOut", delay: 1.1 }
      );

      // Parallax exit: content drifts up and dims, grid moves slower
      gsap.to(".hero-inner", {
        yPercent: -8,
        opacity: 0.25,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom 25%",
          scrub: true,
        },
      });
      gsap.to(".hero-grid", {
        yPercent: 14,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const repoToast = () =>
    toast({
      title: "The open source core ships with the first preview.",
      description:
        "Join the early access list and the repo link lands in your inbox first.",
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
        className="hero-grid grid-bg mask-fade-radial absolute inset-0 -z-10"
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-[-220px] -z-10 h-[460px] w-[820px] -translate-x-1/2 rounded-full bg-moss-tint/70 blur-3xl"
      />

      <div className="hero-inner mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="hero-badge mx-auto inline-flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-1.5 font-mono text-[11.5px] tracking-wide text-ink-soft shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-moss opacity-50 [animation-duration:2.2s]" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-moss" />
            </span>
            v0 preview · early access open
          </p>

          <AnimText
            as="h1"
            type="chars"
            mount
            delay={0.25}
            className="mt-7 font-display text-[2.35rem] font-medium leading-[1.06] tracking-tight text-ink text-balance sm:text-[3.1rem] lg:text-[4rem]"
          >
            One <em className="not-italic text-moss">governed</em> model of
            the company, for every person and every AI tool.
          </AnimText>

          <p className="hero-sub mx-auto mt-7 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
            Aletheia holds one live model of your business: the objects, how
            they relate, and what may be done to them. Every person and every
            AI tool works through a single audited endpoint. Reads cite their
            sources. Writes pass the guardrails. Licensed once, owned
            outright.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Magnetic>
              <Button
                size="lg"
                onClick={() => scrollToId("#early-access")}
                className="hero-cta h-12 px-7 text-[15px] font-medium"
              >
                Join the early access list
              </Button>
            </Magnetic>
            <Magnetic>
              <Button
                size="lg"
                variant="outline"
                onClick={repoToast}
                className="hero-cta h-12 gap-2 border-line-strong bg-card px-6 text-[15px] font-medium text-ink hover:bg-muted"
              >
                <Github className="h-4.5 w-4.5" />
                Read the open source core
              </Button>
            </Magnetic>
          </div>

          <p className="hero-cta mt-5 font-mono text-[11.5px] tracking-wide text-muted-foreground">
            open core · MCP native · guarded CRUD · self hosted · no per-seat tax
          </p>
        </div>

        {/* Stat ledger */}
        <div className="mx-auto mt-16 max-w-5xl">
          <span aria-hidden className="hero-rule block h-px w-full origin-left bg-line-strong" />
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="hero-stat pt-5 text-left">
                <p className="font-mono text-[1.9rem] font-medium leading-none tracking-tight text-ink">
                  {s.value}
                </p>
                <p className="mt-2.5 text-[12.5px] font-semibold uppercase tracking-[0.16em] text-moss">
                  {s.label}
                </p>
                <p className="mt-1.5 text-[12.5px] leading-snug text-muted-foreground">
                  {s.sub}
                </p>
              </div>
            ))}
          </div>
          <span aria-hidden className="hero-rule mt-5 block h-px w-full origin-left bg-line" />
        </div>

        <div className="hero-scroll mt-14 flex justify-center">
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
