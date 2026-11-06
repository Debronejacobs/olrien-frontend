"use client";

import { useEffect, useRef } from "react";
import { ScrollText, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/landing/section-heading";
import { Reveal } from "@/components/landing/reveal";
import { BRANDS, BrandMark } from "@/components/landing/brand-logos";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type LogLine = {
  t: string;
  action: string;
  object: string;
  actor: string;
  verdict: "allowed" | "denied";
  note: string;
};

const LOG: LogLine[] = [
  { t: "09:14:02", action: "READ", object: "Customer#1042", actor: "agent-7", verdict: "allowed", note: "3 fields · lineage: crm/billing/db" },
  { t: "09:14:19", action: "LIST", object: "Shipments?status=pending", actor: "analyst", verdict: "allowed", note: "12 rows" },
  { t: "09:15:40", action: "UPDATE", object: "Invoice#8841", actor: "agent-7", verdict: "allowed", note: "dry run ok · approved by j.moreau" },
  { t: "09:16:05", action: "READ", object: "Account#77123", actor: "agent-2", verdict: "denied", note: "policy: pii.masked" },
  { t: "09:17:22", action: "CREATE", object: "Order#90211", actor: "assistant", verdict: "allowed", note: "typed action · idempotency key set" },
  { t: "09:18:47", action: "DELETE", object: "Draft#221", actor: "steward", verdict: "allowed", note: "duplicate merged into Customer#1042" },
  { t: "09:19:03", action: "WRITE", object: "Payroll.run", actor: "agent-2", verdict: "denied", note: "policy: writes.payroll.blocked" },
  { t: "09:20:11", action: "EXPORT", object: "audit.segment", actor: "auditor", verdict: "allowed", note: "signed export · 09:14 to 09:20" },
];

const CONSUMERS = [
  { label: "Metabase", sub: "BI · analyst", brand: BRANDS.metabase },
  { label: "CrewAI", sub: "AI assistant", brand: BRANDS.crewai },
  { label: "LangChain", sub: "internal agent", brand: BRANDS.langchain },
];

const SOURCES = [
  { label: "PostgreSQL", sub: "scoped creds", brand: BRANDS.postgresql },
  { label: "Snowflake", sub: "warehouse · live scan", brand: BRANDS.snowflake },
  { label: "Databricks", sub: "lakehouse · live scan", brand: BRANDS.databricks },
  { label: "Attio", sub: "CRM · synced via API", brand: BRANDS.attio },
  { label: "Notion", sub: "typed, cited", brand: BRANDS.notion },
];

function LogRow({ l, idx, hidden }: { l: LogLine; idx: number; hidden?: boolean }) {
  return (
    <p
      data-idx={idx}
      className={cn(
        "al-line flex items-baseline gap-3 whitespace-nowrap rounded px-1 font-mono text-[11px] leading-[1.95]",
        hidden && "opacity-0"
      )}
    >
      <span className="text-ink/40">[{l.t}]</span>
      <span
        className={cn(
          "w-14 font-medium",
          l.action === "READ" || l.action === "LIST"
            ? "text-ink/70"
            : "text-moss-bright"
        )}
      >
        {l.action}
      </span>
      <span className="w-52 truncate text-ink/90">{l.object}</span>
      <span className="hidden w-20 text-ink/50 sm:inline">{l.actor}</span>
      <span
        className={cn(
          "w-14 font-medium",
          l.verdict === "allowed" ? "text-moss-bright" : "text-[#e5704a]"
        )}
      >
        {l.verdict}
      </span>
      <span className="hidden truncate text-ink/40 md:inline">{l.note}</span>
    </p>
  );
}

export function Endpoint() {
  const figRef = useRef<HTMLDivElement>(null);
  const scrubRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  /* Diagram draw-in + travelling request dots */
  useEffect(() => {
    const el = figRef.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 72%" },
        defaults: { ease: "power3.out" },
      });
      tl.fromTo(
        ".ep-node",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }
      )
        .fromTo(
          ".ep-edge",
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: 0.55, stagger: 0.05 },
          0.3
        )
        .fromTo(
          ".ep-door",
          { opacity: 0, scale: 0.9, transformOrigin: "50% 50%" },
          { opacity: 1, scale: 1, duration: 0.7 },
          0.5
        );

      // request dots: consumers -> endpoint
      gsap.utils.toArray<SVGCircleElement>(".dot-req").forEach((dot, i) => {
        const t = gsap.timeline({ repeat: -1, delay: i * 0.55, paused: true });
        t.fromTo(
          dot,
          { attr: { cx: 236, cy: [72, 222, 372][i] }, opacity: 0 },
          { attr: { cx: 372, cy: [190, 220, 250][i] }, duration: 1.5, ease: "none" }
        )
          .to(dot, { opacity: 1, duration: 0.25 }, 0.05)
          .to(dot, { opacity: 0, duration: 0.35 }, 1.15);
        dot.dataset.tw = String(i);
        (dot as unknown as { _tw: gsap.core.Timeline })._tw = t;
      });
      // read/write dots: endpoint -> sources
      gsap.utils.toArray<SVGCircleElement>(".dot-read").forEach((dot, i) => {
        const t = gsap.timeline({ repeat: -1, delay: 0.7 + i * 0.45, paused: true });
        t.fromTo(
          dot,
          { attr: { cx: 528, cy: [190, 205, 220, 235, 250][i] }, opacity: 0 },
          { attr: { cx: 696, cy: [58, 140, 222, 304, 386][i] }, duration: 1.4, ease: "none" }
        )
          .to(dot, { opacity: 1, duration: 0.25 }, 0.05)
          .to(dot, { opacity: 0, duration: 0.35 }, 1.05);
        (dot as unknown as { _tw: gsap.core.Timeline })._tw = t;
      });

      const allDots = [
        ...gsap.utils.toArray<SVGCircleElement>(".dot-req"),
        ...gsap.utils.toArray<SVGCircleElement>(".dot-read"),
      ];
      ScrollTrigger.create({
        trigger: el,
        start: "top 95%",
        end: "bottom 0%",
        onToggle: (self) =>
          allDots.forEach((d) => {
            const tw = (d as unknown as { _tw?: gsap.core.Timeline })._tw;
            if (!tw) return;
            if (self.isActive) tw.play();
            else tw.pause();
          }),
      });
    }, el);
    return () => ctx.revert();
  }, []);

  /* Sticky scrubbed audit console (desktop): scroll writes the log */
  useEffect(() => {
    const el = scrubRef.current;
    if (!el || prefersReducedMotion()) return;

    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const ctx = gsap.context(() => {
        const lines = gsap.utils.toArray<HTMLElement>(".al-line");
        const counter = { n: 0 };

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            start: "top 20%",
            end: "bottom bottom",
            scrub: 0.5,
          },
        });

        tl.fromTo(
          ".al-progress",
          { scaleX: 0 },
          { scaleX: 1, duration: lines.length, ease: "none" },
          0
        );

        lines.forEach((line, i) => {
          const at = i + 0.5;
          tl.to(line, { opacity: 1, y: 0, duration: 0.32, ease: "power2.out" }, at);
          tl.to(
            counter,
            {
              n: i + 1,
              duration: 0.32,
              onUpdate: () => {
                if (counterRef.current) {
                  counterRef.current.textContent = String(Math.round(counter.n));
                }
              },
            },
            at
          );
          if (LOG[i]?.verdict === "denied") {
            tl.fromTo(
              line,
              { backgroundColor: "rgba(229,112,74,0.16)" },
              { backgroundColor: "rgba(229,112,74,0)", duration: 1.4 },
              at + 0.05
            );
          }
        });
      }, el);
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, []);

  const consoleCard = (sticky: boolean) => (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-night-line bg-night shadow-[0_30px_80px_-30px_rgba(12,14,12,0.7)]",
        sticky && "lg:my-[16vh]"
      )}
    >
      <div className="flex items-center justify-between border-b border-night-line px-4 py-2.5">
        <p className="flex items-center gap-2 font-mono text-[11px] text-ink/60">
          <ScrollText className="h-3.5 w-3.5 text-moss-bright" />
          audit.log · append only
        </p>
        <p className="font-mono text-[10.5px] text-ink/40">
          entries <span ref={sticky ? counterRef : undefined}>8</span>/8 · reads and writes, one log
        </p>
      </div>
      <span aria-hidden className="al-progress block h-px w-full origin-left scale-x-0 bg-moss-bright/70" />
      <div className="console-scroll h-[210px] overflow-hidden px-4 py-3" aria-live="polite">
        {LOG.map((l, i) => (
          <LogRow key={l.t} l={l} idx={i} hidden={sticky} />
        ))}
      </div>
    </div>
  );

  return (
    <section
      id="endpoint"
      aria-label="The product: endpoint"
      className="scroll-mt-20 py-28 lg:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          align="center"
          eyebrow="03 · The endpoint"
          title="One door in. One log out."
          lead={
            <>
              The Model Context Protocol (an open standard for connecting AI
              tools to data) lets a single governed door serve every
              assistant, agent and BI tool. Each call is authenticated,
              checked against per object permissions, answered with lineage,
              and appended to one immutable log. Nothing reaches the
              underlying systems except through it.
            </>
          }
        />

        {/* Flow diagram */}
        <div ref={figRef} className="mx-auto mt-14 max-w-5xl">
          <div className="grid-bg rounded-xl border border-line bg-card p-4 shadow-xs sm:p-6">
            <svg
              viewBox="0 0 900 440"
              className="h-auto w-full"
              role="img"
              aria-label="Metabase, CrewAI and LangChain connect through one MCP endpoint; the endpoint reads PostgreSQL, Snowflake, Databricks, Attio and Notion with scoped credentials and appends every call to one audit log."
            >
              {/* edges */}
              <g stroke="#39413a" strokeWidth="1.4" fill="none">
                <path className="ep-edge" d="M 236 72 L 372 190" />
                <path className="ep-edge" d="M 236 222 L 372 220" />
                <path className="ep-edge" d="M 236 372 L 372 250" />
                <path className="ep-edge" d="M 528 190 L 696 58" />
                <path className="ep-edge" d="M 528 205 L 696 140" />
                <path className="ep-edge" d="M 528 220 L 696 222" />
                <path className="ep-edge" d="M 528 235 L 696 304" />
                <path className="ep-edge" d="M 528 250 L 696 386" />
              </g>

              {/* dots */}
              <circle className="dot-req" r="3.4" fill="#2ea065" opacity="0" />
              <circle className="dot-req" r="3.4" fill="#2ea065" opacity="0" />
              <circle className="dot-req" r="3.4" fill="#2ea065" opacity="0" />
              <circle className="dot-read" r="3.4" fill="#e0994a" opacity="0" />
              <circle className="dot-read" r="3.4" fill="#e0994a" opacity="0" />
              <circle className="dot-read" r="3.4" fill="#e0994a" opacity="0" />
              <circle className="dot-read" r="3.4" fill="#e0994a" opacity="0" />
              <circle className="dot-read" r="3.4" fill="#e0994a" opacity="0" />

              {/* consumers */}
              {CONSUMERS.map((c, i) => (
                <g key={c.label} className="ep-node">
                  <rect
                    x="40"
                    y={44 + i * 150}
                    width="196"
                    height="56"
                    rx="10"
                    fill="#151914"
                    stroke="#2d342c"
                    strokeWidth="1.5"
                  />
                  <BrandMark brand={c.brand} x={58} y={44 + i * 150 + 18} size={20} />
                  <text x="90" y={44 + i * 150 + 25} fontFamily="var(--font-jetbrains), monospace" fontSize="13" fontWeight="600" fill="#e9e7dc">
                    {c.label}
                  </text>
                  <text x="90" y={44 + i * 150 + 41} fontFamily="var(--font-jetbrains), monospace" fontSize="9.5" fill="#8d897b">
                    {c.sub}
                  </text>
                </g>
              ))}

              {/* the door */}
              <g className="ep-door">
                <rect
                  x="372"
                  y="158"
                  width="156"
                  height="124"
                  rx="12"
                  fill="#10130f"
                  stroke="#272d26"
                  strokeWidth="1.5"
                />
                <rect
                  x="380"
                  y="166"
                  width="140"
                  height="108"
                  rx="9"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                  opacity="0.7"
                />
                <circle cx="450" cy="200" r="7" fill="#34d399" />
                <rect x="447" y="204" width="6" height="14" rx="3" fill="#34d399" />
                <text x="450" y="246" textAnchor="middle" fontFamily="var(--font-jetbrains), monospace" fontSize="13" fontWeight="600" fill="#e9e7dc">
                  one endpoint
                </text>
                <text x="450" y="262" textAnchor="middle" fontFamily="var(--font-jetbrains), monospace" fontSize="9.5" fill="#34d399">
                  auth · permissions · log
                </text>
              </g>

              {/* sources */}
              {SOURCES.map((s, i) => (
                <g key={s.label} className="ep-node">
                  <rect
                    x="696"
                    y={30 + i * 82}
                    width="188"
                    height="56"
                    rx="10"
                    fill="#151914"
                    stroke="#2d342c"
                    strokeWidth="1.5"
                  />
                  <BrandMark brand={s.brand} x={714} y={30 + i * 82 + 18} size={20} />
                  <text x="746" y={30 + i * 82 + 25} fontFamily="var(--font-jetbrains), monospace" fontSize="13" fontWeight="600" fill="#e9e7dc">
                    {s.label}
                  </text>
                  <text x="746" y={30 + i * 82 + 41} fontFamily="var(--font-jetbrains), monospace" fontSize="9.5" fill="#8d897b">
                    {s.sub}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <Reveal className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {["authenticated", "per object permissions", "lineage on every answer", "append only audit"].map(
              (chip) => (
                <span
                  key={chip}
                  className="flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 font-mono text-[11px] text-ink-soft"
                >
                  <ShieldCheck className="h-3 w-3 text-moss" />
                  {chip}
                </span>
              )
            )}
          </Reveal>
        </div>

        {/* Audit console: sticky + scrubbed on desktop, static on mobile */}
        {/* Desktop */}
        <div
          ref={scrubRef}
          className="relative mx-auto mt-16 hidden h-[260vh] max-w-5xl lg:block"
        >
          <div className="lg:sticky lg:top-[16vh]">
            {consoleCard(true)}
            <p className="mt-4 text-center font-mono text-[11px] text-muted-foreground">
              keep scrolling · the log writes itself, one entry at a time
            </p>
          </div>
        </div>
        {/* Mobile */}
        <div className="mx-auto mt-10 max-w-5xl lg:hidden">
          {consoleCard(false)}
        </div>
      </div>
    </section>
  );
}
