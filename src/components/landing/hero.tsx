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

const GUARDRAILS = [
  { name: "authorization", detail: "role: support-lead" },
  { name: "typed action", detail: "customer.merge.v2" },
  { name: "policy", detail: "pii fence · 2 approvals" },
  { name: "dry run", detail: "no conflicts" },
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
          ".hero-panel",
          { opacity: 0, y: 36, rotateY: -6 },
          {
            opacity: 1,
            y: 0,
            rotateY: 0,
            duration: 1.1,
            ease: "power4.out",
            transformPerspective: 1200,
          },
          0.55
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

      // Endpoint panel: a governed write, on loop
      const LOOP = gsap.timeline({
        repeat: -1,
        repeatDelay: 1.9,
        delay: 1.7,
        defaults: { ease: "power2.out" },
      });

      // Reset from the previous cycle
      LOOP.set(".ep-req", { autoAlpha: 0, y: 10 })
        .set(".ep-pass", { autoAlpha: 0 })
        .set(".ep-check", { autoAlpha: 0 })
        .set(".ep-wait", { autoAlpha: 1 })
        .set(".ep-row", { borderLeftColor: "rgba(230,227,216,0.14)" })
        .set(".ep-res", { autoAlpha: 0, x: -10 })
        .set(".ep-audit-new", { yPercent: 115, autoAlpha: 0 })
        .set(".ep-glow", { opacity: 0 })

      // Request arrives
        .to(".ep-req", { autoAlpha: 1, y: 0, duration: 0.5 }, 0.25)

      // Guardrails evaluate, one after another
        .to(".ep-row-0 .ep-wait", { autoAlpha: 0, duration: 0.01 }, 0.95)
        .to(".ep-row-0 .ep-check", { autoAlpha: 1, duration: 0.01 }, 0.95)
        .to(".ep-row-0", { borderLeftColor: "rgba(180,83,9,0.85)", duration: 0.15 }, 0.95)
        .to(".ep-row-0 .ep-check", { autoAlpha: 0, duration: 0.01 }, 1.32)
        .to(".ep-row-0 .ep-pass", { autoAlpha: 1, duration: 0.01 }, 1.32)
        .to(".ep-row-0", { borderLeftColor: "rgba(52,211,153,0.75)", duration: 0.25 }, 1.32)

        .to(".ep-row-1 .ep-wait", { autoAlpha: 0, duration: 0.01 }, 1.6)
        .to(".ep-row-1 .ep-check", { autoAlpha: 1, duration: 0.01 }, 1.6)
        .to(".ep-row-1", { borderLeftColor: "rgba(180,83,9,0.85)", duration: 0.15 }, 1.6)
        .to(".ep-row-1 .ep-check", { autoAlpha: 0, duration: 0.01 }, 1.97)
        .to(".ep-row-1 .ep-pass", { autoAlpha: 1, duration: 0.01 }, 1.97)
        .to(".ep-row-1", { borderLeftColor: "rgba(52,211,153,0.75)", duration: 0.25 }, 1.97)

        .to(".ep-row-2 .ep-wait", { autoAlpha: 0, duration: 0.01 }, 2.25)
        .to(".ep-row-2 .ep-check", { autoAlpha: 1, duration: 0.01 }, 2.25)
        .to(".ep-row-2", { borderLeftColor: "rgba(180,83,9,0.85)", duration: 0.15 }, 2.25)
        .to(".ep-row-2 .ep-check", { autoAlpha: 0, duration: 0.01 }, 2.62)
        .to(".ep-row-2 .ep-pass", { autoAlpha: 1, duration: 0.01 }, 2.62)
        .to(".ep-row-2", { borderLeftColor: "rgba(52,211,153,0.75)", duration: 0.25 }, 2.62)

        .to(".ep-row-3 .ep-wait", { autoAlpha: 0, duration: 0.01 }, 2.9)
        .to(".ep-row-3 .ep-check", { autoAlpha: 1, duration: 0.01 }, 2.9)
        .to(".ep-row-3", { borderLeftColor: "rgba(180,83,9,0.85)", duration: 0.15 }, 2.9)
        .to(".ep-row-3 .ep-check", { autoAlpha: 0, duration: 0.01 }, 3.27)
        .to(".ep-row-3 .ep-pass", { autoAlpha: 1, duration: 0.01 }, 3.27)
        .to(".ep-row-3", { borderLeftColor: "rgba(52,211,153,0.75)", duration: 0.25 }, 3.27)

      // Response with citations
        .to(".ep-res", { autoAlpha: 1, x: 0, duration: 0.5 }, 3.55)

      // The write lands in the immutable audit log
        .to(".ep-audit-new", { yPercent: 0, autoAlpha: 1, duration: 0.55 }, 3.8)
        .to(".ep-glow", { opacity: 1, duration: 0.4, yoyo: true, repeat: 1 }, 3.9);

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
        className="absolute left-[12%] top-[-220px] -z-10 h-[460px] w-[780px] rounded-full bg-moss-tint/70 blur-3xl"
      />

      <div className="hero-inner mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-start lg:gap-12">
          {/* Copy column */}
          <div>
            <p className="hero-badge inline-flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-1.5 font-mono text-[11.5px] tracking-wide text-ink-soft shadow-xs">
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
              className="mt-7 font-display text-[2.5rem] font-medium leading-[1.04] tracking-[-0.03em] text-ink text-balance sm:text-[3.2rem] lg:text-[3.7rem] xl:text-[4.15rem]"
            >
              One <em className="not-italic text-moss">governed</em> model of
              the company, for every person and every AI tool.
            </AnimText>

            <p className="hero-sub mt-7 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
              Aletheia holds one live model of your business: the objects, how
              they relate, and what may be done to them. Every person and every
              AI tool works through a single audited endpoint. Reads cite their
              sources. Writes pass the guardrails. Licensed once, owned
              outright.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
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
                  className="hero-cta h-12 gap-2.5 border-line-strong bg-card px-6 font-mono text-[12px] uppercase tracking-[0.16em] text-ink hover:bg-muted"
                >
                  <Github className="h-4 w-4" />
                  Open source core
                </Button>
              </Magnetic>
            </div>

            <p className="hero-cta mt-6 font-mono text-[11.5px] tracking-wide text-muted-foreground">
              open core · MCP native · guarded CRUD · self hosted · no per-seat
              tax
            </p>
          </div>

          {/* Governed endpoint panel */}
          <div className="relative">
            <div
              aria-hidden
              className="hero-panel absolute -inset-6 -z-10 rounded-3xl bg-moss-tint/50 blur-2xl"
            />
            <div className="hero-panel relative overflow-hidden rounded-xl border border-night-line bg-night font-mono text-[11.5px] leading-relaxed shadow-[0_40px_90px_-30px_rgba(12,14,12,0.55)] lg:rounded-r-none lg:-mr-[max(5.5rem,calc((100vw-72rem)/2))]">
              {/* moss sweep on completed write */}
              <div
                aria-hidden
                className="ep-glow pointer-events-none absolute inset-0 z-10 opacity-0 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(52,211,153,0.09),transparent_70%)]"
              />

              {/* Panel header */}
              <div className="flex items-center justify-between border-b border-night-line px-4 py-3">
                <span className="flex items-center gap-2 text-[11px] tracking-wide text-paper/80">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-moss-bright opacity-60 [animation-duration:2.2s]" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-moss-bright" />
                  </span>
                  aletheia · governed endpoint
                </span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-paper/35">
                  mcp · v0
                </span>
              </div>

              <div className="space-y-4 p-4 sm:p-5">
                {/* Request */}
                <div className="ep-req rounded-md border border-night-line bg-night-soft p-3.5 opacity-0 motion-reduce:opacity-100">
                  <p>
                    <span className="text-moss-bright">POST</span>{" "}
                    <span className="text-paper">/mcp/customer.merge</span>
                  </p>
                  <p className="mt-1.5 text-paper/50">
                    {"{ \"action\": \"customer.merge\","}
                  </p>
                  <p className="text-paper/50">
                    {'  "sources": ["crm#4821", "erp#C-118",'}
                  </p>
                  <p className="text-paper/50">
                    {'   "billing#90214"], "dry_run": true }'}
                  </p>
                </div>

                {/* Guardrails */}
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-paper/35">
                    guardrails · all required
                  </p>
                  <div className="mt-2.5 space-y-2">
                    {GUARDRAILS.map((g, i) => (
                      <div
                        key={g.name}
                        className={`ep-row ep-row-${i} flex items-center justify-between gap-3 border-l-2 border-paper/10 py-1 pl-3 motion-reduce:border-moss-bright/60`}
                      >
                        <p className="text-paper/75">
                          {g.name}{" "}
                          <span className="hidden text-paper/35 sm:inline">
                            · {g.detail}
                          </span>
                        </p>
                        <p className="shrink-0 text-[10.5px]">
                          <span className="ep-wait text-paper/30 motion-reduce:hidden">queued</span>
                          <span className="ep-check text-amber-400 opacity-0 motion-reduce:hidden">checking</span>
                          <span className="ep-pass text-moss-bright opacity-0 motion-reduce:opacity-100">pass</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Response */}
                <p className="ep-res text-moss-bright opacity-0 motion-reduce:opacity-100">
                  ✓ 200 · merged · 3 sources cited
                </p>
              </div>

              {/* Audit strip */}
              <div className="border-t border-night-line bg-night-soft/60 px-4 py-3 sm:px-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-paper/35">
                  audit · append only
                </p>
                <div className="mt-2 space-y-1.5">
                  <p className="flex justify-between gap-3 text-paper/40">
                    <span>req_9f21 · sarah@nb</span>
                    <span>customer.read · ok</span>
                  </p>
                  <p className="flex justify-between gap-3 text-paper/40">
                    <span>req_9f26 · agent/support-7</span>
                    <span>customer.read · ok</span>
                  </p>
                  <div className="h-[18px] overflow-hidden">
                    <p className="ep-audit-new flex justify-between gap-3 text-moss-bright/90 opacity-0 motion-reduce:opacity-100">
                      <span>req_9f27 · agent/support-7</span>
                      <span>customer.merge · pass</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stat ledger */}
        <div className="mx-auto mt-16 max-w-5xl lg:mt-20">
          <span
            aria-hidden
            className="hero-rule block h-px w-full origin-left bg-line-strong"
          />
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
          <span
            aria-hidden
            className="hero-rule mt-5 block h-px w-full origin-left bg-line"
          />
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
