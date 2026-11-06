"use client";

import { useEffect, useRef } from "react";
import { Lock } from "lucide-react";
import { SectionHeading } from "@/components/landing/section-heading";
import { Reveal } from "@/components/landing/reveal";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const ACTIONS = [
  { sig: "ApproveOrder(order)", note: "typed · dry-run · human-approved" },
  { sig: "HoldShipment(shipment)", note: "typed · dry-run · human-approved" },
  { sig: "IssueRefund(invoice)", note: "typed · dry-run · human-approved" },
];

export function Ontology() {
  const figRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = figRef.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 72%" },
        defaults: { ease: "power3.out" },
      });
      tl.fromTo(
        ".ont-node",
        { opacity: 0, scale: 0.82, transformOrigin: "50% 50%" },
        { opacity: 1, scale: 1, duration: 0.7, stagger: 0.12 }
      )
        .fromTo(
          ".ont-edge",
          { opacity: 0, strokeDashoffset: 320 },
          { opacity: 1, strokeDashoffset: 0, duration: 0.8, stagger: 0.14 },
          0.35
        )
        .fromTo(
          ".ont-edge-label",
          { opacity: 0 },
          { opacity: 1, duration: 0.5, stagger: 0.12 },
          0.8
        )
        .fromTo(
          ".ont-action",
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 },
          1.0
        );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="product"
      aria-label="The product — ontology"
      className="scroll-mt-20 border-t border-line bg-paper-deep/40 py-24 lg:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:items-start lg:gap-14">
          <div className="lg:sticky lg:top-28">
            <SectionHeading
              eyebrow="02 — The product"
              title="The ontology fixes the meaning."
              lead={
                <>
                  One shared definition of the objects the company runs on.
                  &ldquo;Customer&rdquo; becomes one object rather than three
                  records with different identifiers; an order is placed, a
                  shipment ships, an invoice bills. The ontology also declares
                  the verbs — so when writes arrive, they are typed and scoped
                  rather than free-form.
                </>
              }
            />
            <Reveal className="mt-8 space-y-3">
              {[
                ["objects", "the nouns the business runs on"],
                ["links", "how they relate"],
                ["actions", "the verbs — declared, not improvised"],
              ].map(([k, v]) => (
                <p
                  key={k}
                  className="flex items-baseline gap-3 font-mono text-[12.5px]"
                >
                  <span className="w-20 shrink-0 font-medium uppercase tracking-[0.14em] text-moss">
                    {k}
                  </span>
                  <span className="text-ink-soft">{v}</span>
                </p>
              ))}
            </Reveal>
          </div>

          {/* Object graph */}
          <div ref={figRef}>
            <div className="grid-bg rounded-xl border border-line bg-card p-4 shadow-xs sm:p-6">
              <svg
                viewBox="0 0 860 400"
                className="h-auto w-full"
                role="img"
                aria-label="Object graph: a Customer places Orders; an Order ships as a Shipment and bills as an Invoice; a Customer raises Tickets."
              >
                {/* Edges */}
                <g
                  fill="none"
                  stroke="#b9b4a4"
                  strokeWidth="1.6"
                  strokeDasharray="320"
                >
                  <path className="ont-edge" d="M 258 226 L 388 154" />
                  <path className="ont-edge" d="M 534 128 L 652 98" />
                  <path className="ont-edge" d="M 534 156 L 660 230" />
                  <path className="ont-edge" d="M 214 272 L 396 330" />
                </g>
                <g
                  className="ont-edge-label"
                  fontFamily="var(--font-jetbrains), monospace"
                  fontSize="12"
                  fill="#6e6a5e"
                  stroke="#ffffff"
                  strokeWidth="5"
                  paintOrder="stroke"
                >
                  <text x="308" y="182">places</text>
                  <text x="578" y="102">ships</text>
                  <text x="582" y="204">bills</text>
                  <text x="290" y="314">raises</text>
                </g>

                {/* Customer */}
                <g className="ont-node">
                  <title>The Customer — one object merged from three cited sources</title>
                  <rect
                    x="85"
                    y="205"
                    width="172"
                    height="70"
                    rx="10"
                    fill="#eaf3ec"
                    stroke="#1a7f4b"
                    strokeWidth="1.8"
                  />
                  <text
                    x="171"
                    y="235"
                    textAnchor="middle"
                    fontFamily="var(--font-jetbrains), monospace"
                    fontSize="17"
                    fontWeight="600"
                    fill="#14532d"
                  >
                    Customer
                  </text>
                  <text
                    x="171"
                    y="256"
                    textAnchor="middle"
                    fontFamily="var(--font-jetbrains), monospace"
                    fontSize="11"
                    fill="#1a7f4b"
                  >
                    3 cited sources
                  </text>
                </g>

                {/* Order */}
                <g className="ont-node">
                  <title>Order</title>
                  <rect
                    x="388"
                    y="98"
                    width="146"
                    height="60"
                    rx="10"
                    fill="#ffffff"
                    stroke="#d6d2c4"
                    strokeWidth="1.5"
                  />
                  <text
                    x="461"
                    y="134"
                    textAnchor="middle"
                    fontFamily="var(--font-jetbrains), monospace"
                    fontSize="15"
                    fill="#1b1a15"
                  >
                    Order
                  </text>
                </g>

                {/* Shipment */}
                <g className="ont-node">
                  <title>Shipment</title>
                  <rect
                    x="652"
                    y="68"
                    width="164"
                    height="60"
                    rx="10"
                    fill="#ffffff"
                    stroke="#d6d2c4"
                    strokeWidth="1.5"
                  />
                  <text
                    x="734"
                    y="104"
                    textAnchor="middle"
                    fontFamily="var(--font-jetbrains), monospace"
                    fontSize="15"
                    fill="#1b1a15"
                  >
                    Shipment
                  </text>
                </g>

                {/* Invoice */}
                <g className="ont-node">
                  <title>Invoice</title>
                  <rect
                    x="660"
                    y="200"
                    width="148"
                    height="60"
                    rx="10"
                    fill="#ffffff"
                    stroke="#d6d2c4"
                    strokeWidth="1.5"
                  />
                  <text
                    x="734"
                    y="236"
                    textAnchor="middle"
                    fontFamily="var(--font-jetbrains), monospace"
                    fontSize="15"
                    fill="#1b1a15"
                  >
                    Invoice
                  </text>
                </g>

                {/* Ticket */}
                <g className="ont-node">
                  <title>Ticket</title>
                  <rect
                    x="396"
                    y="300"
                    width="146"
                    height="60"
                    rx="10"
                    fill="#ffffff"
                    stroke="#d6d2c4"
                    strokeWidth="1.5"
                  />
                  <text
                    x="469"
                    y="336"
                    textAnchor="middle"
                    fontFamily="var(--font-jetbrains), monospace"
                    fontSize="15"
                    fill="#1b1a15"
                  >
                    Ticket
                  </text>
                </g>
              </svg>
            </div>

            {/* Declared actions */}
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {ACTIONS.map((a) => (
                <div
                  key={a.sig}
                  className="ont-action rounded-lg border border-line bg-card px-3.5 py-3"
                >
                  <p className="flex items-center gap-1.5 font-mono text-[12px] font-medium text-ink">
                    <Lock className="h-3 w-3 text-moss" />
                    {a.sig}
                  </p>
                  <p className="mt-1 font-mono text-[10.5px] text-muted-foreground">
                    {a.note}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center font-mono text-[11.5px] text-muted-foreground">
              forty private models become one model that every person and every tool shares
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
