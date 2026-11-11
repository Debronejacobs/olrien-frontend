"use client";

import { useEffect, useRef } from "react";
import { X, Merge } from "lucide-react";
import { SectionHeading } from "@/components/landing/section-heading";
import { Reveal } from "@/components/landing/reveal";
import { AnimText } from "@/components/landing/animated-text";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const SOURCES = [
  {
    system: "CRM",
    kind: "SaaS",
    id: "cust_8841",
    name: "N. Okafor",
    meta: "owner: acme-east · updated 3d ago",
  },
  {
    system: "Billing",
    kind: "SaaS",
    id: "CUST-2210",
    name: "Ngozi Okafor",
    meta: "plan: growth · updated 12d ago",
  },
  {
    system: "Database",
    kind: "PostgreSQL",
    id: "acct 77123",
    name: "N. Okafour",
    meta: "status: active · updated 41d ago",
  },
];

const GAPS = [
  "no shared meaning",
  "no access rules",
  "no source to check",
  "no single record",
];

export function Problem() {
  const sectionRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || prefersReducedMotion()) return;

    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const ctx = gsap.context(() => {
        gsap.set(".merged-card", { opacity: 0, y: 96, scale: 0.92 });
        gsap.set(".cited-row", { opacity: 0, x: -10 });
        gsap.set(".merged-caption", { opacity: 0 });

        // The scene itself fades up before pinning, so the record card
        // is already in view when the scrub engages.
        gsap.fromTo(
          ".merge-scene",
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: ".merge-scene", start: "top 88%" },
          }
        );

        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: {
            trigger: ".merge-scene",
            start: "top 130px",
            end: "+=1500",
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
          },
        });

        // The one cited record rises into place…
        tl.to(".merged-card", { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "power3.out" }, 0)
          // …and each source is cited inside it
          .to(".cited-row", { opacity: 1, x: 0, duration: 0.35, stagger: 0.14 }, 0.55)
          .to(".merged-caption", { opacity: 1, duration: 0.5 }, 0.95);

        // Ghost numeral drifts slower than the page
        gsap.to(".problem-ghost", {
          yPercent: 30,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }, el);
      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="problem"
      aria-label="The problem"
      className="relative scroll-mt-20 overflow-hidden py-28 lg:py-32"
    >
      <span
        aria-hidden
        className="problem-ghost pointer-events-none absolute right-[4%] top-10 select-none font-mono text-[9rem] font-medium leading-none text-ink/[0.045] lg:text-[13rem]"
      >
        01
      </span>

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="01 · What's wrong today"
          title={
            <>
              Every team has its own
              <br className="hidden sm:block" /> version of the truth.
            </>
          }
          lead={
            <>
              Each department bought its own software, and each one keeps its own
              record of the same customers, orders and deliveries. The names are
              spelled differently, the fields are different, and some copies are
              months out of date. Nobody chose this. It just grew, one purchase
              at a time. So reporting turns into detective work, the numbers
              disagree, and there is nobody to settle the argument.
            </>
          }
        />

        {/* Desktop pinned merge scene */}
        <div ref={sceneRef} className="relative mt-16 hidden lg:block">
          <div className="merge-scene relative flex h-[340px] items-center justify-center" aria-hidden>
            {/* The one cited object */}
            <div className="merged-card absolute inset-x-0 top-1/2 mx-auto w-[460px] max-w-full -translate-y-1/2">
              <div className="rounded-xl border-2 border-moss/70 bg-card p-5 shadow-[0_24px_60px_-20px_rgba(20,83,45,0.4)]">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-moss">
                    one customer
                  </p>
                  <span className="flex items-center gap-1.5 rounded-full bg-moss-tint px-2.5 py-1 font-mono text-[10px] font-medium text-moss-deep">
                    <Merge className="h-3 w-3" /> merged
                  </span>
                </div>
                <p className="mt-3 font-display text-xl font-medium text-ink">
                  One customer, one record
                </p>
                <ul className="mt-4 space-y-2">
                  {SOURCES.map((s) => (
                    <li
                      key={s.id}
                      className="cited-row flex items-center justify-between rounded-md bg-paper px-3 py-2 font-mono text-[11.5px]"
                    >
                      <span className="text-ink-soft">
                        {s.system.toLowerCase()}
                      </span>
                      <span className="text-muted-foreground">{s.id}</span>
                      <span className="font-medium text-moss">cited ✓</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="merged-caption mt-3 text-center font-mono text-[11px] text-muted-foreground">
                three disagreeing records in, one trustworthy record out
              </p>
            </div>
          </div>
        </div>

        {/* Mobile: the same single record, with its sources listed */}
        <div className="mt-12 lg:hidden">
          <Reveal className="rounded-xl border-2 border-moss/70 bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-moss">
                one customer
              </p>
              <span className="flex items-center gap-1.5 rounded-full bg-moss-tint px-2.5 py-1 font-mono text-[10px] font-medium text-moss-deep">
                <Merge className="h-3 w-3" /> merged
              </span>
            </div>
            <p className="mt-1.5 font-display text-lg text-ink">
              One record, three sources to check.
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
          </Reveal>
        </div>

        {/* What is missing */}
        <Reveal className="mt-12 flex flex-col items-start gap-4 rounded-lg border border-line bg-paper-deep/70 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-sm leading-relaxed text-ink-soft">
            Plug an AI assistant straight into the database and it has to guess
            on all four. It sounds certain, and nobody can check it.
          </p>
          <div className="flex flex-wrap gap-2">
            {GAPS.map((g) => (
              <span
                key={g}
                className="flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 font-mono text-[11px] text-ink-soft"
              >
                <X className="h-3 w-3 text-destructive" />
                {g}
              </span>
            ))}
          </div>
        </Reveal>

        <AnimText
          as="blockquote"
          type="words"
          className="mt-16 max-w-3xl border-l-2 border-moss pl-6 font-serif text-2xl italic leading-snug text-ink sm:text-[1.75rem]"
        >
          &ldquo;A dashboard describes the past. A chart is a postcard from a
          place the company has already left.&rdquo;
        </AnimText>
      </div>
    </section>
  );
}
