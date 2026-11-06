"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, CheckCircle2, TimerReset } from "lucide-react";
import { Eyebrow } from "@/components/landing/section-heading";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const WITHOUT = [
  ["09:05", "Tickets exported to a spreadsheet."],
  ["09:40", "Transfer records requested from the core-banking team; the queue is waited on."],
  ["10:30", "Login and device events pulled by an engineer and matched by hand — identifiers differ across systems."],
  ["11:15", "The first real lead — recent phone-number changes — noticed by chance in the CRM."],
  ["12:30", "Two teams define \u201cactive customer\u201d differently; their counts disagree."],
  ["13:45", "Scope estimated at around forty accounts while outbound transfers keep settling."],
  ["14:30", "The freeze is coordinated across payments, operations and compliance — by email."],
];

const WITH = [
  ["09:08", "The nine callers share a pattern: a phone change made through the call centre within 72 hours, a new device within 24, a new payee from that device, transfers just under the step-up threshold. Lineage back to every source record."],
  ["09:14", "Who else matches: 212 customers — 31 with outbound transfers still pending, totalling $1.86M — 17 of them headed to three shared beneficiary accounts."],
  ["09:20", "Compliance and payments receive the same lineage-backed answer. No one re-derives it; no definitions disagree."],
  ["09:25", "A typed HoldOutboundTransfers action, with a dry run: 31 transfers, $1.86M, zero payroll runs affected. The Head of Payments approves. It executes — and is logged."],
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
            <span className="text-[12.5px] leading-relaxed text-paper/75">
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
        // per-panel line reveals — deterministic at every scroll position.
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
      aria-label="A Tuesday morning at a bank — illustrative scenario"
      className="scroll-mt-0 bg-night text-paper"
    >
      <div className="mx-auto flex min-h-screen max-w-[110rem] flex-col justify-center py-20 lg:max-w-none lg:py-0">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-14">
          <Eyebrow dark>04 — A scenario · illustrative</Eyebrow>
          <h2 className="mt-4 max-w-3xl font-display text-3xl font-medium leading-[1.08] tracking-tight text-paper sm:text-4xl lg:text-[2.75rem]">
            A Tuesday morning at a bank.
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-paper/65 sm:text-lg">
            Northgate Bank: 1.2 million customers, data in eight places, each
            with its own customer identifier. At 08:47 the call centre takes
            the first of nine calls about transfers nobody made. The Head of
            Fraud Operations has one question — one-off, or the start of an
            account-takeover wave? And how much money is still in motion?
          </p>
        </div>

        {/* Horizontal track (desktop) / stacked (mobile) */}
        <div className="scenario-track mt-12 flex flex-col gap-6 px-5 sm:px-8 lg:mt-14 lg:w-max lg:flex-row lg:gap-8 lg:px-14">
          {/* intro */}
          <div className="sc-panel flex shrink-0 flex-col justify-center lg:w-[30vw] lg:py-8">
            <p className="sc-line font-serif text-3xl italic leading-snug text-paper/90 lg:text-4xl">
              &ldquo;Is this a one-off, or the start of a wave?&rdquo;
            </p>
            <p className="sc-line mt-5 font-mono text-[11.5px] text-paper/45">
              08:47 — first of nine calls · the answer spans eight systems
            </p>
          </div>

          <TimelinePanel
            variant="without"
            title="Without Aletheia"
            rows={WITHOUT}
            footer="≈ 5.5 hours to containment · evidence scattered across inboxes and spreadsheets"
            className="panel-without lg:w-[42vw] lg:self-center"
          />

          <TimelinePanel
            variant="with"
            title="With Aletheia"
            rows={WITH}
            footer="≈ 25 minutes to containment · the audit export is largely written already"
            className="panel-with lg:w-[46vw] lg:self-center"
          />

          {/* closing */}
          <div className="sc-panel flex shrink-0 flex-col justify-center lg:w-[34vw] lg:pr-14">
            <p className="sc-line flex items-center gap-3 font-mono text-2xl sm:text-3xl">
              <span className="text-[#e5704a]/80 line-through decoration-[#e5704a]/50">5.5h</span>
              <TimerReset className="h-5 w-5 text-moss-bright" />
              <span className="font-semibold text-moss-bright">25 min</span>
            </p>
            <p className="sc-line mt-6 font-serif text-2xl italic leading-snug text-paper/90">
              &ldquo;The bank is simply where a slow answer is easiest to
              price.&rdquo;
            </p>
            <p className="sc-line mt-6 max-w-sm text-[12.5px] leading-relaxed text-paper/50">
              The scenario assumes the full connector set. The first preview
              covers PostgreSQL, MySQL and CSV. The same shape appears wherever
              a question spans systems — a delayed shipment across carrier,
              warehouse and billing; a refund spike across storefront,
              payments and support.
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
