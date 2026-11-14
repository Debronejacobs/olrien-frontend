"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  Bot,
  Braces,
  Building2,
  Check,
  Cloud,
  Database,
  FolderOpen,
  GitCommitHorizontal,
  Layers,
  Network,
  Play,
  RefreshCw,
  RotateCcw,
  Server,
  ShieldCheck,
  Users,
  Warehouse,
  Webhook,
  Workflow,
} from "lucide-react";
import { SectionHeading } from "@/components/landing/section-heading";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/* -------------------------------------------------------------------------- */
/*  Palette + copy                                                            */
/* -------------------------------------------------------------------------- */

const MOSS = "#2ea065";
const MOSS_BORDER = "rgba(46,160,101,0.55)";
const DIM_DOT = "#2a332e";

const PROBLEM_TITLE = "Siloed systems create problems";
const PROBLEM_BODY =
  "Decisions made on incomplete data cause problems downstream. In a company built from silos, data is always incomplete: each system owns its own state and rules, copies drift, and dependencies stay hidden. Reports, workflows, and AI agents inherit the gaps. An ontology is the missing layer: one canonical model, explicit links, and governed actions, so people and agents decide on the full picture.";

const SYSTEMS = [
  { key: "sap", name: "SAP S/4HANA", cat: "ERP", Icon: Building2 },
  { key: "oracle", name: "Oracle", cat: "Database", Icon: Database },
  { key: "teradata", name: "Teradata", cat: "Warehouse", Icon: Warehouse },
  { key: "db2", name: "IBM Db2", cat: "Mainframe", Icon: Server },
  { key: "mssql", name: "SQL Server", cat: "Database", Icon: Database },
  { key: "databricks", name: "Databricks", cat: "Lakehouse", Icon: Layers },
  { key: "salesforce", name: "Salesforce", cat: "CRM", Icon: Cloud },
  { key: "servicenow", name: "ServiceNow", cat: "Workflow", Icon: Workflow },
  { key: "workday", name: "Workday", cat: "HR & finance", Icon: Users },
  { key: "api", name: "Internal REST API", cat: "REST", Icon: Webhook },
  { key: "carrier", name: "Carrier API", cat: "External REST", Icon: Braces },
  { key: "files", name: "SFTP & files", cat: "Files", Icon: FolderOpen },
] as const;
type SysKey = (typeof SYSTEMS)[number]["key"];
const SYS = Object.fromEntries(SYSTEMS.map((s) => [s.key, s])) as Record<
  SysKey,
  (typeof SYSTEMS)[number]
>;

const MODEL: { p: string; t: string; sys: SysKey; bind: string }[] = [
  { p: "shipment_id", t: "string", sys: "sap", bind: "LIKP.VBELN" },
  { p: "status", t: "enum", sys: "oracle", bind: "SHIPMENTS.STATUS_CD" },
  { p: "carrier", t: "Carrier", sys: "carrier", bind: "GET /carriers/{id}" },
  { p: "eta", t: "timestamp", sys: "teradata", bind: "ETA_FACT.EST_ARRIVAL" },
  { p: "destination", t: "Facility", sys: "db2", bind: "DC_MASTER.SITE_CODE" },
];

const LINKS = [
  { name: "Purchase Order", edge: "fulfils", y: 14 },
  { name: "Facility", edge: "ships_to", y: 50 },
  { name: "Supplier", edge: "supplied_by", y: 86 },
];

const RESOLVED: { k: string; v: string; sys: SysKey; ms: number; warn?: boolean }[] = [
  { k: "Shipment", v: "SHP-20931", sys: "sap", ms: 14 },
  { k: "Status", v: "Delayed", sys: "oracle", ms: 22, warn: true },
  { k: "Carrier", v: "Meridian Freight", sys: "carrier", ms: 61 },
  { k: "ETA", v: "Nov 18, 14:30", sys: "teradata", ms: 37 },
  { k: "Destination", v: "Rotterdam DC", sys: "db2", ms: 29 },
];

const ACTION_PARAMS = [
  { k: "Shipment", v: "SHP-20931" },
  { k: "New carrier", v: "Northline Freight" },
  { k: "Reason", v: "Port delay" },
];
const GATES = [
  { t: "Validated", s: "3 model rules passed" },
  { t: "Authorized", s: "Role: Logistics Planner" },
];
const WRITE_BACK: SysKey[] = ["sap", "oracle"];
const DIFF = [
  { sign: "-", text: "carrier: Meridian Freight" },
  { sign: "+", text: "carrier: Northline Freight" },
  { sign: "-", text: "status: Delayed" },
  { sign: "+", text: "status: Rerouted" },
];

const BEATS = [
  {
    n: "01",
    nav: "Connect",
    edge: "federated",
    t: "Connect, without migrating.",
    s: "Marendil federates the estate in place. Each system of record stays authoritative. No pipelines to build, no second copy to reconcile.",
  },
  {
    n: "02",
    nav: "Model",
    edge: "canonical",
    t: "Create a model of your business",
    s: "Objects, properties and links are defined once, independent of any schema. A Shipment resolves the same whether its properties live in SAP, a warehouse or a carrier API — one operational language for every team and agent.",
  },
  {
    n: "03",
    nav: "Resolve",
    edge: "live",
    t: "Resolve in real time.",
    s: "A query resolves each property against its system of record at request time. Every value returns with its source and latency: lineage, not a cached copy.",
  },
  {
    n: "04",
    nav: "Act",
    edge: "governed",
    t: "Act, with governance.",
    s: "Actions are named operations on the ontology. Each run validates against the model, enforces permissions, writes back to the systems of record, and commits an auditable diff — who changed what, and when.",
  },
];

const SCROLLBAR_CSS = `
html{scrollbar-color:#1d4a33 #0b0f0d;scrollbar-width:thin}
html::-webkit-scrollbar{width:10px}
html::-webkit-scrollbar-track{background:#0b0f0d}
html::-webkit-scrollbar-thumb{background:#1d4a33;border-radius:8px;border:2px solid #0b0f0d}
html::-webkit-scrollbar-thumb:hover{background:#2ea065}
`;

const nowHM = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
const nextHash = (h: string) =>
  ((parseInt(h, 16) + 0x1f37) % 0xfffffff).toString(16).padStart(7, "0");
const jitter = () => RESOLVED.map((r) => Math.max(6, r.ms + Math.floor(Math.random() * 13) - 4));

type Timeline = ReturnType<typeof gsap.timeline>;

/* -------------------------------------------------------------------------- */
/*  Shared marks                                                              */
/* -------------------------------------------------------------------------- */

function SourceMark({ sys, className }: { sys: SysKey; className?: string }) {
  const s = SYS[sys];
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1.5 text-ink-soft", className)}>
      <s.Icon aria-hidden className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{s.name}</span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Beat panels                                                               */
/* -------------------------------------------------------------------------- */

function ConnectPanel({
  hovered,
  onHover,
}: {
  hovered: SysKey | null;
  onHover: (k: SysKey | null) => void;
}) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
        {SYSTEMS.map((s) => (
          <div
            key={s.key}
            onMouseEnter={() => onHover(s.key)}
            onMouseLeave={() => onHover(null)}
            className={cn(
              "sys-tile cursor-default rounded-lg border bg-paper-deep/70 px-3 py-2.5 transition-colors duration-300",
              hovered === s.key ? "border-moss-deep/60 bg-moss-deep/[0.07]" : "border-line"
            )}
          >
            <div className="flex items-center gap-2">
              <s.Icon aria-hidden className="h-4 w-4 shrink-0 text-ink-soft" />
              <span className="truncate text-[13px] font-medium text-ink">{s.name}</span>
              <span
                className="sys-dot ml-auto h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: MOSS }}
              />
            </div>
            <p className="mt-1 pl-6 text-[12px] text-ink-soft">{s.cat}</p>
          </div>
        ))}
      </div>
      <p className="estate-line mt-4 font-mono text-[12px] uppercase tracking-[0.12em] text-ink-soft/70">
        ERP · mainframe · warehouse · lakehouse · CRM · workflow · HR · internal & external APIs · files
      </p>
    </div>
  );
}

function ModelPanel({
  hovered,
  onHover,
}: {
  hovered: SysKey | null;
  onHover: (k: SysKey | null) => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="obj-card overflow-hidden rounded-xl border border-line bg-paper-deep/70">
        <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
          <Network aria-hidden className="h-4 w-4 text-moss-deep" />
          <span className="font-display text-[16px] font-semibold text-ink">Shipment</span>
          <span className="ml-auto font-mono text-[12px] uppercase tracking-[0.1em] text-ink-soft">
            object type
          </span>
        </div>
        {MODEL.map((r, i) => (
          <div
            key={r.p}
            onMouseEnter={() => onHover(r.sys)}
            onMouseLeave={() => onHover(null)}
            className={cn(
              "obj-prop flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 transition-colors duration-300",
              i > 0 && "border-t border-line/70",
              hovered === r.sys && "bg-moss-deep/[0.08]"
            )}
          >
            <span className="w-28 text-[14px] font-medium text-ink">{r.p}</span>
            <span className="font-mono text-[12px] text-moss-deep">{r.t}</span>
            <span className="ml-auto flex min-w-0 flex-col items-end leading-tight">
              <SourceMark sys={r.sys} className="text-[12.5px]" />
              <span className="font-mono text-[12px] text-ink-soft">{r.bind}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="graph relative h-[220px] lg:h-auto lg:min-h-[240px]">
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {LINKS.map((l) => (
            <path
              key={l.name}
              className="g-edge text-moss-deep/70"
              d={`M27,50 C48,50 48,${l.y} 68,${l.y}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.25}
              vectorEffect="non-scaling-stroke"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={0}
            />
          ))}
        </svg>
        <span className="g-node absolute left-0 top-1/2 flex h-9 w-[27%] -translate-y-1/2 items-center justify-center rounded-lg border border-moss-deep/50 bg-moss-deep/10 text-[13px] font-semibold text-ink">
          Shipment
        </span>
        {LINKS.map((l) => (
          <span key={l.name}>
            <span
              className="g-node absolute left-[68%] flex h-8 w-[32%] items-center rounded-lg border border-line bg-paper-deep px-3 text-[12.5px] font-medium text-ink"
              style={{ top: `calc(${l.y}% - 16px)` }}
            >
              {l.name}
            </span>
            <span
              className="g-lbl absolute left-[47%] -translate-x-1/2 -translate-y-1/2 rounded bg-paper-deep px-1.5 font-mono text-[12px] text-moss-deep"
              style={{ top: `${(50 + l.y) / 2}%` }}
            >
              {l.edge}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function ResolvePanel({
  latencies,
  asking,
  onAsk,
  hovered,
  onHover,
}: {
  latencies: number[];
  asking: boolean;
  onAsk: () => void;
  hovered: SysKey | null;
  onHover: (k: SysKey | null) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="q-chip inline-flex items-center gap-2.5 rounded-full border border-line bg-paper-deep/70 px-4 py-2">
        <Bot aria-hidden className="h-4 w-4 text-moss-deep" />
        <span className="font-mono text-[13px] text-ink">agents.resolve(&quot;Shipment/SHP-20931&quot;)</span>
      </div>

      <div className="res-card overflow-hidden rounded-xl border border-line bg-paper-deep/70">
        <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
          <Network aria-hidden className="h-4 w-4 text-moss-deep" />
          <span className="font-display text-[15px] font-semibold text-ink">Shipment</span>
          <span className="font-mono text-[12px] text-ink-soft">SHP-20931</span>
          <span className="ml-auto flex items-center gap-1.5 text-[12px] text-moss-deep">
            <span className="h-1.5 w-1.5 rounded-full bg-moss-deep" /> resolved live
          </span>
        </div>

        <div className="relative">
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden h-full w-full sm:block"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {RESOLVED.map((r, i) => (
              <path
                key={r.k}
                className="res-line text-line"
                d={`M56,${10 + i * 20} L80,${10 + i * 20}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={0}
              />
            ))}
          </svg>

          {RESOLVED.map((r, i) => (
            <div
              key={r.k}
              onMouseEnter={() => onHover(r.sys)}
              onMouseLeave={() => onHover(null)}
              className={cn(
                "relative flex h-[52px] items-center gap-3 px-4 transition-colors duration-300",
                i > 0 && "border-t border-line/70",
                hovered === r.sys && "bg-moss-deep/[0.08]"
              )}
            >
              <span className="w-24 shrink-0 text-[12.5px] text-ink-soft">{r.k}</span>
              <span className="res-val flex min-w-0 items-center gap-2 text-[15px] font-medium text-ink">
                {r.warn && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />}
                <span className="truncate">{r.v}</span>
              </span>
              <span className="res-ms ml-auto hidden w-[24%] items-center justify-end gap-2 sm:flex">
                <span className="font-mono text-[12px] text-ink-soft">{latencies[i]} ms</span>
                <SourceMark sys={r.sys} className="text-[12px]" />
              </span>
              <span className="ml-auto flex items-center gap-2 sm:hidden">
                <SourceMark sys={r.sys} className="text-[12px]" />
                <span className="font-mono text-[12px] text-ink-soft">{latencies[i]} ms</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onAsk}
          disabled={asking}
          className="inline-flex items-center gap-2 rounded-md border border-line bg-paper-deep px-3.5 py-2 text-[13px] font-medium text-ink transition-colors hover:border-moss-deep/60 hover:text-moss-deep disabled:opacity-50"
        >
          <RefreshCw aria-hidden className={cn("h-3.5 w-3.5", asking && "animate-spin")} />
          {asking ? "Resolving…" : "Re-resolve"}
        </button>
      </div>
    </div>
  );
}

function ActPanel({
  state,
  commit,
  onRun,
}: {
  state: "idle" | "running" | "done";
  commit: { hash: string; time: string };
  onRun: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="act-form overflow-hidden rounded-xl border border-line bg-paper-deep/70">
        <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-4 py-2.5">
          <span className="rounded border border-moss-deep/40 bg-moss-deep/10 px-1.5 py-px font-mono text-[12px] uppercase tracking-[0.1em] text-moss-deep">
            action
          </span>
          <span className="text-[14px] font-semibold text-ink">Reassign carrier</span>
          <span className="ml-auto font-mono text-[12px] text-ink-soft">ontology.action</span>
        </div>
        <div className="grid gap-3 px-4 py-3 sm:grid-cols-3">
          {ACTION_PARAMS.map((f) => (
            <div key={f.k} className="min-w-0">
              <p className="text-[12px] uppercase tracking-[0.1em] text-ink-soft">{f.k}</p>
              <p className="mt-1 truncate rounded-md border border-line bg-black/20 px-2.5 py-1.5 text-[13px] text-ink">
                {f.v}
              </p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-line px-4 py-3">
          <button
            type="button"
            onClick={onRun}
            disabled={state === "running"}
            className="inline-flex items-center gap-2 rounded-md bg-moss-deep px-3.5 py-2 text-[13px] font-semibold text-paper-deep transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <Play aria-hidden className="h-3.5 w-3.5" />
            {state === "running" ? "Running…" : state === "done" ? "Run again" : "Run action"}
          </button>
          <span className="font-mono text-[12px] text-ink-soft">
            {state === "done" ? `committed ${commit.hash}` : state === "running" ? "validating → authorizing → write-back" : "awaiting run"}
          </span>
        </div>
      </div>

      <ArrowDown aria-hidden className="mx-auto h-4 w-4 text-ink-soft/60" />

      <div className="grid gap-3 sm:grid-cols-2">
        {GATES.map((g) => (
          <div
            key={g.t}
            className="gate flex items-center gap-3 rounded-lg border border-line bg-paper-deep/60 px-4 py-3"
          >
            <span className="gate-check flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-moss-deep/50 bg-moss-deep/10">
              <Check aria-hidden className="h-3.5 w-3.5 text-moss-deep" strokeWidth={3} />
            </span>
            <span>
              <span className="block text-[13.5px] font-semibold text-ink">{g.t}</span>
              <span className="block text-[12px] text-ink-soft">{g.s}</span>
            </span>
          </div>
        ))}
      </div>

      <ArrowDown aria-hidden className="mx-auto h-4 w-4 text-ink-soft/60" />

      <div className="wb flex flex-wrap items-center justify-center gap-3 rounded-lg border border-line bg-paper-deep/60 px-4 py-3">
        <span className="text-[12px] uppercase tracking-[0.1em] text-ink-soft">
          write-back · systems of record
        </span>
        {WRITE_BACK.map((k) => (
          <span
            key={k}
            className="wb-chip flex items-center gap-2 rounded-md border border-line bg-black/20 px-2.5 py-1.5"
          >
            <SourceMark sys={k} className="text-[12.5px] text-ink" />
          </span>
        ))}
      </div>

      <ArrowDown aria-hidden className="mx-auto h-4 w-4 text-ink-soft/60" />

      <div className="diff-card overflow-hidden rounded-xl border border-line bg-paper-deep/70">
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2.5 text-[12.5px]">
          <GitCommitHorizontal aria-hidden className="h-4 w-4 text-moss-deep" />
          <span className="font-mono text-ink">{commit.hash}</span>
          <span className="text-ink-soft">reassign_carrier</span>
          <span className="ml-auto flex items-center gap-1.5 text-ink-soft">
            <ShieldCheck aria-hidden className="h-3.5 w-3.5" /> maya.k · {commit.time}
          </span>
        </div>
        <div className="font-mono text-[13px] leading-relaxed">
          <div className="px-4 py-1 text-ink-soft">Shipment/SHP-20931</div>
          {DIFF.map((d) => (
            <div
              key={d.text}
              className={cn(
                "flex gap-3 px-4 py-1",
                d.sign === "-" ? "bg-red-500/10 text-red-300" : "bg-emerald-500/10 text-emerald-300"
              )}
            >
              <span aria-hidden>{d.sign}</span>
              <span>{d.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section                                                                   */
/* -------------------------------------------------------------------------- */

export function Problem() {
  const sectionRef = useRef<HTMLElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const spineFillRef = useRef<HTMLDivElement>(null);
  const stationEls = useRef<(HTMLDivElement | null)[]>([]);
  const entranceTls = useRef<(Timeline | null)[]>([]);
  const runTl = useRef<Timeline | null>(null);
  const askTl = useRef<Timeline | null>(null);
  const runningRef = useRef(false);
  const askingRef = useRef(false);

  const [activeBeat, setActiveBeat] = useState(0);
  const [hovered, setHovered] = useState<SysKey | null>(null);
  const [latencies, setLatencies] = useState<number[]>(RESOLVED.map((r) => r.ms));
  const [asking, setAsking] = useState(false);
  const [actionState, setActionState] = useState<"idle" | "running" | "done">("idle");
  const [commit, setCommit] = useState({ hash: "a91f3c2", time: "14:32" });

  /* ---- Beat 4: governed run; each run commits a new hash + timestamp ---- */
  const runAction = useCallback(() => {
    if (runningRef.current) return;
    const el = stationEls.current[3];
    if (!el) return;
    runningRef.current = true;
    setActionState("running");
    const q = gsap.utils.selector(el);
    runTl.current?.kill();

    const finish = () => {
      runningRef.current = false;
      setActionState("done");
      setCommit((c) => ({ hash: nextHash(c.hash), time: nowHM() }));
    };

    if (prefersReducedMotion()) {
      gsap.set(q(".gate-check"), { scale: 1, opacity: 1 });
      gsap.set(q(".gate"), { borderColor: MOSS_BORDER });
      gsap.set(q(".wb-chip"), { opacity: 1, borderColor: MOSS_BORDER });
      gsap.set(q(".diff-card"), { opacity: 1, y: 0 });
      finish();
      return;
    }

    const tl = gsap.timeline({ onComplete: finish });
    tl.to(q(".gate-check"), { scale: 1, opacity: 1, duration: 0.35, stagger: 0.3, ease: "back.out(2)" }, 0)
      .to(q(".gate"), { borderColor: MOSS_BORDER, duration: 0.3, stagger: 0.3 }, 0)
      .to(q(".wb-chip"), { opacity: 1, borderColor: MOSS_BORDER, duration: 0.35, stagger: 0.15 }, 0.75)
      .to(q(".diff-card"), { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 1.15);
    runTl.current = tl;
  }, []);

  /* ---- Beat 3: re-resolve against systems of record, fresh latencies ---- */
  const askAgain = useCallback(() => {
    if (askingRef.current) return;
    const el = stationEls.current[2];
    if (!el) return;
    askingRef.current = true;
    setAsking(true);
    setLatencies(jitter());
    const done = () => {
      askingRef.current = false;
      setAsking(false);
    };
    if (prefersReducedMotion()) {
      done();
      return;
    }
    const q = gsap.utils.selector(el);
    askTl.current?.kill();
    const tl = gsap.timeline({ onComplete: done });
    tl.fromTo(q(".res-val"), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.07 }, 0)
      .fromTo(q(".res-line"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.4, stagger: 0.07 }, 0)
      .fromTo(q(".res-ms"), { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.07 }, 0.15);
    askTl.current = tl;
  }, []);

  const jumpTo = useCallback((i: number) => {
    const el = stationEls.current[i];
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({ top: y, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, []);

  const replay = useCallback(() => {
    runTl.current?.kill();
    runningRef.current = false;
    setActionState("idle");
    entranceTls.current.forEach((tl) => tl?.restart());
    const el = flowRef.current;
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top: y, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }
  }, []);

  /* ---- GSAP: scrubbed spine, parallax, staged station entrances ---- */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) {
        setActionState("done");
        return;
      }

      gsap.fromTo(
        spineFillRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: flowRef.current, start: "top 70%", end: "bottom 60%", scrub: 0.5 },
        }
      );

      gsap.to(".ghost", {
        yPercent: 20,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true },
      });

      stationEls.current.forEach((el, i) => {
        if (!el) return;
        const q = gsap.utils.selector(el);
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none reverse" },
        });
        entranceTls.current[i] = tl;

        tl.from(q(".st-head"), { y: 14, opacity: 0, duration: 0.5, ease: "power2.out" }, 0);

        if (i === 0) {
          tl.from(q(".sys-tile"), { opacity: 0.35, y: 10, duration: 0.5, stagger: 0.05 }, 0.1)
            .from(q(".sys-dot"), { backgroundColor: DIM_DOT, duration: 0.4, stagger: 0.05 }, 0.35)
            .from(q(".estate-line"), { opacity: 0, duration: 0.4 }, 0.9);
        }

        if (i === 1) {
          tl.from(q(".obj-card"), { scale: 1.05, opacity: 0, transformOrigin: "50% 0%", duration: 0.8, ease: "power2.out" }, 0.1)
            .from(q(".obj-prop"), { x: -10, opacity: 0, duration: 0.4, stagger: 0.08 }, 0.4)
            .from(q(".graph"), { opacity: 0, y: 14, duration: 0.6 }, 0.8)
            .from(q(".g-edge"), { strokeDashoffset: 1, duration: 0.6, stagger: 0.12 }, 0.95)
            .from(q(".g-node, .g-lbl"), { opacity: 0, duration: 0.4, stagger: 0.08 }, 1.1);
        }

        if (i === 2) {
          tl.from(q(".q-chip"), { y: 10, opacity: 0, duration: 0.4 }, 0.1)
            .from(q(".res-card"), { y: 14, opacity: 0, duration: 0.5 }, 0.25)
            .from(q(".res-val"), { opacity: 0, y: 6, duration: 0.35, stagger: 0.09 }, 0.5)
            .from(q(".res-line"), { strokeDashoffset: 1, duration: 0.45, stagger: 0.09 }, 0.6)
            .from(q(".res-ms"), { opacity: 0, duration: 0.3, stagger: 0.09 }, 0.85);
        }

        if (i === 3) {
          tl.set(q(".gate-check"), { scale: 0, opacity: 0 }, 0)
            .set(q(".wb-chip"), { opacity: 0.4 }, 0)
            .set(q(".diff-card"), { opacity: 0, y: 16 }, 0)
            .from(q(".act-form"), { y: 14, opacity: 0, duration: 0.5 }, 0.1)
            .from(q(".gate"), { y: 10, opacity: 0, duration: 0.4, stagger: 0.15 }, 0.35)
            .from(q(".wb"), { opacity: 0, duration: 0.4 }, 0.75)
            .call(() => runAction(), [], 1.2);
        }
      });
    }, section);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = Number((e.target as HTMLElement).dataset.beat);
            if (!Number.isNaN(idx)) setActiveBeat(idx);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    stationEls.current.forEach((el) => el && io.observe(el));

    return () => {
      io.disconnect();
      ctx.revert();
      runTl.current?.kill();
      askTl.current?.kill();
      entranceTls.current = [];
    };
  }, [runAction]);

  return (
    <section
      ref={sectionRef}
      id="problem"
      aria-label="Siloed systems create problems, and how the ontology layer resolves them"
      className="relative scroll-mt-20 overflow-hidden border-t border-line bg-paper-deep/40 py-28 lg:py-32"
    >
      <style>{SCROLLBAR_CSS}</style>

      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/3 h-96 w-96 rounded-full bg-moss-deep/10 blur-[120px]"
      />
      <div
        aria-hidden
        className="ghost pointer-events-none absolute right-0 top-24 select-none font-display text-[9rem] font-semibold leading-none text-ink/[0.03] lg:text-[13rem]"
      >
        ONTOLOGY
      </div>

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="The problem"
          title={
            <>
              Siloed systems
              <br className="hidden sm:block" /> create problems
            </>
          }
          lead={PROBLEM_BODY}
        />

        <div className="mt-16 grid gap-12 lg:grid-cols-[230px_1fr] lg:gap-14">
          {/* Sticky stage navigator */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-moss-deep">
                The ontology layer
              </p>
              <ol className="mt-5 space-y-1">
                {BEATS.map((b, i) => (
                  <li key={b.n}>
                    <button
                      type="button"
                      onClick={() => jumpTo(i)}
                      aria-current={activeBeat === i ? "step" : undefined}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors duration-300",
                        activeBeat === i
                          ? "bg-moss-deep/10 text-ink"
                          : "text-ink-soft hover:bg-paper-deep hover:text-ink"
                      )}
                    >
                      <span
                        className={cn(
                          "font-mono text-[12px]",
                          activeBeat === i ? "text-moss-deep" : "text-ink-soft/70"
                        )}
                      >
                        {b.n}
                      </span>
                      <span className="text-[14px] font-medium">{b.nav}</span>
                      <span
                        className={cn(
                          "ml-auto h-1.5 w-1.5 rounded-full transition-colors duration-300",
                          activeBeat === i ? "bg-moss-deep" : "bg-line"
                        )}
                      />
                    </button>
                  </li>
                ))}
              </ol>
              <div className="mt-6 border-t border-line pt-5">
                <button
                  type="button"
                  onClick={replay}
                  className="inline-flex items-center gap-2 rounded-md border border-line bg-paper-deep px-3.5 py-2 text-[13px] font-medium text-ink transition-colors hover:border-moss-deep/60 hover:text-moss-deep"
                >
                  <RotateCcw aria-hidden className="h-3.5 w-3.5" />
                  Replay sequence
                </button>
                <p className="mt-3 text-[12px] leading-relaxed text-ink-soft">
                  Scroll to advance. Select a stage to jump. Hover a system to trace its lineage
                  through the model.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Flowchart */}
          <div ref={flowRef} className="relative">
            <div aria-hidden className="absolute bottom-2 left-[15px] top-2 w-px bg-line" />
            <div
              ref={spineFillRef}
              aria-hidden
              className="absolute bottom-2 left-[15px] top-2 w-px origin-top bg-moss-deep"
            />

            {BEATS.map((b, i) => (
              <div
                key={b.n}
                data-beat={i}
                ref={(el) => {
                  stationEls.current[i] = el;
                }}
                className={cn("relative flex gap-5 sm:gap-7", i < BEATS.length - 1 && "pb-14 sm:pb-16")}
              >
                <div className="flex w-8 shrink-0 flex-col items-center">
                  <button
                    type="button"
                    onClick={() => jumpTo(i)}
                    aria-label={`Jump to stage ${b.n}: ${b.nav}`}
                    className={cn(
                      "z-10 flex h-8 w-8 items-center justify-center rounded-full border bg-paper-deep font-mono text-[12px] transition-all duration-300",
                      activeBeat === i
                        ? "border-moss-deep text-moss-deep shadow-[0_0_0_4px_rgba(46,160,101,0.12)]"
                        : "border-line text-ink-soft hover:border-moss-deep/50 hover:text-ink"
                    )}
                  >
                    {b.n}
                  </button>
                  {i < BEATS.length - 1 && (
                    <span className="relative mt-3 w-px flex-1">
                      <span className="absolute left-2.5 top-6 rounded bg-paper-deep/90 px-0.5 font-mono text-[12px] uppercase tracking-[0.14em] text-ink-soft/60 [writing-mode:vertical-rl]">
                        {b.edge}
                      </span>
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="st-head">
                    <h3 className="font-display text-[19px] font-semibold leading-snug text-ink sm:text-[21px]">
                      {b.t}
                    </h3>
                    <p className="mt-2 max-w-[58ch] text-[14.5px] leading-relaxed text-ink-soft">{b.s}</p>
                  </div>
                  <div className="mt-6">
                    {i === 0 && <ConnectPanel hovered={hovered} onHover={setHovered} />}
                    {i === 1 && <ModelPanel hovered={hovered} onHover={setHovered} />}
                    {i === 2 && (
                      <ResolvePanel
                        latencies={latencies}
                        asking={asking}
                        onAsk={askAgain}
                        hovered={hovered}
                        onHover={setHovered}
                      />
                    )}
                    {i === 3 && <ActPanel state={actionState} commit={commit} onRun={runAction} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}