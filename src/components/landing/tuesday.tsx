"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, CheckCircle2, TimerReset } from "lucide-react";
import { Eyebrow } from "@/components/landing/section-heading";
import { AnimText } from "@/components/landing/animated-text";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const WITHOUT = [
  ["09:05", "Support tickets exported to a spreadsheet by hand."],
  ["09:40", "Someone asks the banking team for transfer records. Everyone waits in the queue."],
  ["10:30", "An engineer pulls login and device records, then matches them by hand, because every system names people differently."],
  ["11:15", "The first real clue, a recent phone number change, is spotted by luck in the customer system."],
  ["12:30", "Two teams define an \u201cactive customer\u201d differently, so their totals disagree."],
  ["13:45", "Roughly forty accounts are guessed at, while more transfers keep going out."],
  ["14:30", "The freeze is agreed across payments, operations and compliance over email."],
];

const WITH = [
  ["09:08", "All nine callers share a pattern: a phone number changed at the call centre in the last three days, a new device within a day, a new payee from that device, and transfers just under the limit that triggers extra checks. Every detail traces back to its source."],
  ["09:14", "Who else matches: 212 customers. 31 still have transfers going out, worth $1.86M, and 17 go to three shared accounts."],
  ["09:20", "Compliance and payments get the same answer, with the same sources. Nobody has to redo the work, and no two people disagree."],
  ["09:25", "A proposed action, Hold outbound transfers, is previewed: 31 transfers, $1.86M, no salary payments affected. The Head of Payments approves. It runs, and it is written down."],
];

function TimelinePanel({
  variant,
  title,
  rows,
  footer,
  className,
}: {
  variant: "without" | "with";
  title: string;
  rows: string[][];
  footer: string;
  className?: string;
}) {
  const without = variant === "without";
  return (
    <div
      className={cn(
        "sc-panel shrink-0 rounded-xl border bg-night-soft/80 p-5 sm:p-6",
        without ? "border-[#4a2f26]/80" : "border-moss-bright/35",
        className
      )}
    >
      <p
        className={cn(
          "flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em]",
          without ? "text-[#e5704a]" : "text-moss-bright"
        )}
      >
        {without ? (
          <AlertTriangle className="h-3.5 w-3.5" />
        ) : (
          <CheckCircle2 className="h-3.5 w-3.5" />
        )}
        {title}
      </p>
      <ul className="mt-4 space-y-3">
        {rows.map(([t, text]) => (
          <li key={t} className="sc-line flex gap-3">
            <span
              className={cn(
                "shrink-0 pt-px font-mono text-[11.5px]",
                without ? "text-[#e5704a]/80" : "text-moss-bright"
              )}
            >
              {t}
            </span>
            <span className="text-[12.5px] leading-relaxed text-ink/75">
              {text}
            </span>
          </li>
        ))}
      </ul>
      <p
        className={cn(
          "sc-line mt-5 border-t pt-3 font-mono text-[11px]",
          without
            ? "border-[#4a2f26]/60 text-[#e5704a]"
            : "border-moss-bright/25 text-moss-bright"
        )}
      >
        {footer}
      </p>
    </div>
  );
}

export function Tuesday() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || prefersReducedMotion()) return;

    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const ctx = gsap.context(() => {
        const track = el.querySelector<HTMLElement>(".scenario-track");
        if (!track) return;

        const distance = () => track.scrollWidth - window.innerWidth;

        // One scrubbed timeline drives the horizontal travel AND the
        // per-panel line reveals. Deterministic at every scroll position.
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.to(track, { x: () => -distance(), duration: 1 }, 0)
          .from(
            ".panel-without .sc-line",
            { opacity: 0, y: 22, duration: 0.1, stagger: 0.012 },
            0.16
          )
          .from(
            ".panel-with .sc-line",
            { opacity: 0, y: 22, duration: 0.1, stagger: 0.02 },
            0.5
          )
          // time compression bars: 5.5 hours vs 25 minutes
          .fromTo(
            ".bar-without",
            { scaleX: 0 },
            { scaleX: 1, duration: 0.14, ease: "power2.out" },
            0.72
          )
          .fromTo(
            ".bar-with",
            { scaleX: 0 },
            { scaleX: 1, duration: 0.05, ease: "power2.out" },
            0.9
          );

        gsap.fromTo(
          ".sc-progress",
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: () => `+=${distance()}`,
              scrub: 0.4,
            },
          }
        );
      }, el);
      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="scenario"
      aria-label="A Tuesday morning at a bank, an illustrative scenario"
      className="scroll-mt-0 bg-night text-ink"
    >
      <div className="grid-bg-dark mx-auto flex min-h-screen max-w-[110rem] flex-col justify-center py-20 lg:max-w-none lg:py-0">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-14">
          <Eyebrow dark>06 · A scenario · illustrative</Eyebrow>
          <AnimText
            as="h2"
            type="lines"
            className="mt-4 max-w-3xl font-display text-3xl font-medium leading-[1.08] tracking-tight text-ink sm:text-4xl lg:text-[2.75rem]"
          >
            A Tuesday morning at a bank.
          </AnimText>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-ink/65 sm:text-lg">
            Northgate Bank: 1.2 million customers, data in eight places, each
            with its own customer identifier. At 08:47 the call centre takes
            the first of nine calls about transfers nobody made. The Head of
            Fraud Operations has one question. Is this isolated, or the start
            of an account takeover wave? And how much money is still in
            motion?
          </p>
        </div>

        {/* Horizontal track (desktop) / stacked (mobile) */}
        <div className="scenario-track mt-12 flex flex-col gap-6 px-5 sm:px-8 lg:mt-14 lg:w-max lg:flex-row lg:gap-8 lg:px-14">
          {/* intro */}
          <div className="sc-panel flex shrink-0 flex-col justify-center lg:w-[30vw] lg:py-8">
            <AnimText
              as="p"
              type="words"
              className="font-serif text-3xl italic leading-snug text-ink/90 lg:text-4xl"
            >
              &ldquo;Is this a one-off, or the start of a wave?&rdquo;
            </AnimText>
            <p className="sc-line mt-5 font-mono text-[11.5px] text-ink/45">
              08:47 · the first of nine calls · answering it means crossing eight systems
            </p>
          </div>

          <TimelinePanel
            variant="without"
            title="Without Aletheia"
            rows={WITHOUT}
            footer="≈ 5.5 hours to get it under control · evidence scattered across inboxes and spreadsheets"
            className="panel-without lg:w-[42vw] lg:self-center"
          />

          <TimelinePanel
            variant="with"
            title="With Aletheia"
            rows={WITH}
            footer="≈ 25 minutes to get it under control · the record for the auditor is mostly written already"
            className="panel-with lg:w-[46vw] lg:self-center"
          />

          {/* closing */}
          <div className="sc-panel flex shrink-0 flex-col justify-center lg:w-[34vw] lg:pr-14">
            <p className="sc-line flex items-center gap-3 font-mono text-2xl sm:text-3xl">
              <span className="text-[#e5704a]/80 line-through decoration-[#e5704a]/50">
                5.5h
              </span>
              <TimerReset className="h-5 w-5 text-moss-bright" />
              <span className="font-semibold text-moss-bright">25 min</span>
            </p>

            {/* proportional time bars */}
            <div className="sc-line mt-6 space-y-3">
              <div>
                <div className="h-[5px] w-full overflow-hidden rounded-full bg-[#3a2620]">
                  <div className="bar-without h-full w-[72%] origin-left rounded-full bg-[#e5704a]/80" />
                </div>
                <p className="mt-1.5 font-mono text-[10px] text-[#e5704a]/80">
                  without · 5.5 hours of piecing the evidence together
                </p>
              </div>
              <div>
                <div className="h-[5px] w-full overflow-hidden rounded-full bg-[#12291c]">
                  <div className="bar-with h-full w-[5.5%] min-w-[10px] origin-left rounded-full bg-moss-bright" />
                </div>
                <p className="mt-1.5 font-mono text-[10px] text-moss-bright/90">
                  with · 25 minutes, same question
                </p>
              </div>
            </div>

            <AnimText
              as="p"
              type="words"
              className="mt-8 font-serif text-2xl italic leading-snug text-ink/90"
            >
              &ldquo;A bank is just where a slow answer is easiest to put a
              price on.&rdquo;
            </AnimText>
            <p className="sc-line mt-6 max-w-sm text-[12.5px] leading-relaxed text-ink/50">
              This scenario assumes every connection is available. The first
              release covers main databases and spreadsheet exports. The same
              pattern shows up wherever one question spans several systems: a
              late delivery across the courier, the warehouse and billing, or
              a spike in refunds across the shop, payments and support.
            </p>
          </div>
        </div>

        {/* progress (desktop) */}
        <div aria-hidden className="mx-auto mt-10 hidden w-full max-w-6xl px-14 lg:block">
          <div className="h-px w-full bg-night-line">
            <div className="sc-progress h-px w-full origin-left bg-moss-bright" />
          </div>
        </div>
      </div>
    </section>
  );
}
