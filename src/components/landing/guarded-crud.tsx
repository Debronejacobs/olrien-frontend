"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  FileCheck2,
  FlaskConical,
  ScrollText,
  ShieldCheck,
  Stamp,
} from "lucide-react";
import { SectionHeading } from "@/components/landing/section-heading";
import { Reveal } from "@/components/landing/reveal";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const GATES = [
  { label: "Allowed", sub: "this is a known, approved kind of change", icon: FileCheck2 },
  { label: "Permitted", sub: "this person is allowed to make it", icon: ShieldCheck },
  { label: "Previewed", sub: "here is exactly what would change", icon: FlaskConical },
  { label: "Signed off", sub: "a person said yes: J. Moreau, finance", icon: Stamp },
  { label: "Recorded", sub: "written down, and can be undone", icon: ScrollText },
];

/** Even spread across the rail, as fractions of its width. */
const GATE_LEFTS = [0.2, 0.37, 0.54, 0.71, 0.88];

export function GuardedCrud() {
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || prefersReducedMotion()) return;

    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const ctx = gsap.context(() => {
        const rail = railRef.current;
        const card = cardRef.current;
        if (!rail || !card) return;

        const railW = rail.offsetWidth;
        const cardW = card.offsetWidth;
        const endX = GATE_LEFTS[4] * railW - cardW / 2;

        gsap.set(".gate-check", { scale: 0, transformOrigin: "50% 50%" });
        gsap.set(".gate-body", { opacity: 0.38 });
        gsap.set(".op-stamp", { opacity: 0, y: 4 });
        gsap.set(".crud-final", { opacity: 0, scale: 1.6, rotate: -6 });
        gsap.set(".crud-audit", { opacity: 0, y: 14 });

        const counter = { n: 0 };
        const counterEl = el.querySelector<HTMLElement>(".crud-counter");

        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: {
            trigger: ".crud-scene",
            start: "top 120px",
            end: "+=1700",
            pin: true,
            scrub: 0.55,
            anticipatePin: 1,
          },
        });

        // The operation card rides the rail through every gate
        tl.to(card, { x: endX, duration: 1, ease: "none" }, 0)
          // the rail fills green behind it
          .fromTo(
            ".rail-fill",
            { scaleX: 0 },
            { scaleX: 1, duration: 1, ease: "none" },
            0
          );

        GATE_LEFTS.forEach((left, i) => {
          // when the card center reaches this gate
          const at = (left * railW - cardW / 2) / endX;
          tl.to(`.gate-${i} .gate-body`, { opacity: 1, duration: 0.08 }, at)
            .to(`.gate-${i} .gate-check`, { scale: 1, duration: 0.09 }, at + 0.01)
            .to(`.op-stamp-${i}`, { opacity: 1, y: 0, duration: 0.09 }, at + 0.02)
            .to(
              counter,
              {
                n: i + 1,
                duration: 0.09,
                onUpdate: () => {
                  if (counterEl) {
                    counterEl.textContent = String(Math.round(counter.n));
                  }
                },
              },
              at + 0.02
            );
        });

        // Executed: the stamp and the audit entry land together
        tl.to(".crud-final", { opacity: 1, scale: 1, rotate: -6, duration: 0.12 }, 1.06)
          .to(".crud-audit", { opacity: 1, y: 0, duration: 0.12 }, 1.12);
      }, el);
      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="writes"
      aria-label="Guarded writes"
      className="relative scroll-mt-20 overflow-hidden border-t border-line py-28 lg:py-32"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute left-[3%] top-10 select-none font-mono text-[9rem] font-medium leading-none text-ink/[0.045] lg:text-[13rem]"
      >
        05
      </span>

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="05 · Safe changes"
          title="Changes are allowed. Blind changes are not."
          lead={
            <>
              Aletheia can read and change records in the systems it connects
              to. What it never does is act on a guess. Every change has to be a
              known, named action. It has to pass the access rules, show exactly
              what it would do before doing it, get a person's sign off when it
              matters, and be written into the record. Safety here is built in,
              not asked for politely.
            </>
          }
        />

        {/* Desktop pinned gauntlet */}
        <div className="crud-scene relative mt-14 hidden h-[440px] lg:block" aria-label="A change passing five safety checks">
          {/* counter */}
          <p className="absolute right-0 top-0 font-mono text-[11px] tracking-wide text-muted-foreground">
            checks passed <span className="crud-counter font-semibold text-moss">0</span>/5
          </p>

          {/* the operation card */}
          <div
            ref={cardRef}
            className="absolute left-0 top-[188px] z-10 w-[330px] -translate-y-1/2 rounded-xl border border-night-line bg-night p-4 shadow-[0_28px_70px_-24px_rgba(12,14,12,0.75)]"
          >
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50">
                change · update
              </p>
              <span className="rounded-full border border-moss-bright/30 px-2 py-0.5 font-mono text-[9.5px] text-moss-bright">
                agent-7
              </span>
            </div>
            <pre className="mt-3 font-mono text-[11.5px] leading-[1.8] text-ink/90">
{`Update<Invoice>
target  Invoice#8841
patch   status: "dunning_paused"`}
            </pre>
            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-night-line pt-3">
              {GATES.map((g, i) => (
                <span
                  key={g.label}
                  className={cn(
                    "op-stamp flex items-center gap-1 rounded-full border border-moss-bright/25 bg-moss-bright/10 px-2 py-0.5 font-mono text-[9.5px] text-moss-bright",
                    `op-stamp-${i}`
                  )}
                >
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  {g.label.toLowerCase()}
                </span>
              ))}
            </div>
          </div>

          {/* the rail */}
          <div ref={railRef} className="absolute inset-x-0 top-[188px] h-px bg-line-strong">
            <span aria-hidden className="rail-fill block h-px w-full origin-left scale-x-0 bg-moss" />
          </div>

          {/* gates */}
          {GATES.map((g, i) => (
            <div
              key={g.label}
              className={cn("absolute top-[188px] z-0", `gate-${i}`)}
              style={{ left: `${GATE_LEFTS[i] * 100}%`, transform: "translate(-50%, -50%)" }}
            >
              <div className="gate-body w-[150px] text-center transition-none">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-card text-muted-foreground shadow-xs">
                  <g.icon className="h-5 w-5" />
                </span>
                <p className="mt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink">
                  {String(i + 1).padStart(2, "0")} · {g.label}
                </p>
                <p className="mt-1 font-mono text-[9.5px] leading-snug text-muted-foreground">
                  {g.sub}
                </p>
              </div>
              <span className="gate-check mx-auto mt-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-moss">
                <Check className="h-3 w-3 text-ink" strokeWidth={3} />
              </span>
            </div>
          ))}

          {/* final stamp + audit entry */}
          <div className="crud-final pointer-events-none absolute right-[2%] top-[318px] z-20">
            <p className="rounded-lg border-[3px] border-moss bg-moss px-5 py-2.5 font-mono text-[13px] font-semibold uppercase tracking-[0.2em] text-night shadow-xl">
              done · recorded
            </p>
          </div>
          <p className="crud-audit absolute inset-x-0 bottom-[52px] text-center font-mono text-[11px] text-muted-foreground">
            [09:41:22] UPDATE Invoice#8841 · agent-7 · approved by J. Moreau · can be undone
          </p>
        </div>

        {/* Mobile static gauntlet */}
        <div className="mt-12 lg:hidden">
          <Reveal className="rounded-xl border border-night-line bg-night p-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50">
                change · update
              </p>
              <span className="rounded-full border border-moss-bright/30 px-2 py-0.5 font-mono text-[9.5px] text-moss-bright">
                agent-7
              </span>
            </div>
            <pre className="mt-3 font-mono text-[11.5px] leading-[1.8] text-ink/90">
{`Update<Invoice>
target  Invoice#8841
patch   status: "dunning_paused"`}
            </pre>
            <p className="mt-3 flex items-center gap-2 border-t border-night-line pt-3 font-mono text-[10px] text-moss-bright">
              <Check className="h-3 w-3" strokeWidth={3} />
              done · recorded
            </p>
          </Reveal>
          <ol className="mt-4 space-y-2.5">
            {GATES.map((g, i) => (
              <Reveal
                key={g.label}
                className="flex items-start gap-3 rounded-lg border border-line bg-card p-3.5"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-paper text-moss">
                  <g.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ink">
                    {String(i + 1).padStart(2, "0")} · {g.label}
                  </p>
                  <p className="mt-0.5 font-mono text-[10.5px] text-muted-foreground">
                    {g.sub}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>

        <Reveal className="mx-auto mt-16 max-w-2xl text-center">
          <p className="font-serif text-xl italic leading-snug text-ink-soft sm:text-2xl">
            &ldquo;Allowing changes is not the same as leaving a hole in the
            wall. It is a second door, with a guard, a record book, and an
            undo.&rdquo;
          </p>
        </Reveal>
      </div>
    </section>
  );
}
