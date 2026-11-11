"use client";

import { useEffect, useRef, useState } from "react";
import { Check, FileDiff, GitPullRequest } from "lucide-react";
import { SectionHeading } from "@/components/landing/section-heading";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    n: "01",
    title: "Connect",
    body: "Point Aletheia at your systems, giving it read-only access where that is all it needs: your database, your data warehouse, your customer system, a folder of documents. Nothing leaves your network except the requests to your own AI provider.",
  },
  {
    n: "02",
    title: "Review the draft",
    body: "Aletheia reads what is there and proposes how everything fits together: what a customer is, what an order is, how they connect, what people should be allowed to do. You see it as a simple list of suggested changes. Approve, edit or throw away each one.",
  },
  {
    n: "03",
    title: "Run the business through it",
    body: "From then on everyone works through one front door. Answers show where they came from, changes go through the safety checks, and every action is written into one record.",
  },
];

const DIFF_LINES = [
  "Customer {",
  "  matched from   3 systems: sales, billing, database",
  "  shows         the same person, one record",
  "  connected to  orders placed · tickets raised · accounts held",
  "  allows        approve an order · hold a delivery · issue a refund",
  "  every change reviewed and can be undone",
  "}",
];

const CONN_ROWS = [
  "Database · 41 tables",
  "Shared folder · 118 files",
  "Customer system · 9 record types",
  "Billing system · 6 record types",
];

export function Deployment() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || prefersReducedMotion()) return;

    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const ctx = gsap.context(() => {
        gsap.set(".conn-check", { scale: 0, transformOrigin: "50% 50%" });
        gsap.set(".diff-line", { opacity: 0, x: -12 });
        gsap.set(".pr-footer", { opacity: 0 });
        gsap.set(".pr-stamp", { opacity: 0, scale: 1.7, rotate: -8 });
        gsap.set(".approve-btn", { opacity: 1 });

        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: {
            trigger: ".dep-scene",
            start: "top 64px",
            end: "+=2100",
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
            onUpdate: (self) => {
              const p = self.progress;
              setActive(p < 0.34 ? 0 : p < 0.68 ? 1 : 2);
            },
          },
        });

        // Phase 1: connect
        tl.to(".conn-row .conn-dot", { backgroundColor: "#2ea065", stagger: 0.06 }, 0.02)
          .to(".conn-check", { scale: 1, stagger: 0.07, duration: 0.25 }, 0.05);
        // Phase 2: the draft as a diff
        tl.to(".diff-line", { opacity: 1, x: 0, duration: 0.22, stagger: 0.05 }, 0.36)
          .to(".pr-footer", { opacity: 1, duration: 0.3 }, 0.62);
        // Phase 3: approve + govern
        tl.to(".approve-btn", { backgroundColor: "#2ea065", color: "#0a0c09", borderColor: "#2ea065", duration: 0.2 }, 0.72)
          .fromTo(".pr-stamp", { opacity: 0, scale: 1.7, rotate: -8 }, { opacity: 1, scale: 1, rotate: -8, duration: 0.28 }, 0.8);
      }, el);
      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="deployment"
      aria-label="Deployment"
      className="scroll-mt-20 border-t border-line bg-paper-deep/40 py-28 lg:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="04 · Deployment"
          title="Deployed by your own team. Reviewed like code."
          lead="No pilot project, no integration programme. The software does the grunt work; your team approves the result, and each part of the model is accepted, edited or discarded like a pull request."
        />

        <div className="dep-scene mt-14 grid gap-10 lg:min-h-[calc(100vh-88px)] lg:grid-cols-[0.85fr_1.35fr] lg:items-center lg:gap-12">
          {/* Steps */}
          <ol className="min-w-0 space-y-8 lg:space-y-10">
            {STEPS.map((s, i) => (
              <li
                key={s.n}
                className={cn(
                  "dep-step flex gap-4 transition-opacity duration-300",
                  active === i ? "opacity-100" : "opacity-100 lg:opacity-40"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border font-mono text-[12px] font-medium transition-colors duration-300",
                    active === i
                      ? "border-moss bg-moss-tint text-moss-deep"
                      : "border-line bg-card text-muted-foreground"
                  )}
                >
                  {s.n}
                </span>
                <div>
                  <h3 className="font-display text-xl font-medium text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
                    {s.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {/* PR review card */}
          <div className="relative min-w-0">
            <div className="overflow-hidden rounded-xl border border-line-strong bg-card shadow-[0_24px_60px_-30px_rgba(27,26,21,0.35)]">
              {/* header */}
              <div className="flex items-center justify-between border-b border-line bg-paper px-4 py-3 sm:px-5">
                <p className="flex items-center gap-2 font-mono text-[12px] text-ink">
                  <GitPullRequest className="h-4 w-4 text-moss" />
                  aletheia/ontology
                  <span className="rounded-full border border-line bg-card px-2 py-0.5 text-[10.5px] text-muted-foreground">
                    #128
                  </span>
                </p>
                <p className="hidden font-mono text-[10.5px] text-muted-foreground sm:block">
                  agent[bot] → main
                </p>
              </div>

              <div className="px-4 py-4 sm:px-5">
                <p className="text-[13px] text-ink-soft">
                  <span className="font-medium text-ink">Draft: one Customer object</span>{" "}
                  from three cited sources. Review each line; the ontology is
                  yours to accept, edit or discard.
                </p>

                {/* connect rows */}
                <div className="mt-4 space-y-1.5">
                  {CONN_ROWS.map((r) => (
                    <div
                      key={r}
                      className="conn-row flex items-center justify-between rounded-md bg-paper px-3 py-1.5"
                    >
                      <span className="flex items-center gap-2 font-mono text-[11px] text-ink-soft">
                        <span className="conn-dot h-1.5 w-1.5 rounded-full bg-amber-ink/60" />
                        {r}
                      </span>
                      <span className="conn-check flex h-4 w-4 items-center justify-center rounded-full bg-moss-tint">
                        <Check className="h-3 w-3 text-moss" strokeWidth={3} />
                      </span>
                    </div>
                  ))}
                </div>

                {/* diff */}
                <div className="mt-4 overflow-hidden rounded-lg border border-line">
                  <div className="flex items-center justify-between border-b border-line bg-paper px-3 py-2">
                    <p className="flex items-center gap-2 font-mono text-[11px] text-ink">
                      <FileDiff className="h-3.5 w-3.5 text-muted-foreground" />
                      objects/customer.aletheia
                    </p>
                    <p className="font-mono text-[10.5px]">
                      <span className="text-moss">+18</span>{" "}
                      <span className="text-muted-foreground">−0</span>
                    </p>
                  </div>
                  <div className="overflow-x-auto bg-night">
                    <pre className="min-w-[540px] py-2 font-mono text-[11.5px] leading-[1.75]">
                      {DIFF_LINES.map((l, i) => (
                        <code
                          key={i}
                          className="diff-line flex gap-3 px-3 text-moss-bright/95"
                        >
                          <span className="w-4 select-none text-right text-ink/25">
                            {i + 1}
                          </span>
                          <span>+ {l}</span>
                        </code>
                      ))}
                      <span className="diff-line flex gap-3 px-3">
                        <span className="w-4 select-none text-right text-ink/25">8</span>
                        <span className="caret-blink text-moss-bright">▌</span>
                      </span>
                    </pre>
                  </div>
                </div>

                {/* reviewer row */}
                <div className="mt-4 flex items-center justify-between rounded-lg border border-line bg-paper px-3 py-2.5">
                  <p className="font-mono text-[11px] text-ink-soft">
                    you <span className="text-muted-foreground">(owner)</span> · review the suggestion
                  </p>
                  <span className="approve-btn rounded-md border border-line-strong bg-card px-3.5 py-1.5 font-mono text-[11px] font-medium text-ink transition-colors">
                    Approve
                  </span>
                </div>
              </div>

              <p className="pr-footer border-t border-line bg-paper px-4 py-2.5 text-center font-mono text-[10.5px] text-muted-foreground sm:px-5">
                read: 41 tables · 3 online systems · 1,204 documents · first draft ready in under 5 minutes (example)
              </p>
            </div>

            {/* approval stamp */}
            <div
              aria-hidden
              className="pr-stamp pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
            >
              <p className="rounded-lg border-[3px] border-moss bg-moss px-6 py-3 font-mono text-[15px] font-semibold uppercase tracking-[0.2em] text-night shadow-xl">
                approved
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
