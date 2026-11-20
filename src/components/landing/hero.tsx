"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { ArrowDown, Mail } from "lucide-react";
import { AnimText } from "@/components/landing/animated-text";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { scrollToId } from "@/lib/scroll";

const STATS: { value: string; label: string; sub: string }[] = [
  {
    value: "Agents",
    label: "Standalone AI Agents",
    sub: "The finite nature of an AI context window is not, in itself, the source of the failure. The main challenge lies in how data is handled and represented: when enterprise-scale data arrives fragmented, noisy, and without shared structure, even a capable agent cannot reliably discern what is relevant, current, or authoritative.",
  },
  {
    value: "Humans",
    label: "Unaided Humans",
    sub: "Human short-term memory is, in effect, our own context window: finite and easily saturated. Yet that limit is not what undermines their work. What undermines it is how data is handled and represented: scattered across systems, inconsistent in form, and silent on what is authoritative. Faced with this, people either stall because they cannot verify what is true, or act on a flawed assumption with real consequences.",
  },

  {
    value: "Solution",
    label: "How an ontology fixes this problem",
    sub: "An ontology builds a digital twin of your company: one record per object, explicit links, governed actions. Humans and agents share one truth, and can simulate changes and forecast their consequences before acting.",
  },
];

// The closing line of each item is the headline; the rest is the supporting text.
const PUNCHLINES = [
  "Most AI agents fail in production",
  "Humans are also overwhelmed by vast quantities of disorganized data.",
  "The same objects, the same actions, and a single shared truth.",
];

const KEYWORDS = new Set([
  "context", "supplier", "lot", "aircraft", "quarantine", "record",
  "objects", "actions", "links", "hallucinate", "hallucinates", "hesitate",
]);
const isKey = (w: string) => KEYWORDS.has(w.toLowerCase().replace(/[^a-z]/g, ""));

const N = STATS.length;
const D = 2.8; // timeline units per beat

function Words({ text, className }: { text: string; className: string }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <Fragment key={i}>
          <span className={`${className} ${isKey(w) ? "text-moss" : ""}`}>{w}</span>{" "}
        </Fragment>
      ))}
    </>
  );
}

export function Hero() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const stRef = useRef<{ start: number; end: number } | null>(null);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      type SubscribeResponse = { ok: boolean; already?: boolean; error?: string };
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company: "" }),
      });
      const data = (await res.json()) as SubscribeResponse;
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      setSubmitted(true);
      setLoading(false);
      setTimeout(() => setSubmitted(false), 3000);
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  };
  const totalRef = useRef(1);
  const [idx, setIdx] = useState(0);

  // Load-in
  useEffect(() => {
    const el = rootRef.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(".hero-badge", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6 }, 0.1)
        .fromTo(".hero-sub", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 0.8)
        .fromTo(".hero-cta", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 }, 1.0)
        .fromTo(".hero-scroll", { opacity: 0 }, { opacity: 1, duration: 0.6 }, 1.5);

      gsap.to(".hero-grid", {
        yPercent: 14,
        ease: "none",
        scrollTrigger: { trigger: ".hero-top", start: "top top", end: "bottom top", scrub: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  // Scrolling "writes" the argument: pinned on desktop, plain text elsewhere
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const stage = stageRef.current;
      if (!stage) return;
      const beats = gsap.utils.toArray<HTMLElement>(".ex-beat", stage);
      const total = (N - 1) * D + 2.8;
      totalRef.current = total;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: () => "+=" + total * window.innerHeight * 0.4,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            gsap.set(".ex-bar", { scaleY: self.progress });
            setIdx(Math.min(N - 1, Math.floor((self.progress * total) / D + 0.15)));
          },
        },
      });
      stRef.current = tl.scrollTrigger ?? null;

      beats.forEach((beat, i) => {
        const t0 = i * D;
        const punch = beat.querySelectorAll(".ex-pw");
        const body = beat.querySelectorAll(".ex-bw");

        if (i > 0) tl.fromTo(beat, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, t0);
        tl.fromTo(
          punch,
          { opacity: 0.1, y: 16 },
          { opacity: 1, y: 0, duration: 0.35, stagger: 0.09, ease: "power2.out" },
          t0
        )
          .fromTo(body, { opacity: 0.14 }, { opacity: 1, duration: 0.2, stagger: 1.25 / body.length }, t0 + 0.6);

        if (i < N - 1) {
          tl.to(beat, { autoAlpha: 0, y: -28, duration: 0.45, ease: "power2.in" }, t0 + D - 0.45);
        }
      });

      return () => {
        stRef.current = null;
        gsap.set(".ex-bar", { clearProps: "transform" });
      };
    });
    return () => mm.revert();
  }, []);

  const goTo = (i: number) => {
    const st = stRef.current;
    if (st) {
      const p = (i * D + 2.2) / totalRef.current;
      window.scrollTo({ top: st.start + Math.min(p, 1) * (st.end - st.start), behavior: "smooth" });
    } else {
      stageRef.current?.querySelectorAll(".ex-beat")[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div ref={rootRef}>
      {/* Hero */}
      <section
        id="top"
        aria-label="Introduction"
        className="hero-top relative overflow-hidden pt-[160px] pb-28 sm:pt-[200px] sm:pb-36 lg:pb-44"
      >
        <div aria-hidden className="hero-grid grid-bg mask-fade-radial absolute inset-0 -z-10" />
        <div
          aria-hidden
          className="absolute left-1/2 top-[-200px] -z-10 h-[520px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(34,138,82,0.14),transparent)]"
        />
      
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <AnimText
              as="h1"
              type="chars"
              mount
              delay={0.25}
              className="font-display text-[2.9rem] font-medium leading-[1.02] tracking-[-0.04em] text-ink text-balance sm:text-[4.4rem] lg:text-[5.4rem]"
            >
              The ontology-driven operating system for companies
            </AnimText>
      
            <p className="hero-sub mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-ink-soft sm:text-xl">
              Give people and AI agents a shared, governed view of your business to
              understand what’s happening, decide what to do, and act on it.
            </p>
      
            <form
              onSubmit={handleWaitlistSubmit}
              className="hero-cta mt-10 flex h-14 w-full max-w-md items-center rounded-full border border-line-strong bg-background/60 p-1.5 backdrop-blur transition-shadow focus-within:ring-2 focus-within:ring-ink/40"
            >
              {/* Honeypot: hidden field to catch bots */}
              <input
                name="company"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}
              />
              <label htmlFor="hero-email" className="sr-only">Work email</label>
              <input
                id="hero-email"
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitted}
                className="h-full min-w-0 flex-1 bg-transparent px-4 text-[15px] text-ink placeholder:text-ink-soft focus:outline-none"
              />
              <button
                type="submit"
                disabled={submitted || !email || loading}
                className="inline-flex h-full shrink-0 items-center gap-2 rounded-full bg-ink px-5 text-[15px] font-medium text-background transition-colors hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                {submitted ? "You’re on the list" : loading ? <><Mail className="h-4 w-4" /> Joining…</> : <><Mail className="h-4 w-4" /> Join waitlist</>}
              </button>
            </form>
      
            {error && (
              <p className="mt-3 min-h-5 text-sm text-destructive" aria-live="polite">
                {error}
              </p>
            )}
            <p aria-live="polite" className="mt-3 min-h-5 text-sm text-ink-soft">
              {submitted
                ? "Thanks. We’ll email you when early access opens."
                : "We’ll only email you when early access opens."}
            </p>
      
            <button
              onClick={() => scrollToId("#why")}
              className="hero-cta group mt-5 inline-flex items-center gap-2 rounded-full py-1 text-[15px] font-medium text-ink underline decoration-line-strong decoration-1 underline-offset-[6px] transition-colors hover:decoration-moss focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-moss"
            >
              See why context breaks
              <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5 motion-reduce:transition-none" />
            </button>
          </div>
        </div>
      </section>

      {/* The argument, written as you scroll */}
      <section
        id="why"
        ref={stageRef}
        aria-label="Why an ontology matters"
        className="relative md:motion-safe:flex md:motion-safe:h-screen md:motion-safe:items-center md:motion-safe:overflow-hidden"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 sm:px-8 md:motion-safe:grid-cols-[170px_1fr] md:motion-safe:py-0 lg:pr-24">
          {/* Where you are */}
          <div className="hidden md:motion-safe:block">
            <div className="relative flex flex-col gap-6 pl-5">
              <span aria-hidden className="absolute bottom-1 left-0 top-1 w-px bg-line" />
              <span
                aria-hidden
                className="ex-bar absolute bottom-1 left-0 top-1 w-px origin-top scale-y-0 bg-moss"
              />
              {STATS.map((t, i) => (
                <button
                  key={t.value}
                  onClick={() => goTo(i)}
                  aria-label={`Go to ${t.label}`}
                  aria-current={idx === i}
                  className={`text-left font-display text-lg font-medium tracking-tight transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-moss ${
                    idx === i ? "text-ink" : "text-muted-foreground hover:text-ink-soft"
                  }`}
                >
                  {t.value}
                </button>
              ))}
            </div>
          </div>

          {/* Beats share one grid cell on desktop; they stack as plain text elsewhere */}
          <div className="flex flex-col gap-20 md:motion-safe:grid md:motion-safe:gap-0">
            {STATS.map((s, i) => {
              const punch = PUNCHLINES[i];
              return (
                <article
                  key={s.value}
                  className={`ex-beat md:motion-safe:[grid-area:1/1] ${i > 0 ? "md:motion-safe:invisible" : ""}`}
                >
                  <p className="text-[13px] font-semibold text-moss">{s.label}</p>
                  <h2 className="mt-5 max-w-3xl font-display text-[2rem] font-medium leading-[1.05] tracking-[-0.035em] text-ink text-balance sm:text-5xl lg:text-[3.6rem]">
                    <Words text={punch} className="ex-pw inline-block" />
                  </h2>
                  <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-soft lg:text-xl lg:leading-[1.6]">
                    <Words text={s.sub.replace(punch, "").trim()} className="ex-bw" />
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
