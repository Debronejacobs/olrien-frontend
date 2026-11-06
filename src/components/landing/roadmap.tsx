"use client";

import { useEffect, useRef } from "react";
import { SectionHeading } from "@/components/landing/section-heading";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const STAGES = [
  {
    tag: "now",
    title: "First self-hosted preview",
    body: "Shipping to the early-access list, oldest signups first. Design-partner conversations begin.",
    detail: "gets the first customers in",
  },
  {
    tag: "preview",
    title: "Read tools with lineage tracing",
    body: "Connectors for PostgreSQL, MySQL and CSV. Agent-assisted onboarding. Three starter ontologies.",
    detail: "widens coverage to operational databases and files",
  },
  {
    tag: "next",
    title: "Warehouse layer",
    body: "Snowflake, Databricks, BigQuery, Redshift, ClickHouse.",
    detail: "widens coverage to history at analytics scale",
  },
  {
    tag: "then",
    title: "SaaS, CRM and documents",
    body: "Attio, Salesforce, HubSpot, Stripe, Zendesk, Shopify — then unstructured extraction from documents.",
    detail: "widens coverage to customer-facing records, contracts, tickets and transcripts",
  },
  {
    tag: "later",
    title: "The action gateway",
    body: "Typed, dry-run, human-approved writes — from reading the business to acting on it.",
    detail: "widens what the system does",
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
      className="scroll-mt-20 py-24 lg:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="07 — Roadmap"
          title="Widen what it can see. Then what it can do."
          lead="Connectors ship on a weekly cadence once the preview is live. Sequenced so coverage earns the right to act."
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
                — {s.detail}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
