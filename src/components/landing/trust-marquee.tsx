"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const PHRASES = [
  "one door in",
  "one log out",
  "open core",
  "self-hosted",
  "read-only first",
  "bring your own key",
  "ontology versioned in git",
  "pay once, own it",
  "mcp-native",
  "no per-seat tax",
];

function MarqueeRow({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div
      aria-hidden={ariaHidden}
      className="flex shrink-0 items-center gap-10 pr-10"
    >
      {PHRASES.map((p) => (
        <span
          key={p}
          className="flex items-center gap-10 whitespace-nowrap font-mono text-[11.5px] uppercase tracking-[0.22em] text-muted-foreground"
        >
          {p}
          <span aria-hidden className="h-1 w-1 rounded-full bg-moss/50" />
        </span>
      ))}
    </div>
  );
}

/**
 * Slow, quiet marquee of the product's checkable properties.
 * Static (wrapped) when reduced motion is preferred.
 */
export function TrustMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.to(el, {
        xPercent: -50,
        ease: "none",
        duration: 36,
        repeat: -1,
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="overflow-hidden border-y border-line bg-paper-deep/60 py-3.5">
      <div ref={trackRef} className="flex w-max">
        <MarqueeRow />
        <MarqueeRow ariaHidden />
      </div>
    </div>
  );
}
