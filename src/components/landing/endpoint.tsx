"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollText, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/landing/section-heading";
import { Reveal } from "@/components/landing/reveal";
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

const LOG_POOL: Omit<LogLine, "t">[] = [
  { action: "READ", object: "Customer#1042", actor: "agent-7", verdict: "allowed", note: "3 fields · lineage: crm/billing/db" },
  { action: "READ", object: "Order#88231", actor: "agent-7", verdict: "allowed", note: "lineage: db.public.orders" },
  { action: "READ", object: "Invoice#2210", actor: "bi-tool", verdict: "allowed", note: "1 field · lineage: billing/invoices" },
  { action: "LIST", object: "Shipments?status=pending", actor: "analyst", verdict: "allowed", note: "12 rows" },
  { action: "READ", object: "Customer#5171", actor: "assistant", verdict: "allowed", note: "5 fields · PII masked by role" },
  { action: "READ", object: "Account#77123", actor: "agent-2", verdict: "denied", note: "policy: pii.masked" },
  { action: "READ", object: "Ticket#9941", actor: "assistant", verdict: "allowed", note: "lineage: zendesk/tickets" },
  { action: "LIST", object: "Transfers?outbound", actor: "agent-7", verdict: "allowed", note: "31 rows · step-up flag" },
];

const CONSUMERS = [
  { label: "BI tool", sub: "analyst" },
  { label: "AI assistant", sub: "everyone" },
  { label: "Internal agent", sub: "software" },
];

const SOURCES = [
  { label: "PostgreSQL", sub: "read-only creds" },
  { label: "Warehouse", sub: "live scan" },
  { label: "CRM · SaaS", sub: "synced via API" },
  { label: "Documents", sub: "typed, cited" },
];

function clock(base: number, i: number) {
  const total = base + i;
  const h = 9;
  const m = 14 + Math.floor(total / 60);
  const s = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function Endpoint() {
  const figRef = useRef<HTMLDivElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<LogLine[]>(() =>
    LOG_POOL.slice(0, 5).map((l, i) => ({ ...l, t: clock(0, i) }))
  );

  /* Diagram draw-in + travelling request dots */
  useEffect(() => {
    const el = figRef.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 70%" },
        defaults: { ease: "power3.out" },
      });
      tl.fromTo(
        ".ep-node",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }
      )
        .fromTo(
          ".ep-edge",
          { opacity: 0, strokeDashoffset: 240 },
          { opacity: 1, strokeDashoffset: 0, duration: 0.6, stagger: 0.05 },
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
        const tl = gsap.timeline({ repeat: -1, delay: i * 0.55 });
        tl.fromTo(
          dot,
          { attr: { cx: 214, cy: [66, 166, 266][i] }, opacity: 0 },
          { attr: { cx: 372, cy: [152, 180, 208][i] }, duration: 1.5, ease: "none" }
        )
          .to(dot, { opacity: 1, duration: 0.25 }, 0.05)
          .to(dot, { opacity: 0, duration: 0.35 }, 1.15);
      });
      // read dots: endpoint -> sources
      gsap.utils.toArray<SVGCircleElement>(".dot-read").forEach((dot, i) => {
        const tl = gsap.timeline({ repeat: -1, delay: 0.7 + i * 0.45 });
        tl.fromTo(
          dot,
          { attr: { cx: 528, cy: [152, 178, 196, 212][i] }, opacity: 0 },
          { attr: { cx: 700, cy: [56, 136, 216, 296][i] }, duration: 1.4, ease: "none" }
        )
          .to(dot, { opacity: 1, duration: 0.25 }, 0.05)
          .to(dot, { opacity: 0, duration: 0.35 }, 1.05);
      });
    }, el);
    return () => ctx.revert();
  }, []);

  /* Audit log appends only while the console is on screen */
  useEffect(() => {
    const el = consoleRef.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    let interval: ReturnType<typeof setInterval> | null = null;
    let i = 5;

    const start = () => {
      if (interval) return;
      interval = setInterval(() => {
        const next = LOG_POOL[i % LOG_POOL.length];
        setLines((prev) => [...prev.slice(-5), { ...next, t: clock(0, i + 1) }]);
        i += 1;
      }, 1500);
    };
    const stop = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 95%",
      end: "bottom -10%",
      onToggle: (self) => (self.isActive ? start() : stop()),
    });
    return () => {
      stop();
      st.kill();
    };
  }, []);

  return (
    <section
      id="endpoint"
      aria-label="The product — endpoint"
      className="scroll-mt-20 py-24 lg:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          align="center"
          eyebrow="02 — The product"
          title="The endpoint fixes the access."
          lead={
            <>
              The Model Context Protocol — an open standard for how AI tools
              connect to data — lets one governed door serve every assistant
              and agent. Each call is authenticated, checked against
              per-object permissions, and appended to one immutable audit log.
              Nothing touches the underlying systems except through it.
            </>
          }
        />

        {/* Flow diagram */}
        <div ref={figRef} className="mx-auto mt-14 max-w-5xl">
          <div className="grid-bg rounded-xl border border-line bg-card p-4 shadow-xs sm:p-6">
            <svg
              viewBox="0 0 900 352"
              className="h-auto w-full"
              role="img"
              aria-label="Every consumer connects through one MCP endpoint; the endpoint reads sources with read-only credentials and appends every call to one audit log."
            >
              {/* edges */}
              <g stroke="#c9c5b6" strokeWidth="1.4" strokeDasharray="240" fill="none">
                <path className="ep-edge" d="M 214 66 L 372 152" />
                <path className="ep-edge" d="M 214 166 L 372 180" />
                <path className="ep-edge" d="M 214 266 L 372 208" />
                <path className="ep-edge" d="M 528 152 L 700 56" />
                <path className="ep-edge" d="M 528 178 L 700 136" />
                <path className="ep-edge" d="M 528 196 L 700 216" />
                <path className="ep-edge" d="M 528 212 L 700 296" />
              </g>

              {/* dots */}
              <circle className="dot-req" r="3.4" fill="#1a7f4b" />
              <circle className="dot-req" r="3.4" fill="#1a7f4b" />
              <circle className="dot-req" r="3.4" fill="#1a7f4b" />
              <circle className="dot-read" r="3.4" fill="#b45309" />
              <circle className="dot-read" r="3.4" fill="#b45309" />
              <circle className="dot-read" r="3.4" fill="#b45309" />
              <circle className="dot-read" r="3.4" fill="#b45309" />

              {/* consumers */}
              {CONSUMERS.map((c, i) => (
                <g key={c.label} className="ep-node">
                  <rect
                    x="40"
                    y={40 + i * 100}
                    width="174"
                    height="52"
                    rx="9"
                    fill="#ffffff"
                    stroke="#d6d2c4"
                    strokeWidth="1.5"
                  />
                  <text x="58" y={40 + i * 100 + 23} fontFamily="var(--font-jetbrains), monospace" fontSize="13.5" fill="#1b1a15">
                    {c.label}
                  </text>
                  <text x="58" y={40 + i * 100 + 40} fontFamily="var(--font-jetbrains), monospace" fontSize="10" fill="#6e6a5e">
                    {c.sub}
                  </text>
                </g>
              ))}

              {/* the door */}
              <g className="ep-door">
                <rect
                  x="372"
                  y="118"
                  width="156"
                  height="124"
                  rx="12"
                  fill="#1b1a15"
                />
                <rect
                  x="380"
                  y="126"
                  width="140"
                  height="108"
                  rx="9"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                  opacity="0.7"
                />
                <circle cx="450" cy="168" r="7" fill="#34d399" />
                <rect x="447" y="172" width="6" height="14" rx="3" fill="#34d399" />
                <text x="450" y="212" textAnchor="middle" fontFamily="var(--font-jetbrains), monospace" fontSize="13" fontWeight="600" fill="#faf9f5">
                  one endpoint
                </text>
                <text x="450" y="228" textAnchor="middle" fontFamily="var(--font-jetbrains), monospace" fontSize="9.5" fill="#34d399">
                  auth · permissions · log
                </text>
              </g>

              {/* sources */}
              {SOURCES.map((s, i) => (
                <g key={s.label} className="ep-node">
                  <rect
                    x="700"
                    y={30 + i * 80}
                    width="176"
                    height="52"
                    rx="9"
                    fill="#f4f2ea"
                    stroke="#d6d2c4"
                    strokeWidth="1.5"
                  />
                  <text x="718" y={30 + i * 80 + 23} fontFamily="var(--font-jetbrains), monospace" fontSize="13" fill="#1b1a15">
                    {s.label}
                  </text>
                  <text x="718" y={30 + i * 80 + 40} fontFamily="var(--font-jetbrains), monospace" fontSize="10" fill="#6e6a5e">
                    {s.sub}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <Reveal className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {["authenticated", "per-object permissions", "lineage on every answer", "append-only audit"].map(
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

        {/* Audit console */}
        <div ref={consoleRef} className="mx-auto mt-10 max-w-5xl">
          <Reveal>
            <div className="overflow-hidden rounded-xl border border-night-line bg-night shadow-lg">
              <div className="flex items-center justify-between border-b border-night-line px-4 py-2.5">
                <p className="flex items-center gap-2 font-mono text-[11px] text-paper/60">
                  <ScrollText className="h-3.5 w-3.5 text-moss-bright" />
                  audit.log — append-only
                </p>
                <p className="font-mono text-[10.5px] text-paper/40">tail -f · one log for every tool</p>
              </div>
              <div className="console-scroll h-[186px] overflow-hidden px-4 py-3" aria-live="polite">
                {lines.map((l, idx) => (
                  <p
                    key={`${l.t}-${idx}`}
                    className={cn(
                      "flex items-baseline gap-3 whitespace-nowrap font-mono text-[11px] leading-[1.9]",
                      idx < lines.length - 3 ? "opacity-40" : "opacity-100",
                      l.verdict === "denied" && "opacity-100"
                    )}
                  >
                    <span className="text-paper/40">[{l.t}]</span>
                    <span className="w-9 text-moss-bright">{l.action}</span>
                    <span className="w-52 truncate text-paper/90">{l.object}</span>
                    <span className="hidden w-20 text-paper/50 sm:inline">{l.actor}</span>
                    <span
                      className={cn(
                        "w-14 font-medium",
                        l.verdict === "allowed" ? "text-moss-bright" : "text-[#e5704a]"
                      )}
                    >
                      {l.verdict}
                    </span>
                    <span className="hidden truncate text-paper/40 md:inline">{l.note}</span>
                  </p>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
