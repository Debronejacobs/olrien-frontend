"use client";

import { useEffect, useRef } from "react";
import { SectionHeading } from "@/components/landing/section-heading";
import { Reveal } from "@/components/landing/reveal";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const ACTIONS = [
  { verb: "Place", sig: "a new order", note: "allowed · limited in scope · recorded" },
  { verb: "Look up", sig: "a customer's details", note: "shows where the answer came from" },
  { verb: "Correct", sig: "an invoice", note: "previewed · approved · recorded" },
  { verb: "Discard", sig: "a draft", note: "can be undone · recorded" },
];

export function Ontology() {
  const figRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = figRef.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".ont-action",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.09,
          scrollTrigger: { trigger: ".ont-actions", start: "top 90%" },
        }
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="product"
      aria-label="The product: one shared model"
      className="scroll-mt-20 border-t border-line bg-paper-deep/40 py-28 lg:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:items-start lg:gap-14">
          <div className="lg:sticky lg:top-28">
            <SectionHeading
              eyebrow="02 · How it works"
              title="One shared model of how the business works."
              lead={
                <>
                  Most companies describe themselves differently in every tool.
                  Aletheia gives you one agreed description — what a customer
                  is, what an order is, how they connect, and what people are
                  allowed to do with them. It is written down, reviewed, and
                  shared by every person and every AI tool, so there is only
                  ever one answer to check.
                </>
              }
            />
            <Reveal className="mt-8 space-y-3">
              {[
                ["things", "the customers, orders and invoices you work with"],
                ["links", "how they relate to each other"],
                ["actions", "the moves allowed, written down once and shared"],
              ].map(([k, v]) => (
                <p
                  key={k}
                  className="flex items-baseline gap-3 font-mono text-[12.5px]"
                >
                  <span className="w-24 shrink-0 font-medium uppercase tracking-[0.14em] text-moss">
                    {k}
                  </span>
                  <span className="min-w-0 text-ink-soft">{v}</span>
                </p>
              ))}
            </Reveal>
            <Reveal className="mt-8 border-l-2 border-moss pl-4">
              <p className="text-sm leading-relaxed text-ink-soft">
                Because the model comes first, permissions can be attached to
                it: who may do what, on which thing, and under which
                conditions.
              </p>
            </Reveal>
          </div>

          {/* Object graph */}
          <div ref={figRef}>
            <div className="overflow-hidden rounded-xl border border-line bg-card shadow-xs">
              <img
                src="/image.webp"
                alt="The shared model drawn as a map: a Customer places Orders, an Order ships as a Shipment and bills as an Invoice, and a Customer raises Tickets."
                width={1647}
                height={1263}
                loading="lazy"
                decoding="async"
                className="h-auto w-full"
              />
            </div>

            {/* and what is allowed on them */}
            <div className="ont-actions mt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                and what is allowed on them
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {ACTIONS.map((a) => (
                  <div
                    key={a.verb}
                    className="ont-action rounded-lg border border-line bg-card px-3.5 py-3"
                  >
                    <p className="flex items-center gap-2 font-mono text-[12px] font-medium text-ink">
                      <span className="rounded bg-moss-tint px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-moss-deep">
                        {a.verb}
                      </span>
                      {a.sig}
                    </p>
                    <p className="mt-1 font-mono text-[10.5px] text-muted-foreground">
                      {a.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-4 text-center font-mono text-[11.5px] text-muted-foreground">
              dozens of private versions become one picture that everyone shares
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}