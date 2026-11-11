"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { scrollToId } from "@/lib/scroll";
import { cn } from "@/lib/utils";

const SECTIONS: { id: string; label: string }[] = [
  { id: "top", label: "Top" },
  { id: "problem", label: "Problem" },
  { id: "product", label: "Ontology" },
  { id: "endpoint", label: "Endpoint" },
  { id: "deployment", label: "Deploy" },
  { id: "writes", label: "Writes" },
  { id: "scenario", label: "Scenario" },
  { id: "choices", label: "Principles" },
  { id: "compare", label: "Position" },
  { id: "roadmap", label: "Roadmap" },
  { id: "faq", label: "FAQ" },
  { id: "source", label: "Source" },
];

/**
 * Fixed right-edge rail: a hairline that fills with page progress and a dot
 * per section. The active dot grows and shows its mono label. Desktop only.
 */
export function ScrollRail() {
  const [active, setActive] = useState("top");
  const fillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Page progress fill
      gsap.to(fillRef.current, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.4,
        },
      });
    });
    const st = ctx; // keep reference for cleanup

    // Active section: whichever spans the 42% viewport line (deterministic,
    // including inside pinned scenes where IO ordering is unreliable).
    let ticking = false;
    const measure = () => {
      ticking = false;
      const anchor = window.innerHeight * 0.42;
      let current = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= anchor) current = s.id;
      }
      // below the last section's top, keep the last one
      setActive(current);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(measure);
      }
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      st.revert();
    };
  }, []);

  return (
    <nav
      aria-label="Section progress"
      className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 xl:block"
    >
      <div className="relative flex flex-col items-end gap-3.5">
        <span
          aria-hidden
          className="absolute right-[3.5px] top-1 h-[calc(100%-8px)] w-px bg-line"
        />
        <span
          aria-hidden
          ref={fillRef}
          className="absolute right-[3.5px] top-1 h-[calc(100%-8px)] w-px origin-top scale-y-0 bg-moss"
        />
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => scrollToId(`#${s.id}`)}
            aria-label={`Go to ${s.label}`}
            aria-current={active === s.id ? "true" : undefined}
            className="group flex items-center gap-2.5"
          >
            <span
              className={cn(
                "font-mono text-[10px] uppercase tracking-[0.18em] text-moss-deep opacity-0 transition-all duration-300 group-hover:opacity-100",
                active === s.id && "opacity-100"
              )}
            >
              {s.label}
            </span>
            <span
              className={cn(
                "block rounded-full border border-line-strong bg-paper transition-all duration-300",
                active === s.id
                  ? "h-2.5 w-2.5 border-moss bg-moss"
                  : "h-[7px] w-[7px] group-hover:border-moss"
              )}
            />
          </button>
        ))}
      </div>
    </nav>
  );
}
