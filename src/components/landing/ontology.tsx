"use client";

import { useEffect, useRef } from "react";
import { SectionHeading } from "@/components/landing/section-heading";
import { Reveal } from "@/components/landing/reveal";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

const ACTIONS = [
  { verb: "CREATE", sig: "Order(order)", note: "typed · scoped · logged" },
  { verb: "READ", sig: "Customer(customer)", note: "typed · lineage attached" },
  { verb: "UPDATE", sig: "Invoice(invoice)", note: "typed · dry run · approved" },
  { verb: "DELETE", sig: "Draft(draft)", note: "typed · reversible · logged" },
];

export function Ontology() {
  const figRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = figRef.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      // The graph draws itself as the figure crosses the viewport
      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          end: "top 20%",
          scrub: 0.6,
        },
      });
      tl.fromTo(
        ".ont-node",
        { opacity: 0, scale: 0.82, transformOrigin: "50% 50%" },
        { opacity: 1, scale: 1, duration: 0.45, stagger: 0.09 }
      )
        .fromTo(
          ".ont-edge",
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: 0.7, stagger: 0.1 },
          0.25
        )
        .fromTo(
          ".ont-edge-label",
          { opacity: 0 },
          { opacity: 1, duration: 0.3, stagger: 0.08 },
          0.55
        );

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

      // Data pulses travel the edges while the figure is on screen
      const pulses = gsap.utils.toArray<SVGCircleElement>(".ont-pulse");
      const routes: [number, number, number, number][] = [
        [258, 226, 388, 154],
        [534, 128, 652, 98],
        [534, 156, 660, 230],
        [214, 272, 396, 330],
      ];
      const tweens = pulses.map((dot, i) => {
        const [x1, y1, x2, y2] = routes[i % routes.length];
        return gsap.fromTo(
          dot,
          { attr: { cx: x1, cy: y1 }, opacity: 0 },
          {
            attr: { cx: x2, cy: y2 },
            opacity: 0.85,
            duration: 1.4,
            ease: "power1.inOut",
            repeat: -1,
            repeatDelay: 0.9,
            delay: i * 0.7,
            paused: true,
          }
        );
      });
      ScrollTrigger.create({
        trigger: el,
        start: "top 95%",
        end: "bottom 0%",
        onToggle: (self) =>
          tweens.forEach((t) => (self.isActive ? t.play() : t.pause())),
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="product"
      aria-label="The product: ontology"
      className="scroll-mt-20 border-t border-line bg-paper-deep/40 py-28 lg:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:items-start lg:gap-14">
          <div className="lg:sticky lg:top-28">
            <SectionHeading
              eyebrow="02 · The ontology"
              title="The ontology fixes the meaning."
              lead={
                <>
                  One shared definition of the objects the company runs on. A
                  customer becomes one object instead of three records with
                  different identifiers; an order is placed, a shipment ships,
                  an invoice bills. The ontology declares the verbs too, so
                  every write arrives typed and scoped instead of free form.
                </>
              }
            />
            <Reveal className="mt-8 space-y-3">
              {[
                ["objects", "the nouns the business runs on"],
                ["links", "how they relate"],
                ["actions", "the verbs, declared once, reused by every tool"],
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
                  stroke="#39413a"
                  strokeWidth="1.6"
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
                  fill="#9a9788"
                  stroke="#161a15"
                  strokeWidth="5"
                  paintOrder="stroke"
                >
                  <text x="308" y="182">places</text>
                  <text x="578" y="102">ships</text>
                  <text x="582" y="204">bills</text>
                  <text x="290" y="314">raises</text>
                </g>

                {/* travelling pulses */}
                <circle className="ont-pulse" r="3.2" fill="#2ea065" opacity="0" />
                <circle className="ont-pulse" r="3.2" fill="#2ea065" opacity="0" />
                <circle className="ont-pulse" r="3.2" fill="#e0994a" opacity="0" />
                <circle className="ont-pulse" r="3.2" fill="#2ea065" opacity="0" />

                {/* Customer */}
                <g className="ont-node">
                  <title>The Customer: one object merged from three cited sources</title>
                  <rect
                    x="85"
                    y="205"
                    width="172"
                    height="70"
                    rx="10"
                    fill="#14241b"
                    stroke="#2ea065"
                    strokeWidth="1.8"
                  />
                  <text
                    x="171"
                    y="235"
                    textAnchor="middle"
                    fontFamily="var(--font-jetbrains), monospace"
                    fontSize="17"
                    fontWeight="600"
                    fill="#8ce0ae"
                  >
                    Customer
                  </text>
                  <text
                    x="171"
                    y="256"
                    textAnchor="middle"
                    fontFamily="var(--font-jetbrains), monospace"
                    fontSize="11"
                    fill="#2ea065"
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
                    fill="#151914"
                    stroke="#2d342c"
                    strokeWidth="1.5"
                  />
                  <text
                    x="461"
                    y="134"
                    textAnchor="middle"
                    fontFamily="var(--font-jetbrains), monospace"
                    fontSize="15"
                    fill="#e9e7dc"
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
                    fill="#151914"
                    stroke="#2d342c"
                    strokeWidth="1.5"
                  />
                  <text
                    x="734"
                    y="104"
                    textAnchor="middle"
                    fontFamily="var(--font-jetbrains), monospace"
                    fontSize="15"
                    fill="#e9e7dc"
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
                    fill="#151914"
                    stroke="#2d342c"
                    strokeWidth="1.5"
                  />
                  <text
                    x="734"
                    y="236"
                    textAnchor="middle"
                    fontFamily="var(--font-jetbrains), monospace"
                    fontSize="15"
                    fill="#e9e7dc"
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
                    fill="#151914"
                    stroke="#2d342c"
                    strokeWidth="1.5"
                  />
                  <text
                    x="469"
                    y="336"
                    textAnchor="middle"
                    fontFamily="var(--font-jetbrains), monospace"
                    fontSize="15"
                    fill="#e9e7dc"
                  >
                    Ticket
                  </text>
                </g>
              </svg>
            </div>

            {/* Declared CRUD actions */}
            <div className="ont-actions mt-4 grid gap-3 sm:grid-cols-2">
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
            <p className="mt-4 text-center font-mono text-[11.5px] text-muted-foreground">
              forty private models become one model that every person and every tool shares
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
