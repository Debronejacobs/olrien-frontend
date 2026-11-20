"use client";

/**
 * Endpoint — "The Gate"
 *
 * Replaces the old Endpoint section (static /ontology.png diagram + scrubbed audit console)
 * with a single machine: traffic arrives from humans + agents on the left, passes through
 * the ontology gate (LINEAGE -> TYPE -> POLICY), allowed packets fly on to the systems,
 * denied packets bounce back with the policy reason — and every decision drops a receipt
 * into the ledger below. Scrolling scrubs a live clock from 09:14 to 09:20; at the end
 * the ledger seals itself into an append-only hash chain.
 *
 * Drop-in replacement: same section id, same imports (SectionHeading, gsap lib, cn).
 * Preserved from the original: the verbatim heading/lead copy, the verbatim LOG array,
 * "All Changes tracked are immutable", the desktop sticky scrub pattern, the mobile
 * static fallback, and prefersReducedMotion handling (now actually rendering the full
 * static console instead of an empty one).
 */

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  Bot,
  Database,
  FileText,
  Link2,
  PackagePlus,
  Receipt,
  ScrollText,
  ShieldCheck,
  Wallet,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/landing/section-heading";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
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

/* ------------------------------------------------------------------ */
/* Machine geometry + routing                                          */
/* ------------------------------------------------------------------ */

// If your moss-bright token differs from this hex, adjust here (used by GSAP only).
const MOSS = "#7ee787";
const DENY = "#e5704a";

type RouteEvent = { from: string; to: string; denied?: string };

const ROUTE: RouteEvent[] = [
  { from: "agent-7", to: "CRM" },
  { from: "analyst", to: "Warehouse" },
  { from: "agent-7", to: "Billing" },
  { from: "agent-2", to: "CRM", denied: "policy: pii.masked" },
  { from: "assistant", to: "Orders" },
  { from: "steward", to: "Docs" },
  { from: "agent-2", to: "Payroll", denied: "policy: writes.payroll.blocked" },
  { from: "auditor", to: "Audit" },
];

const SOURCES: { name: string; y: number }[] = [
  { name: "analyst", y: 12 },
  { name: "steward", y: 24 },
  { name: "auditor", y: 36 },
  { name: "agent-7", y: 56 },
  { name: "agent-2", y: 68 },
  { name: "assistant", y: 80 },
];

const HUMANS = new Set(["analyst", "steward", "auditor"]);

const SRC_Y: Record<string, number> = Object.fromEntries(SOURCES.map((s) => [s.name, s.y]));

const ESTATE: { name: string; y: number; icon: LucideIcon }[] = [
  { name: "CRM", y: 10, icon: Database },
  { name: "Warehouse", y: 24, icon: Warehouse },
  { name: "Billing", y: 38, icon: Receipt },
  { name: "Orders", y: 52, icon: PackagePlus },
  { name: "Docs", y: 66, icon: FileText },
  { name: "Payroll", y: 80, icon: Wallet },
  { name: "Audit", y: 92, icon: ShieldCheck },
];

const EST_Y: Record<string, number> = Object.fromEntries(ESTATE.map((e) => [e.name, e.y]));

const CHECKPOINTS: { name: string; y: number }[] = [
  { name: "LINEAGE", y: 26 },
  { name: "POLICY", y: 50 },
  { name: "TYPE", y: 74 },
];

const SECS = [33242, 33259, 33340, 33365, 33442, 33527, 33543, 33611];

const pad = (n: number) => String(n).padStart(2, "0");
const fmtClock = (v: number) =>
  `[ ${pad(Math.floor(v / 3600))}:${pad(Math.floor((v % 3600) / 60))}:${pad(Math.floor(v % 60))} ]`;

/* ------------------------------------------------------------------ */
/* Ledger row                                                          */
/* ------------------------------------------------------------------ */

function LogRow({ l, idx, live }: { l: LogLine; idx: number; live: boolean }) {
  return (
    <p
      data-idx={idx}
      className={cn(
        "al-line flex items-baseline gap-3 whitespace-nowrap rounded px-2 font-mono text-[11px] leading-[1.95]",
        live && "opacity-0"
      )}
    >
      <span className="rail-dot h-1.5 w-1.5 shrink-0 self-center rounded-full bg-ink/25" />
      <span className="text-ink/40">[{l.t}]</span>
      <span
        className={cn(
          "w-14 font-medium",
          l.action === "READ" || l.action === "LIST" ? "text-ink/70" : "text-moss-bright"
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

/* ------------------------------------------------------------------ */
/* The machine (used live on desktop, static everywhere else)          */
/* ------------------------------------------------------------------ */

function Machine({ live }: { live: boolean }) {
  return (
    <div className="overflow-hidden rounded-xl border border-night-line bg-night shadow-[0_30px_80px_-30px_rgba(12,14,12,0.7)]">
      {/* header */}
      <div className="flex items-center justify-between border-b border-night-line px-4 py-2.5">
        <p data-lhead className="flex items-center gap-2 font-mono text-[11px] text-ink/60">
          <ScrollText className="h-3.5 w-3.5 text-moss-bright" />
          All Changes tracked are immutable
        </p>
        <p className="flex items-center gap-4 font-mono text-[11px] text-ink/50">
          <span data-clock className="text-ink/70">
            {live ? fmtClock(SECS[0]) : fmtClock(SECS[SECS.length - 1])}
          </span>
          <span>
            <span data-counter className="text-moss-bright">
              {live ? "0" : "8"}
            </span>
            /8 decisions
          </span>
        </p>
      </div>

      {/* scrubbed progress line */}
      <span
        aria-hidden
        data-prog
        className="block h-px w-full bg-moss-bright/70"
        style={live ? { transform: "scaleX(0)", transformOrigin: "left" } : undefined}
      />

      {/* the gate — desktop only */}
      <div
        role="img"
        aria-label="Humans and AI agents send every request through one front door, the ontology. The gate checks lineage, type and policy, delivers allowed actions to your systems, bounces denied ones back with the policy reason, and writes every request into one immutable ledger."
        className="relative hidden h-[340px] bg-night lg:block"
        style={{
          backgroundImage:
            "linear-gradient(rgba(36,42,36,0.32) 1px, transparent 1px), linear-gradient(90deg, rgba(36,42,36,0.32) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      >
        <span className="absolute left-3.5 top-2.5 font-mono text-[9px] tracking-[0.22em] text-ink/35">
          HUMANS + AGENTS
        </span>
        <span className="absolute left-1/2 top-2.5 -translate-x-1/2 font-mono text-[9px] tracking-[0.22em] text-ink/35">
          THE ONTOLOGY — ONE FRONT DOOR
        </span>
        <span className="absolute right-3.5 top-2.5 font-mono text-[9px] tracking-[0.22em] text-ink/35">
          SYSTEMS
        </span>

        {/* faint tracks */}
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          {SOURCES.map((s) => (
            <line key={`s-${s.name}`} x1="10" y1={s.y} x2="50" y2="50" stroke="rgba(233,238,231,0.08)" vectorEffect="non-scaling-stroke" />
          ))}
          {ESTATE.map((e) => (
            <line key={`e-${e.name}`} x1="50" y1="50" x2="90" y2={e.y} stroke="rgba(233,238,231,0.08)" vectorEffect="non-scaling-stroke" />
          ))}
        </svg>

        {/* gate + checkpoints */}
        <div
          aria-hidden
          className="absolute bottom-[6%] left-[44%] top-[6%] w-[12%] rounded-xl border border-night-line bg-gradient-to-b from-moss-bright/[0.05] to-moss-bright/[0.01]"
        >
          {CHECKPOINTS.map((c) => (
            <div
              key={c.name}
              data-cp={c.name}
              style={{ top: `${c.y}%` }}
              className="absolute left-1/2 z-[6] flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-night-line bg-[#0d100d] px-2.5 py-1 font-mono text-[9px] tracking-[0.14em] text-ink/55"
            >
              <span className="h-[5px] w-[5px] rounded-full bg-ink/25" />
              {c.name}
            </div>
          ))}
        </div>

        {/* source chips */}
        {SOURCES.map((s) => {
          const isAgent = !HUMANS.has(s.name);
          return (
            <div
              key={s.name}
              data-src={s.name}
              style={{ top: `${s.y}%` }}
              className="absolute left-[1.2%] z-[2] flex -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-night-line bg-night px-2.5 py-1 font-mono text-[10px] text-ink/75"
            >
              {isAgent ? (
                <Bot className="h-3 w-3 text-moss-bright" />
              ) : (
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-ink/10 text-[7px] text-ink/70">
                  {s.name[0].toUpperCase()}
                </span>
              )}
              {s.name}
            </div>
          );
        })}

        {/* estate chips */}
        {ESTATE.map((e) => (
          <div
            key={e.name}
            data-est={e.name}
            style={{ top: `${e.y}%` }}
            className="absolute right-[1.2%] z-[2] flex -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-night-line bg-night px-2.5 py-1 font-mono text-[10px] text-ink/75"
          >
            <e.icon className="h-3 w-3 text-moss-bright/70" />
            {e.name}
          </div>
        ))}

        {/* packets (rendered only in scrub mode) */}
        {live &&
          ROUTE.map((r, i) => (
            <div
              key={i}
              data-packet={i}
              className="pointer-events-none absolute z-[5] h-0 w-0 opacity-0 invisible"
              style={{ left: "10%", top: `${SRC_Y[r.from]}%` }}
            >
              <span className="pk-dot absolute -left-1 -top-1 h-2 w-2 rounded-full bg-moss-bright shadow-[0_0_10px_rgba(126,231,135,0.8)]" />
              {r.denied && (
                <span className="pk-tag absolute left-2.5 top-[-9px] whitespace-nowrap rounded-md border border-[#e5704a]/40 bg-night px-1.5 py-0.5 font-mono text-[9px] text-[#e5704a]">
                  {r.denied}
                </span>
              )}
            </div>
          ))}
      </div>

      {/* compact static flow — mobile only */}
      <div className="border-b border-night-line px-4 py-4 lg:hidden">
        <p className="mb-2 font-mono text-[9px] tracking-[0.22em] text-ink/35">HUMANS + AGENTS</p>
        <div className="flex flex-wrap gap-1.5">
          {SOURCES.map((s) => (
            <span
              key={s.name}
              className="flex items-center gap-1.5 rounded-full border border-night-line bg-night px-2.5 py-1 font-mono text-[10px] text-ink/75"
            >
              {!HUMANS.has(s.name) ? (
                <Bot className="h-3 w-3 text-moss-bright" />
              ) : (
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-ink/10 text-[7px] text-ink/70">
                  {s.name[0].toUpperCase()}
                </span>
              )}
              {s.name}
            </span>
          ))}
        </div>
        <p className="my-2.5 flex justify-center">
          <ArrowDown className="h-3.5 w-3.5 text-ink/30" />
        </p>
        <p className="mb-2 font-mono text-[9px] tracking-[0.22em] text-ink/35">
          THE ONTOLOGY — ONE FRONT DOOR
        </p>
        <div className="flex flex-wrap gap-1.5">
          {CHECKPOINTS.map((c) => (
            <span
              key={c.name}
              className="flex items-center gap-1.5 rounded-full border border-night-line bg-[#0d100d] px-2.5 py-1 font-mono text-[9px] tracking-[0.14em] text-ink/55"
            >
              <span className="h-[5px] w-[5px] rounded-full bg-ink/25" />
              {c.name}
            </span>
          ))}
        </div>
        <p className="my-2.5 flex justify-center">
          <ArrowDown className="h-3.5 w-3.5 text-ink/30" />
        </p>
        <p className="mb-2 font-mono text-[9px] tracking-[0.22em] text-ink/35">SYSTEMS</p>
        <div className="flex flex-wrap gap-1.5">
          {ESTATE.map((e) => (
            <span
              key={e.name}
              className="flex items-center gap-1.5 rounded-full border border-night-line bg-night px-2.5 py-1 font-mono text-[10px] text-ink/75"
            >
              <e.icon className="h-3 w-3 text-moss-bright/70" />
              {e.name}
            </span>
          ))}
        </div>
      </div>

      {/* ledger */}
      <div aria-live="polite" className="relative h-[210px] overflow-hidden px-4 py-3">
        <span
          aria-hidden
          data-rail
          className="absolute bottom-3 left-[27px] top-3 w-px bg-moss-bright/50"
          style={live ? { transform: "scaleY(0)", transformOrigin: "top" } : undefined}
        />
        {live && (
          <p
            data-idle
            className="absolute inset-x-0 top-[92px] text-center font-mono text-[11px] text-ink/30"
          >
            — waiting for traffic · scroll to open the gate —
          </p>
        )}
        {LOG.map((l, i) => (
          <LogRow key={l.t} l={l} idx={i} live={live} />
        ))}
      </div>

      {/* sealed chain */}
      <div
        data-seal
        className={cn(
          "flex items-center gap-2 border-t border-night-line px-4 py-2 font-mono text-[10px] tracking-[0.08em] text-ink/55",
          live && "opacity-0"
        )}
      >
        <Link2 className="h-3 w-3 shrink-0 text-moss-bright" />
        <span>
          <span className="font-semibold text-moss-bright">SEALED</span> · sha-256 chained ·
          append-only · 8 decisions · 2 denied · nothing rewritten
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export function Endpoint() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [staticMode, setStaticMode] = useState(false);

  /* Desktop: scroll scrubs the machine through the 8 decisions + the seal */
  useEffect(() => {
    if (prefersReducedMotion()) {
      setStaticMode(true);
      return;
    }
    const el = wrapRef.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const ctx = gsap.context(() => {
        const q = (s: string) => el.querySelector(s);
        const qa = (s: string) => Array.from(el.querySelectorAll<HTMLElement>(s));

        const packets = qa("[data-packet]");
        const rows = qa(".al-line");
        const clockEl = q("[data-clock]");
        const counterEl = q("[data-counter]");
        const clock = { v: SECS[0] };
        const count = { n: 0 };

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
          q("[data-prog]"),
          { scaleX: 0 },
          { scaleX: 1, duration: 9.3 },
          0
        );
        const idle = q("[data-idle]");
        if (idle) tl.to(idle, { autoAlpha: 0, duration: 0.25 }, 0.05);

        const cpFlash = (name: string, at: number, denied: boolean) => {
          const pill = q(`[data-cp="${name}"]`);
          if (!pill) return;
          const rest = getComputedStyle(pill).borderColor;
          const c = denied ? "rgba(229,112,74," : "rgba(126,231,135,";
          tl.fromTo(
            pill,
            {
              boxShadow: `0 0 0 0 ${c}0.35)`,
              borderColor:
                denied && name === "POLICY" ? "rgba(229,112,74,0.6)" : "rgba(126,231,135,0.45)",
            },
            { boxShadow: `0 0 0 12px ${c}0)`, borderColor: rest, duration: 0.45, immediateRender: false },
            at
          );
        };

        const pulse = (sel: string, at: number, color: string) => {
          const node = q(sel);
          if (!node) return;
          const rest = getComputedStyle(node).borderColor;
          tl.fromTo(
            node,
            { boxShadow: `0 0 0 0 ${color.replace("1)", "0.4)")}`, borderColor: color },
            { boxShadow: `0 0 0 14px ${color.replace("1)", "0)")}`, borderColor: rest, duration: 0.5, immediateRender: false },
            at
          );
        };

        ROUTE.forEach((r, i) => {
          const t0 = i;
          const p = packets[i];
          const srcY = SRC_Y[r.from];
          const row = rows[i];

          // the wall clock advances to the event time while the packet flies in
          tl.to(
            clock,
            {
              v: SECS[i],
              duration: 0.3,
              onUpdate: () => {
                if (clockEl) clockEl.textContent = fmtClock(clock.v);
              },
            },
            t0
          );

          // spawn + fly into the gate
          tl.set(p, { autoAlpha: 1 }, t0);
          tl.fromTo(
            p,
            { left: "10%", top: `${srcY}%` },
            { left: "50%", top: "50%", duration: 0.3, ease: "power1.inOut" },
            t0
          );

          // inspection: lineage -> type -> policy
          cpFlash("LINEAGE", t0 + 0.3, false);
          cpFlash("TYPE", t0 + 0.4, false);
          cpFlash("POLICY", t0 + 0.5, Boolean(r.denied));

          const dot = p?.querySelector(".pk-dot");

          if (r.denied) {
            tl.to(
              dot,
              { backgroundColor: DENY, boxShadow: "0 0 10px rgba(229,112,74,0.8)", duration: 0.08 },
              t0 + 0.5
            );
            tl.fromTo(
              p,
              { left: "50%", top: "50%" },
              { left: "10%", top: `${srcY}%`, duration: 0.34, ease: "power1.in", immediateRender: false },
              t0 + 0.62
            );
            const tag = p?.querySelector(".pk-tag");
            if (tag)
              tl.fromTo(tag, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1, immediateRender: false }, t0 + 0.64);
            pulse(`[data-src="${r.from}"]`, t0 + 0.82, "rgba(229,112,74,1)");
            tl.fromTo(
              row,
              { autoAlpha: 0, y: 6 },
              { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" },
              t0 + 0.88
            );
            tl.fromTo(
              row,
              { backgroundColor: "rgba(229,112,74,0.16)" },
              { backgroundColor: "rgba(229,112,74,0)", duration: 1.3, immediateRender: false },
              t0 + 0.95
            );
            tl.set(p, { autoAlpha: 0 }, t0 + 0.98);
          } else {
            tl.fromTo(
              p,
              { left: "50%", top: "50%" },
              { left: "90%", top: `${EST_Y[r.to]}%`, duration: 0.34, ease: "power1.inOut", immediateRender: false },
              t0 + 0.62
            );
            pulse(`[data-est="${r.to}"]`, t0 + 0.86, "rgba(126,231,135,1)");
            tl.fromTo(
              row,
              { autoAlpha: 0, y: 6 },
              { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" },
              t0 + 0.78
            );
            tl.set(p, { autoAlpha: 0 }, t0 + 0.98);
          }

          tl.to(
            count,
            {
              n: i + 1,
              duration: 0.25,
              onUpdate: () => {
                if (counterEl) counterEl.textContent = String(Math.round(count.n));
              },
            },
            t0 + 0.75
          );
        });

        // finale: the ledger seals itself into a hash chain
        tl.fromTo(
          q("[data-rail]"),
          { scaleY: 0 },
          { scaleY: 1, duration: 0.8, ease: "power1.inOut" },
          8.15
        );
        tl.to(".rail-dot", { backgroundColor: MOSS, duration: 0.18, stagger: 0.06 }, 8.2);
        tl.fromTo(
          q("[data-seal]"),
          { autoAlpha: 0, y: 6 },
          { autoAlpha: 1, y: 0, duration: 0.3 },
          9.0
        );
        tl.to(q("[data-lhead]"), { color: MOSS, duration: 0.35 }, 9.0);
      }, el);
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, [staticMode]);

  return (
    <section
      id="endpoint"
      aria-label="The product: endpoint"
      className="scroll-mt-20 py-28 lg:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          align="center"
          eyebrow="03 · Central nervous system"
          title="A central system for orchestrating decisions across Human and AI teams"
          lead={
            <>
              By mapping your data, rules, actions, and security into a single operational model,
              Olrien transforms how your business automates complex decisions.
            </>
          }
        />

        {staticMode ? (
          /* reduced motion: full static console, no scrub */
          <div className="mx-auto mt-16 max-w-5xl">
            <Machine live={false} />
          </div>
        ) : (
          <>
            {/* Desktop: sticky + scrubbed */}
            <div
              ref={wrapRef}
              className="relative mx-auto mt-16 hidden h-[300vh] max-w-5xl lg:block"
            >
              <div className="lg:sticky lg:top-[12vh]">
                <Machine live />
              </div>
            </div>
            {/* Mobile: static */}
            <div className="mx-auto mt-10 max-w-5xl lg:hidden">
              <Machine live={false} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}