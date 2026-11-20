"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
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
  Server,
  ShieldCheck,
  Users,
  Warehouse,
  Webhook,
  Workflow,
} from "lucide-react";
import { SectionHeading } from "@/components/landing/section-heading";
import { cn } from "@/lib/utils";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* -------------------------------------------------------------------------- */
/*  Palette + copy (kept from the original section)                           */
/* -------------------------------------------------------------------------- */

const MOSS = "#2ea065";
const MOSS_BORDER = "rgba(46,160,101,0.55)";
const MOSS_BRIGHT = "rgba(70,201,135,0.9)";
const DIM_DOT = "#2a332e";

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
    s: "Olrien federates the estate in place. Each system of record stays authoritative. No pipelines to build, no second copy to reconcile.",
  },
  {
    n: "02",
    nav: "Model",
    edge: "canonical",
    t: "Create a model of your business",
    s: "Objects, properties and links are defined once, independent of any schema. A Shipment resolves the same whether its properties live in SAP, a warehouse or a carrier API  one operational language for every team and agent.",
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
    s: "Actions are named operations on the ontology. Each run validates against the model, enforces permissions, writes back to the systems of record, and commits an auditable diff  who changed what, and when.",
  },
];

const SCROLLBAR_CSS = `
html{scrollbar-color:#1d4a33 #0b0f0d;scrollbar-width:thin}
html::-webkit-scrollbar{width:10px}
html::-webkit-scrollbar-track{background:#0b0f0d}
html::-webkit-scrollbar-thumb{background:#1d4a33;border-radius:8px;border:2px solid #0b0f0d}
html::-webkit-scrollbar-thumb:hover{background:#2ea065}
`;

/* ---- media-query state (SSR-safe) ---- */
const subscribeMQ =
  (query: string) =>
  (onChange: () => void) => {
    if (typeof window === "undefined") return () => {};
    const mq = window.matchMedia(query);
    const handler = () => onChange();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  };
const mqMatches = (query: string) => () =>
  typeof window !== "undefined" && window.matchMedia(query).matches;
const mqServer = () => false;

const clamp01 = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t);
const edgeLen = new WeakMap<SVGPathElement, number>();

const nowHM = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
const nextHash = (h: string) =>
  ((parseInt(h, 16) + 0x1f37) % 0xfffffff).toString(16).padStart(7, "0");
const jitter = () => RESOLVED.map((r) => Math.max(6, r.ms + Math.floor(Math.random() * 13) - 4));

/* -------------------------------------------------------------------------- */
/*  The living map — spatial layout of the estate                             */
/* -------------------------------------------------------------------------- */

type Pt = { x: number; y: number };

/** Desktop coordinates (percent of the map world). Left band is kept clear for the HUD. */
const NODE_POS: Record<SysKey, Pt> = {
  sap: { x: 30, y: 20 },
  db2: { x: 36, y: 38 },
  oracle: { x: 42, y: 30 },
  mssql: { x: 52, y: 14 },
  teradata: { x: 72, y: 18 },
  databricks: { x: 84, y: 34 },
  salesforce: { x: 36, y: 64 },
  servicenow: { x: 34, y: 80 },
  workday: { x: 45, y: 88 },
  api: { x: 65, y: 77 },
  carrier: { x: 78, y: 63 },
  files: { x: 88, y: 80 },
};

/** Narrow-screen coordinates: full width usable, compressed toward the top. */
const NODE_POS_NARROW: Record<SysKey, Pt> = {
  sap: { x: 16, y: 12 },
  db2: { x: 14, y: 26 },
  oracle: { x: 28, y: 20 },
  mssql: { x: 46, y: 8 },
  teradata: { x: 68, y: 10 },
  databricks: { x: 84, y: 18 },
  salesforce: { x: 15, y: 38 },
  servicenow: { x: 28, y: 48 },
  workday: { x: 48, y: 42 },
  api: { x: 62, y: 50 },
  carrier: { x: 80, y: 36 },
  files: { x: 84, y: 50 },
};

const SHIPMENT_POS: Pt = { x: 56, y: 45 };
const SHIPMENT_POS_NARROW: Pt = { x: 50, y: 29 };

const OBJECT_NODES = [
  { key: "po", name: LINKS[0].name, edge: LINKS[0].edge, x: 43, y: 57 },
  { key: "facility", name: LINKS[1].name, edge: LINKS[1].edge, x: 69, y: 56 },
  { key: "supplier", name: LINKS[2].name, edge: LINKS[2].edge, x: 56, y: 68 },
] as const;

const DISTRICTS = [
  { name: "ERP & core", x: 35, y: 24 },
  { name: "Analytics", x: 76, y: 22 },
  { name: "Engagement", x: 34, y: 74 },
  { name: "External", x: 76, y: 72 },
] as const;

/** Legacy point-to-point integrations — the spaghetti the ontology replaces. */
const SPAGHETTI: [SysKey, SysKey][] = [
  ["sap", "teradata"],
  ["sap", "db2"],
  ["oracle", "databricks"],
  ["teradata", "databricks"],
  ["mssql", "oracle"],
  ["salesforce", "api"],
  ["servicenow", "workday"],
  ["carrier", "api"],
  ["files", "teradata"],
];

const AGENT_POS: Pt = { x: 56, y: 31 };
const LAYER_CHIP_POS: Pt = { x: 40, y: 51 };

/* ---- scrub choreography (0 → 1 across the pinned stage) ---- */
const T1 = 0.24; // estate -> ontology surfaces
const T2 = 0.48; // model -> live resolution
const T3 = 0.74; // resolution -> governed action
const PULSE_CFG = RESOLVED.map((_, i) => ({ start: 0.565 + i * 0.026, dur: 0.065 }));
const ACT_CFG = [
  { start: 0.785, dur: 0.055 },
  { start: 0.815, dur: 0.055 },
];
const PHASE_STOPS = [0.02, 0.3, 0.62, 0.94];

const curve = (a: Pt, b: Pt) =>
  `M ${a.x},${a.y} C ${(a.x + b.x) / 2},${a.y} ${(a.x + b.x) / 2},${b.y} ${b.x},${b.y}`;

/**
 * Screen-space path length. With vector-effect: non-scaling-stroke, Chrome
 * interprets stroke-dasharray in screen pixels, so the draw-in dash trick must
 * use the rendered length, not the user-space length.
 */
const screenLength = (p: SVGPathElement): number => {
  const L = p.getTotalLength();
  const ct = p.ownerSVGElement?.getScreenCTM?.();
  if (!ct) return L;
  const steps = 48;
  const first = p.getPointAtLength(0);
  let prev = new DOMPoint(first.x, first.y).matrixTransform(ct);
  let len = 0;
  for (let i = 1; i <= steps; i++) {
    const u = p.getPointAtLength((i / steps) * L);
    const s = new DOMPoint(u.x, u.y).matrixTransform(ct);
    len += Math.hypot(s.x - prev.x, s.y - prev.y);
    prev = s;
  }
  return Math.max(len, 2);
};

const placeDot = (path: SVGPathElement, dot: HTMLElement, t: number) => {
  if (t <= 0 || t >= 1) {
    dot.style.opacity = "0";
    return;
  }
  const pt = path.getPointAtLength(t * path.getTotalLength());
  dot.style.left = `${pt.x}%`;
  dot.style.top = `${pt.y}%`;
  dot.style.opacity = `${t < 0.15 ? t / 0.15 : t > 0.8 ? (1 - t) / 0.2 : 1}`;
};

/* -------------------------------------------------------------------------- */
/*  Shared marks                                                              */
/* -------------------------------------------------------------------------- */

function SourceMark({ sys, className }: { sys: SysKey; className?: string }) {
  const s = SYS[sys];
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1.5 text-ink-soft", className)}>
      <s.Icon aria-hidden className="h-3 w-3 shrink-0" />
      <span className="hidden truncate xl:inline">{s.name}</span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section — one map, four moves of the camera                               */
/* -------------------------------------------------------------------------- */

export function Problem() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const bindPathEls = useRef<(SVGPathElement | null)[]>([]);
  const linkPathEls = useRef<(SVGPathElement | null)[]>([]);
  const actPathEls = useRef<(SVGPathElement | null)[]>([]);
  const pulseDotEls = useRef<(HTMLSpanElement | null)[]>([]);
  const actDotEls = useRef<(HTMLSpanElement | null)[]>([]);
  const phaseRef = useRef(0);

  const [activePhase, setActivePhase] = useState(0);
  const reduced = useSyncExternalStore(
    subscribeMQ("(prefers-reduced-motion: reduce)"),
    mqMatches("(prefers-reduced-motion: reduce)"),
    mqServer
  );
  const narrow = useSyncExternalStore(
    subscribeMQ("(max-width: 639px)"),
    mqMatches("(max-width: 639px)"),
    mqServer
  );
  const [latencies, setLatencies] = useState<number[]>(RESOLVED.map((r) => r.ms));
  const [asking, setAsking] = useState(false);
  const [commit, setCommit] = useState({ hash: "a91f3c2", time: "14:32" });

  const pos = useCallback(
    (k: SysKey): Pt => (narrow ? NODE_POS_NARROW[k] : NODE_POS[k]),
    [narrow]
  );
  const shipmentPos = narrow ? SHIPMENT_POS_NARROW : SHIPMENT_POS;
  const agentPos = narrow ? { x: SHIPMENT_POS_NARROW.x, y: SHIPMENT_POS_NARROW.y - 11 } : AGENT_POS;

  /* ---- HUD phase tracking + pulse dots + lane draw-in on scrub ---- */
  const updatePhase = useCallback((p: number) => {
    const np = p < 0.26 ? 0 : p < 0.5 ? 1 : p < 0.76 ? 2 : 3;
    if (np !== phaseRef.current) {
      phaseRef.current = np;
      setActivePhase(np);
    }
  }, []);

  const updateDots = useCallback((p: number) => {
    /* ontology lanes draw in with move II, write-back beams with move IV;
       driven from scrub progress so resizes and reverse scrolling stay true */
    const meshes = [...bindPathEls.current, ...linkPathEls.current]
      .filter((el): el is SVGPathElement => !!el);
    meshes.forEach((el, i) => {
      const len = edgeLen.get(el) ?? el.getTotalLength();
      const t = clamp01((p - (0.26 + i * 0.006)) / 0.05);
      el.style.strokeDashoffset = `${len * (1 - t)}px`;
    });
    actPathEls.current.forEach((el, i) => {
      if (!el) return;
      const len = edgeLen.get(el) ?? el.getTotalLength();
      const t = clamp01((p - (0.75 + i * 0.015)) / 0.04);
      el.style.strokeDashoffset = `${len * (1 - t)}px`;
    });

    bindPathEls.current.forEach((path, i) => {
      const dot = pulseDotEls.current[i];
      if (path && dot) placeDot(path, dot, (p - PULSE_CFG[i].start) / PULSE_CFG[i].dur);
    });
    actPathEls.current.forEach((path, i) => {
      const dot = actDotEls.current[i];
      if (path && dot) placeDot(path, dot, (p - ACT_CFG[i].start) / ACT_CFG[i].dur);
    });
  }, []);

  /* ---- beat III: re-resolve against systems of record ---- */
  const askAgain = useCallback(() => {
    setLatencies(jitter());
    if (prefersReducedMotion()) return;
    const section = sectionRef.current;
    if (!section) return;
    const q = gsap.utils.selector(section);
    gsap.fromTo(
      q(".hud-panel-2 .res-row"),
      { opacity: 0, y: 5 },
      { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: "power1.out" }
    );
  }, []);

  /* ---- beat IV: replay the governed write-back ---- */
  const replayAction = useCallback(() => {
    setCommit((c) => ({ hash: nextHash(c.hash), time: nowHM() }));
    if (prefersReducedMotion()) return;
    const section = sectionRef.current;
    if (!section) return;
    const q = gsap.utils.selector(section);
    gsap.fromTo(
      q(".sys-tile[data-src='sap'], .sys-tile[data-src='oracle']"),
      { scale: 1 },
      { scale: 1.07, duration: 0.22, yoyo: true, repeat: 1, ease: "power2.out" }
    );
    gsap.fromTo(
      q(".wb-chip"),
      { opacity: 0.4 },
      { opacity: 1, duration: 0.3, stagger: 0.08 }
    );
  }, []);

  /* ---- phase ticks: click to jump the camera ---- */
  const goTo = useCallback((i: number) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (prefersReducedMotion()) {
      setActivePhase(i);
      return;
    }
    const top = wrap.getBoundingClientRect().top + window.scrollY;
    const travel = wrap.offsetHeight - window.innerHeight;
    window.scrollTo({
      top: top + PHASE_STOPS[i] * travel,
      behavior: "smooth",
    });
  }, []);

  /* ---- GSAP: entrance, ambient drift, scrubbed four-move camera ---- */
  useEffect(() => {
    const section = sectionRef.current;
    const wrap = wrapRef.current;
    const world = worldRef.current;
    if (!section || !wrap || !world) return;
    if (prefersReducedMotion()) return; // static composite driven by activePhase

    let sizeDash: () => void = () => {};

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(section);

      /* real-length dash math — pathLength normalization is unreliable with
         vector-effect: non-scaling-stroke, so measure each lane's rendered
         length and hide it behind a full-length dash offset until its move
         draws it in */
      const sizeDash = () => {
        q(".mesh-edge, .act-edge").forEach((p) => {
          const el = p as unknown as SVGPathElement;
          const len = screenLength(el);
          edgeLen.set(el, len);
          el.style.strokeDasharray = `${len}px`;
          const cur = parseFloat(el.style.strokeDashoffset);
          if (Number.isNaN(cur) || cur > len) el.style.strokeDashoffset = `${len}px`;
        });
      };
      sizeDash();
      ScrollTrigger.addEventListener("refreshInit", sizeDash);

      /* initial states (JS-driven visibility; classes are the no-JS fallback) */
      gsap.set(world, { transformOrigin: "50% 50%", scale: 1 });
      gsap.set(q(".hud-panel"), { opacity: 0, y: 12 });
      gsap.set(q(".hud-panel-0"), { opacity: 1, y: 0 });
      gsap.set(q(".lat-badge"), { opacity: 0, scale: 0.6 });
      gsap.set(q(".wb-chip"), { opacity: 0 });
      gsap.set(q(".obj-node"), { opacity: 0, scale: 0.85 });
      gsap.set(q(".obj-lbl"), { opacity: 0 });
      gsap.set(q(".layer-chip"), { opacity: 0 });
      gsap.set(q(".agent-mark"), { opacity: 0, scale: 0.8 });
      gsap.set(q(".substrate"), { opacity: 0 });
      gsap.set(q(".hairline"), { scaleX: 0 });

      /* entrance: the estate as it is */
      const enter = gsap.timeline({
        scrollTrigger: { trigger: wrap, start: "top 78%", toggleActions: "play none none none" },
      });
      enter
        .from(q(".sys-tile"), { opacity: 0, y: 12, scale: 0.96, duration: 0.5, ease: "power2.out", stagger: 0.045 }, 0)
        .from(q(".spaghetti"), { opacity: 0, duration: 0.7, ease: "power1.out", stagger: 0.05 }, 0.35)
        .from(q(".sys-dot"), { backgroundColor: DIM_DOT, duration: 0.4, stagger: 0.03 }, 0.5)
        .from(q(".district-lbl, .district-blob"), { opacity: 0, duration: 0.6 }, 0.55);

      /* ambient drift */
      q(".float-wrap").forEach((el, i) => {
        gsap.to(el, {
          y: i % 2 === 0 ? -5 : 5,
          duration: 2.6 + (i % 5) * 0.4,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          delay: 1.4,
        });
      });

      /* master scrub — four moves of the camera over one scene */
      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: wrap,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          onUpdate: (self) => {
            updatePhase(self.progress);
            updateDots(self.progress);
          },
        },
      });

      tl.to(q(".map-hint"), { opacity: 0, duration: 0.04 }, 0.02)
        .to(q(".hairline"), { scaleX: 1, duration: 0.9, ease: "none" }, 0.05)

        /* move I → II: the ontology layer surfaces beneath the estate */
        .to(world, { scale: 1.16, transformOrigin: "56% 45%", duration: 0.08 }, T1)
        .to(q(".spaghetti"), { opacity: 0.13, duration: 0.06 }, T1)
        .to(q(".substrate"), { opacity: 1, duration: 0.06 }, T1 + 0.01)
        .to(q(".obj-node"), { opacity: 1, scale: 1, duration: 0.05, stagger: 0.012, ease: "back.out(1.7)" }, T1 + 0.02)
        .to(q(".layer-chip"), { opacity: 1, duration: 0.04 }, T1 + 0.05)
        .to(q(".obj-lbl"), { opacity: 1, duration: 0.04, stagger: 0.01 }, T1 + 0.06)
        .to(q(".hud-panel-0"), { opacity: 0, y: -12, duration: 0.04 }, T1)
        .fromTo(q(".hud-panel-1"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.05 }, T1 + 0.04)

        /* move III: a query resolves live across the map */
        .to(world, { scale: 1.05, transformOrigin: "55% 44%", duration: 0.08 }, T2)
        .to(q(".hud-panel-1"), { opacity: 0, y: -12, duration: 0.04 }, T2)
        .fromTo(q(".hud-panel-2"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.05 }, T2 + 0.04)
        .to(q(".agent-mark"), { opacity: 1, scale: 1, duration: 0.04, ease: "back.out(1.7)" }, T2 + 0.03);

      /* latency badges pop as each pulse reaches its system of record */
      RESOLVED.forEach((r, i) => {
        const at = PULSE_CFG[i].start + PULSE_CFG[i].dur;
        tl.to(
          `.sys-tile[data-src="${r.sys}"]`,
          { borderColor: MOSS_BORDER, backgroundColor: "rgba(20,49,32,0.92)", duration: 0.025 },
          at - 0.02
        ).to(
          `.lat-badge[data-src="${r.sys}"]`,
          { opacity: 1, scale: 1, duration: 0.02, ease: "back.out(2)" },
          at
        );
      });

      tl
        /* move IV: governed action, write-back with an auditable diff */
        .to(world, { scale: 1.12, transformOrigin: "40% 30%", duration: 0.08 }, T3)
        .to(q(".hud-panel-2"), { opacity: 0, y: -12, duration: 0.04 }, T3)
        .fromTo(q(".hud-panel-3"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.05 }, T3 + 0.03)
        .to(q(".sys-tile[data-src='sap'], .sys-tile[data-src='oracle']"), {
          borderColor: MOSS_BORDER,
          backgroundColor: "rgba(23,56,37,0.95)",
          duration: 0.03,
        }, T3 + 0.04)
        .to(q(".wb-chip"), { opacity: 1, duration: 0.03, stagger: 0.02 }, T3 + 0.05)
        .fromTo(q(".diff-line"), { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.02, stagger: 0.014 }, T3 + 0.06)
        .fromTo(q(".commit-row"), { opacity: 0 }, { opacity: 1, duration: 0.03 }, T3 + 0.13);
    }, section);

    return () => {
      ScrollTrigger.removeEventListener("refreshInit", sizeDash);
      ctx.revert();
    };
  }, [updatePhase, updateDots]);

  return (
    <section
      ref={sectionRef}
      id="problem"
      aria-label="Siloed systems create problems, and how the ontology layer resolves them"
      className="relative scroll-mt-20 border-t border-line bg-paper-deep/40 pt-24 pb-16 lg:pt-32"
    >
      <style>{SCROLLBAR_CSS}</style>

      {/* Heading — original copy, kept verbatim */}
      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/4 h-80 w-80 rounded-full bg-moss-deep/10 blur-[110px]"
        />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
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
        </div>
      </div>

      {/* Pinned living map */}
      <div ref={wrapRef} className="relative mt-10 h-[400vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          {/* progress hairline */}
          <div
            aria-hidden
            className="hairline absolute left-0 top-0 z-30 h-0.5 w-full origin-left scale-x-0 bg-moss-deep/80"
            style={reduced ? { opacity: 0 } : undefined}
          />

          {/* mobile scrim so the HUD stays readable over the lower estate */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[46vh] bg-gradient-to-t from-paper-deep/95 via-paper-deep/55 to-transparent lg:hidden"
          />

          {/* ---- the world (camera target) ---- */}
          <div className="absolute inset-0 origin-[50%_24%] scale-[0.92] lg:origin-center lg:scale-100">
            <div ref={worldRef} className="absolute inset-0 will-change-transform" aria-hidden>
              {/* base dotted grid */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "radial-gradient(rgba(232,237,233,0.05) 1px, transparent 1.4px)",
                  backgroundSize: "30px 30px",
                }}
              />

              {/* districts */}
              {DISTRICTS.map((d) => (
                <div
                  key={d.name}
                  className="absolute"
                  style={{ left: `${d.x}%`, top: `${d.y}%`, transform: "translate(-50%, -50%)" }}
                >
                  <div className="district-blob h-[26vmin] w-[38vmin] rounded-full bg-ink/[0.03] blur-2xl" />
                  <span className="district-lbl absolute left-1/2 top-[58%] -translate-x-1/2 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.3em] text-ink-soft/40 sm:block hidden">
                    {d.name}
                  </span>
                </div>
              ))}

              {/* ontology substrate — the missing layer */}
              <div className="substrate absolute inset-0 opacity-0">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: "radial-gradient(rgba(46,160,101,0.16) 1px, transparent 1.4px)",
                    backgroundSize: "26px 26px",
                  }}
                />
                <div className="absolute left-[56%] top-[45%] h-[46vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-moss-deep/10 blur-[110px]" />
              </div>

              {/* edges */}
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {/* legacy point-to-point integrations */}
                {SPAGHETTI.map(([a, b], i) => (
                  <path
                    key={`sp-${i}`}
                    className="spaghetti"
                    d={curve(pos(a), pos(b))}
                    fill="none"
                    stroke="rgba(156,170,161,0.5)"
                    strokeWidth={1}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    opacity={reduced && activePhase >= 2 ? 0.12 : 0.5}
                  />
                ))}

                {/* bind lanes: Shipment -> systems of record (the resolve pulse rides these) */}
                {MODEL.map((m, i) => (
                  <path
                    key={`bind-${m.p}`}
                    ref={(el) => {
                      bindPathEls.current[i] = el;
                    }}
                    data-src={m.sys}
                    className="mesh-edge"
                    d={curve(shipmentPos, pos(m.sys))}
                    fill="none"
                    stroke="rgba(46,160,101,0.5)"
                    strokeWidth={1.1}
                    vectorEffect="non-scaling-stroke"
                    style={reduced ? { opacity: activePhase >= 2 ? 1 : 0 } : undefined}
                  />
                ))}

                {/* ontology link edges */}
                {!narrow &&
                  OBJECT_NODES.map((o, li) => (
                    <path
                      key={`link-${o.key}`}
                      ref={(el) => {
                        linkPathEls.current[li] = el;
                      }}
                      className="mesh-edge"
                      d={curve(SHIPMENT_POS, { x: o.x, y: o.y })}
                      fill="none"
                      stroke="rgba(46,160,101,0.75)"
                      strokeWidth={1.5}
                      vectorEffect="non-scaling-stroke"
                      style={reduced ? { opacity: activePhase >= 2 ? 1 : 0 } : undefined}
                    />
                  ))}

                {/* governed write-back beams */}
                {WRITE_BACK.map((k, i) => (
                  <path
                    key={`act-${k}`}
                    ref={(el) => {
                      actPathEls.current[i] = el;
                    }}
                    className="act-edge"
                    d={curve(shipmentPos, pos(k))}
                    fill="none"
                    stroke={MOSS_BRIGHT}
                    strokeWidth={1.8}
                    vectorEffect="non-scaling-stroke"
                    style={reduced ? { opacity: activePhase >= 4 ? 1 : 0 } : undefined}
                  />
                ))}
              </svg>

              {/* ontology link labels */}
              {!narrow &&
                OBJECT_NODES.map((o) => (
                  <span
                    key={`lbl-${o.key}`}
                    className="obj-lbl pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded border border-moss-deep/25 bg-paper-deep/80 px-1 py-px font-mono text-[9px] text-moss-deep opacity-0"
                    style={{ left: `${(SHIPMENT_POS.x + o.x) / 2}%`, top: `${(SHIPMENT_POS.y + o.y) / 2}%` }}
                  >
                    {o.edge}
                  </span>
                ))}

              {/* layer chip */}
              {!narrow && (
                <span
                  className="layer-chip pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-moss-deep/30 bg-paper-deep/75 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-moss-deep opacity-0 backdrop-blur-sm"
                  style={{ left: `${LAYER_CHIP_POS.x}%`, top: `${LAYER_CHIP_POS.y}%` }}
                >
                  ontology · canonical layer
                </span>
              )}

              {/* system nodes */}
              {SYSTEMS.map((s) => {
                const p = pos(s.key);
                const latIdx = RESOLVED.findIndex((r) => r.sys === s.key);
                const isWB = WRITE_BACK.includes(s.key);
                return (
                  <div
                    key={s.key}
                    className="absolute"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -50%)" }}
                  >
                    <div className="float-wrap relative">
                      <div
                        data-src={s.key}
                        className={cn(
                          "sys-tile relative flex w-max flex-col gap-0.5 rounded-lg border bg-paper-deep/85 px-2.5 py-2 backdrop-blur-sm sm:px-3 sm:py-2.5",
                          reduced && activePhase >= 3 && latIdx >= 0
                            ? "border-moss-deep/60 bg-moss-deep/10"
                            : "border-line",
                          reduced && activePhase >= 4 && isWB && "border-moss-deep/70"
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          <s.Icon aria-hidden className="h-3.5 w-3.5 shrink-0 text-ink-soft" />
                          <span className="whitespace-nowrap text-[11px] font-medium text-ink sm:text-[12.5px]">
                            {s.name}
                          </span>
                        </div>
                        <span className="hidden text-[10px] leading-none text-ink-soft sm:block">
                          {s.cat}
                        </span>
                        <span
                          aria-hidden
                          className="sys-dot absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: MOSS }}
                        />
                      </div>

                      {latIdx >= 0 && (
                        <span
                          data-src={s.key}
                          className="lat-badge pointer-events-none absolute -right-2 -top-2.5 rounded-md border border-moss-deep/50 bg-paper-deep px-1.5 py-0.5 font-mono text-[10px] leading-none text-moss-deep opacity-0 shadow-lg"
                          style={reduced ? { opacity: activePhase >= 3 ? 1 : 0, transform: "none" } : undefined}
                        >
                          {latencies[latIdx]} ms
                        </span>
                      )}

                      {isWB && (
                        <span
                          className="wb-chip pointer-events-none absolute -bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-moss-deep/50 bg-moss-deep/15 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-moss-deep opacity-0"
                          style={reduced ? { opacity: activePhase >= 4 ? 1 : 0 } : undefined}
                        >
                          write-back
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* the canonical object */}
              <div
                className="absolute"
                style={{
                  left: `${shipmentPos.x}%`,
                  top: `${shipmentPos.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="float-wrap">
                  <div
                    className="obj-node flex items-center gap-2 rounded-xl border border-moss-deep/60 bg-moss-deep/15 px-3.5 py-2.5 opacity-0 shadow-[0_0_30px_rgba(46,160,101,0.15)] backdrop-blur-sm"
                    style={reduced ? { opacity: activePhase >= 2 ? 1 : 0 } : undefined}
                  >
                    <Network aria-hidden className="h-4 w-4 text-moss-deep" />
                    <span className="font-display text-[14px] font-semibold text-ink">Shipment</span>
                    <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-moss-deep">
                      object
                    </span>
                  </div>
                </div>
              </div>

              {/* linked objects */}
              {!narrow &&
                OBJECT_NODES.map((o) => (
                  <div
                    key={o.key}
                    className="absolute"
                    style={{ left: `${o.x}%`, top: `${o.y}%`, transform: "translate(-50%, -50%)" }}
                  >
                    <div className="float-wrap">
                      <div
                        className="obj-node flex items-center gap-1.5 rounded-lg border border-moss-deep/35 bg-paper-deep/85 px-2.5 py-1.5 opacity-0 backdrop-blur-sm"
                        style={reduced ? { opacity: activePhase >= 2 ? 1 : 0 } : undefined}
                      >
                        <Network aria-hidden className="h-3 w-3 text-moss-deep" />
                        <span className="whitespace-nowrap text-[11px] font-medium text-ink sm:text-[11.5px]">
                          {o.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

              {/* agent marker — the query origin */}
              <span
                className="agent-mark pointer-events-none absolute z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-moss-deep/50 bg-paper-deep/90 opacity-0 shadow-[0_0_18px_rgba(46,160,101,0.25)]"
                style={{ left: `${agentPos.x}%`, top: `${agentPos.y}%` }}
              >
                <Bot aria-hidden className="h-3.5 w-3.5 text-moss-deep" />
              </span>

              {/* resolve pulse dots */}
              {RESOLVED.map((r, i) => (
                <span
                  key={`dot-${r.k}`}
                  ref={(el) => {
                    pulseDotEls.current[i] = el;
                  }}
                  className="pulse-dot pointer-events-none absolute z-10 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#46c987] shadow-[0_0_10px_rgba(70,201,135,0.9)]"
                  style={{ left: "0%", top: "0%", opacity: 0 }}
                />
              ))}

              {/* write-back dots */}
              {WRITE_BACK.map((k, i) => (
                <span
                  key={`adot-${k}`}
                  ref={(el) => {
                    actDotEls.current[i] = el;
                  }}
                  className="act-dot pointer-events-none absolute z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5adf9a] shadow-[0_0_12px_rgba(90,223,154,0.9)]"
                  style={{ left: "0%", top: "0%", opacity: 0 }}
                />
              ))}
            </div>
          </div>

          {/* ---- HUD: the narrative panel (crossfades per phase) ---- */}
          <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 lg:inset-x-auto lg:bottom-auto lg:left-8 lg:top-1/2 lg:w-[372px] lg:-translate-y-1/2">
            <p className="mb-2 hidden font-mono text-[10px] uppercase tracking-[0.2em] text-moss-deep lg:block">
              The ontology layer
            </p>
            <div className="grid">
              {[0, 1, 2, 3].map((i) => {
                const b = BEATS[i];
                return (
                  <div
                    key={b.n}
                    className={cn(
                      "hud-panel pointer-events-auto self-start rounded-xl border border-line bg-paper-deep/85 p-4 shadow-2xl backdrop-blur-md [grid-area:1/1] sm:p-5",
                      `hud-panel-${i}`,
                      "opacity-0"
                    )}
                    style={reduced ? { opacity: activePhase === i ? 1 : 0, transform: "none" } : undefined}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] tracking-[0.18em] text-moss-deep">
                        {b.n} · {b.nav.toUpperCase()}
                      </span>
                      <span className="ml-auto rounded border border-moss-deep/40 bg-moss-deep/10 px-1.5 py-px font-mono text-[9.5px] uppercase tracking-[0.12em] text-moss-deep">
                        {b.edge}
                      </span>
                    </div>
                    <h3 className="mt-2.5 font-display text-[17px] font-semibold leading-snug text-ink sm:text-[18px]">
                      {b.t}
                    </h3>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">{b.s}</p>

                    {i === 0 && (
                      <>
                        <p className="mt-3 font-mono text-[9.5px] uppercase leading-relaxed tracking-[0.12em] text-ink-soft/70">
                          ERP · mainframe · warehouse · lakehouse · CRM · workflow · HR · internal &amp;
                          external APIs · files
                        </p>
                        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-line/70 pt-2.5">
                          <span className="flex items-center gap-1.5 text-[10.5px] text-amber-300/90">
                            <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                            copies drift · dependencies stay hidden
                          </span>
                          <span className="font-mono text-[10px] text-ink-soft">12 systems · 0 migrations</span>
                        </div>
                      </>
                    )}

                    {i === 1 && (
                      <div className="mt-3 divide-y divide-line/70 rounded-lg border border-line bg-black/25">
                        {MODEL.map((m) => (
                          <div key={m.p} className="px-2.5 py-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[12px] font-medium text-ink">{m.p}</span>
                              <span className="font-mono text-[9.5px] text-moss-deep">{m.t}</span>
                              <span className="ml-auto">
                                <SourceMark sys={m.sys} className="text-[10px]" />
                              </span>
                            </div>
                            <p className="mt-0.5 font-mono text-[9.5px] text-ink-soft">{m.bind}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {i === 2 && (
                      <>
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-line bg-black/25 px-3 py-1.5">
                          <Bot aria-hidden className="h-3.5 w-3.5 text-moss-deep" />
                          <span className="font-mono text-[10.5px] text-ink">
                            agents.resolve(&quot;Shipment/SHP-20931&quot;)
                          </span>
                        </div>
                        <div className="mt-2.5 divide-y divide-line/70 rounded-lg border border-line bg-black/25">
                          {RESOLVED.map((r, ri) => (
                            <div key={r.k} className="res-row flex items-center gap-2 px-2.5 py-1.5">
                              <span className="w-[68px] shrink-0 text-[10px] text-ink-soft">{r.k}</span>
                              <span className="flex min-w-0 items-center gap-1.5 text-[12px] font-medium text-ink">
                                {r.warn && (
                                  <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                                )}
                                <span className="truncate">{r.v}</span>
                              </span>
                              <span className="ml-auto flex shrink-0 items-center gap-2">
                                <SourceMark sys={r.sys} className="text-[10px]" />
                                <span className="font-mono text-[10px] text-moss-deep">{latencies[ri]} ms</span>
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2.5 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-[10.5px] text-moss-deep">
                            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-moss-deep" /> resolved live
                          </span>
                          <button
                            type="button"
                            onClick={askAgain}
                            disabled={asking}
                            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-paper-deep px-2.5 py-1 text-[11px] font-medium text-ink transition-colors hover:border-moss-deep/60 hover:text-moss-deep disabled:opacity-50"
                          >
                            <RefreshCw aria-hidden className={cn("h-3 w-3", asking && "animate-spin")} />
                            {asking ? "Resolving…" : "Re-resolve"}
                          </button>
                        </div>
                      </>
                    )}

                    {i === 3 && (
                      <>
                        <div className="mt-3 rounded-lg border border-line bg-black/25 px-2.5 py-2">
                          <div className="flex items-center gap-2">
                            <span className="rounded border border-moss-deep/40 bg-moss-deep/10 px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.12em] text-moss-deep">
                              action
                            </span>
                            <span className="text-[12.5px] font-semibold text-ink">Reassign carrier</span>
                            <button
                              type="button"
                              onClick={replayAction}
                              className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-line bg-paper-deep px-2.5 py-1 text-[11px] font-medium text-ink transition-colors hover:border-moss-deep/60 hover:text-moss-deep"
                            >
                              <Play aria-hidden className="h-3 w-3" /> Run
                            </button>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {ACTION_PARAMS.map((f) => (
                              <span
                                key={f.k}
                                className="rounded border border-line bg-paper-deep px-1.5 py-0.5 font-mono text-[9.5px] text-ink-soft"
                              >
                                {f.k}: <span className="text-ink">{f.v}</span>
                              </span>
                            ))}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                            {GATES.map((g) => (
                              <span key={g.t} className="flex items-center gap-1.5 text-[10px] text-ink-soft">
                                <Check aria-hidden className="h-3 w-3 text-moss-deep" strokeWidth={3} />
                                {g.t} — {g.s}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mt-2 overflow-hidden rounded-lg border border-line bg-black/25 font-mono text-[10.5px]">
                          <div className="commit-row flex items-center gap-2 border-b border-line/70 px-2.5 py-1.5 text-ink-soft">
                            <GitCommitHorizontal aria-hidden className="h-3.5 w-3.5 shrink-0 text-moss-deep" />
                            <span className="text-ink">{commit.hash}</span>
                            <span className="hidden truncate sm:inline">reassign_carrier</span>
                            <span className="ml-auto flex shrink-0 items-center gap-1">
                              <ShieldCheck aria-hidden className="h-3 w-3" /> maya.k · {commit.time}
                            </span>
                          </div>
                          <div className="px-2.5 py-1 text-ink-soft">Shipment/SHP-20931</div>
                          {DIFF.map((d) => (
                            <div
                              key={d.text}
                              className={cn(
                                "diff-line flex gap-2 px-2.5 py-0.5",
                                d.sign === "-"
                                  ? "bg-red-500/10 text-red-300/90"
                                  : "bg-emerald-500/10 text-emerald-300/90"
                              )}
                            >
                              <span aria-hidden>{d.sign}</span>
                              <span>{d.text}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ---- phase ticks ---- */}
          <div className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-end gap-0.5 md:flex sm:right-6">
            {BEATS.map((b, i) => (
              <button
                key={b.n}
                type="button"
                onClick={() => goTo(i)}
                aria-current={activePhase === i ? "step" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors duration-300",
                  activePhase === i ? "text-ink" : "text-ink-soft/60 hover:text-ink"
                )}
              >
                <span className="text-[11px] font-medium uppercase tracking-[0.16em]">{b.nav}</span>
                <span
                  className={cn(
                    "font-mono text-[10px]",
                    activePhase === i ? "text-moss-deep" : "text-ink-soft/50"
                  )}
                >
                  {b.n}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors duration-300",
                    activePhase === i ? "bg-moss-deep" : "bg-line"
                  )}
                />
              </button>
            ))}
          </div>

          {/* scroll hint */}
          <div
            className="map-hint pointer-events-none absolute bottom-5 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft/70 md:flex"
            style={reduced ? { opacity: 0 } : undefined}
          >
            <ArrowDown aria-hidden className="h-3 w-3 animate-bounce text-moss-deep" />
            scroll to move through the map
          </div>
        </div>
      </div>
    </section>
  );
}