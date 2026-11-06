"use client";

import { useEffect, useRef } from "react";
import {
  GitBranch,
  KeyRound,
  Scale,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import { SectionHeading } from "@/components/landing/section-heading";
import { Reveal, RevealGroup } from "@/components/landing/reveal";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const CHOICES = [
  {
    icon: ShieldCheck,
    title: "Guarded CRUD",
    body: "Full create, read, update and delete against connected systems, always as typed actions with policy checks, dry runs and approvals.",
    check: "check: attempt an untyped write; the endpoint refuses it",
  },
  {
    icon: KeyRound,
    title: "Your keys, your data",
    body: "Only model calls leave, on the provider key you supply. No Aletheia cloud receives your data.",
    check: "check: watch the egress; model API calls only",
  },
  {
    icon: GitBranch,
    title: "Ontology in Git",
    body: "The model is reviewed as diffs and rolled back like code, where code review already lives.",
    check: "check: git log is the model's history",
  },
  {
    icon: ScrollText,
    title: "One audit log",
    body: "Reads and writes from every tool append to one append-only log your auditors can export.",
    check: "check: tail the log while your team works",
  },
  {
    icon: Scale,
    title: "Pay once, own it",
    body: "A perpetual license, self hosted. No hostage dataset, no per seat tax on every new reader.",
    check: "check: your bill has no second economy inside it",
  },
];

export function DesignChoices() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || prefersReducedMotion()) return;

    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const ctx = gsap.context(() => {
        const track = el.querySelector<HTMLElement>(".choices-track");
        if (!track) return;

        const distance = () =>
          Math.max(0, track.scrollWidth - window.innerWidth + 160);

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: ".choices-pin",
            start: "top 88px",
            end: () => `+=${distance() + 400}`,
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.to(track, { x: () => -distance(), duration: 1 }, 0)
          // ghost indices drift slower, giving the strip depth
          .fromTo(
            ".choice-ghost",
            { xPercent: 12 },
            { xPercent: -14, duration: 1 },
            0
          )
          .fromTo(
            ".choices-progress",
            { scaleX: 0 },
            { scaleX: 1, duration: 1 },
            0
          );
      }, el);
      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="choices"
      aria-label="Design choices"
      className="scroll-mt-20 overflow-hidden border-t border-line py-28 lg:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="07 · Principles"
          title="Choices we made on purpose."
          lead="Five decisions carry the trust story. Each is checkable inside your own perimeter, on your own terms, rather than aspirational."
        />
      </div>

      {/* Pinned horizontal strip (desktop) */}
      <div className="choices-pin mt-14 hidden h-screen flex-col justify-center lg:flex">
        <div className="choices-track flex w-max items-stretch gap-6 pl-[max(2rem,calc((100vw-72rem)/2+2rem))] pr-24">
          {CHOICES.map((c, i) => (
            <div
              key={c.title}
              className="relative flex w-[400px] shrink-0 flex-col rounded-xl border border-line bg-card p-7 shadow-xs"
            >
              <span
                aria-hidden
                className="choice-ghost pointer-events-none absolute right-5 top-4 select-none font-mono text-[4.5rem] font-medium leading-none text-ink/[0.05]"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-paper text-moss">
                <c.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-6 font-display text-xl font-medium text-ink">
                {c.title}
              </h3>
              <p className="mt-3 flex-1 text-[14px] leading-relaxed text-ink-soft">
                {c.body}
              </p>
              <p className="mt-6 border-t border-line pt-4 font-mono text-[10.5px] leading-relaxed text-moss">
                {c.check}
              </p>
            </div>
          ))}
        </div>
        <div aria-hidden className="mx-auto mt-12 w-full max-w-6xl px-8">
          <div className="h-px w-full bg-line">
            <div className="choices-progress h-px w-full origin-left bg-moss" />
          </div>
        </div>
      </div>

      {/* Stacked grid (mobile / tablet) */}
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:hidden">
        <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2">
          {CHOICES.map((c) => (
            <div
              key={c.title}
              className="flex flex-col rounded-xl border border-line bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-moss/50 hover:shadow-[0_18px_40px_-24px_rgba(20,83,45,0.4)]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-paper text-moss transition-colors group-hover:border-moss/40 group-hover:bg-moss-tint">
                <c.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-lg font-medium text-ink">
                {c.title}
              </h3>
              <p className="mt-2.5 flex-1 text-[13.5px] leading-relaxed text-ink-soft">
                {c.body}
              </p>
              <p className="mt-5 border-t border-line pt-3.5 font-mono text-[10.5px] leading-relaxed text-moss">
                {c.check}
              </p>
            </div>
          ))}
        </RevealGroup>
      </div>

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="mt-16 max-w-2xl">
          <p className="border-l-2 border-moss pl-6 font-serif text-xl italic leading-snug text-ink-soft sm:text-2xl">
            &ldquo;Owned by the customer, deployed by its own team, auditable
            end to end.&rdquo;
          </p>
        </Reveal>
      </div>
    </section>
  );
}
