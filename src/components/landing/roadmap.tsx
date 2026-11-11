"use client";

import { useEffect, useRef } from "react";
import { SectionHeading } from "@/components/landing/section-heading";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const STAGES = [
  {
    tag: "now",
    title: "First preview",
    body: "Goes out to the open source community first. We start talking to design partners.",
    detail: "gets the first users in",
  },
  {
    tag: "preview",
    title: "Safe changes on the systems you already run",
    body: "Connections to your main databases and spreadsheet exports, guided setup, ready made starting templates, and every change going through the full set of safety checks.",
    detail: "proves reading and changing data on the systems most companies already have",
  },
  {
    tag: "next",
    title: "Data warehouses",
    body: "Snowflake, Databricks, BigQuery, Redshift and ClickHouse.",
    detail: "extends the picture to years of history at full scale",
  },
  {
    tag: "then",
    title: "Customer systems and documents",
    body: "Attio, Salesforce, HubSpot, Stripe, Zendesk and Shopify, then pulling information out of contracts and other documents.",
    detail: "extends the picture to customer records, contracts, tickets and call transcripts",
  },
  {
    tag: "later",
    title: "Deeper safety checks",
    body: "Changes that span several systems at once, testing a policy before it takes effect, and multi-step approvals for the messiest operations.",
    detail: "extends what the system can be trusted to do",
  },
];

export function Roadmap() {
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".road-line",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "top",
          scrollTrigger: {
            trigger: el,
            start: "top 75%",
            end: "bottom 55%",
            scrub: 0.6,
          },
        }
      );
      gsap.utils.toArray<HTMLElement>(".road-item").forEach((item) => {
        gsap.from(item, {
          opacity: 0,
          x: 26,
          duration: 0.7,
          scrollTrigger: { trigger: item, start: "top 82%" },
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="roadmap"
      aria-label="Roadmap"
      className="scroll-mt-20 py-28 lg:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="09 · Roadmap"
          title="See more of the business. Check more of the changes."
          lead="New connections ship regularly once the preview is live, in an order where each one earns the right to act."
        />

        <ol ref={listRef} className="relative mt-14 max-w-3xl space-y-10 pl-8">
          {/* rail */}
          <span
            aria-hidden
            className="absolute left-[7px] top-2 h-[calc(100%-16px)] w-px bg-line"
          />
          <span
            aria-hidden
            className="road-line absolute left-[7px] top-2 h-[calc(100%-16px)] w-px origin-top bg-moss"
          />

          {STAGES.map((s, i) => (
            <li key={s.tag} className="road-item relative">
              <span
                aria-hidden
                className={cn(
                  "absolute -left-8 top-1.5 h-[15px] w-[15px] rounded-full border-2 bg-paper",
                  i === 0
                    ? "border-moss bg-moss"
                    : i === STAGES.length - 1
                      ? "border-dashed border-moss/60"
                      : "border-moss"
                )}
              />
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-moss">
                  {s.tag}
                </p>
                <h3 className="font-display text-xl font-medium text-ink">
                  {s.title}
                </h3>
              </div>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
                {s.body}
              </p>
              <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
                · {s.detail}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
