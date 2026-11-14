"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

const PHRASES = [
  "open source",
  "runs on your own servers",
  "immutable changes",
  "free to self-host",
  "works with any AI assistant",
  "no vendor lock-in",
  "you own your data",
  "one governed ontology",
  "every action permissioned",
  "full audit trail",
  "built for humans and agents",
  "connects to any data source",
  "a digital twin of your company",
  "sovereign by design",
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
 * Quiet marquee of checkable properties. Scroll velocity adds a temporary
 * skew, so the strip reacts to how fast the page is moving.
 */
export function TrustMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const drift = gsap.to(el, {
        xPercent: -50,
        ease: "none",
        duration: 40,
        repeat: -1,
      });

      // Velocity skew: lean with the scroll, settle back when it stops
      const proxy = { skew: 0 };
      const skewTo = gsap.quickTo(el, "skewX", {
        duration: 0.5,
        ease: "power3",
      });
      const onUpdate = (self: ScrollTrigger) => {
        const v = gsap.utils.clamp(-9, 9, self.getVelocity() / -260);
        if (Math.abs(v) > Math.abs(proxy.skew)) {
          proxy.skew = v;
          gsap.to(proxy, {
            skew: 0,
            duration: 0.7,
            ease: "power3",
            overwrite: true,
            onUpdate: () => skewTo(proxy.skew),
          });
        }
      };
      ScrollTrigger.create({
        onUpdate,
      });

      // Pause the drift while the tab is hidden
      const vis = () =>
        document.hidden ? drift.pause() : drift.play();
      document.addEventListener("visibilitychange", vis);
      return () => {
        document.removeEventListener("visibilitychange", vis);
      };
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="overflow-hidden border-y border-line bg-paper-deep/60 py-3.5">
      <div ref={trackRef} className="flex w-max will-change-transform">
        <MarqueeRow />
        <MarqueeRow ariaHidden />
      </div>
    </div>
  );
}
