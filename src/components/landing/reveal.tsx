"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Fade-up reveal driven by ScrollTrigger. Initial state is set by GSAP itself,
 * so content stays visible without JS or with reduced motion.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 26,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "span";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          delay,
          scrollTrigger: { trigger: el, start: "top 88%" },
        }
      );
    });
    return () => ctx.revert();
  }, [delay, y]);

  return (
    // @ts-expect-error — dynamic tag with a shared ref is fine here
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  );
}

/**
 * Staggered reveal of direct children.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
  y = 24,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.children,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger,
          scrollTrigger: { trigger: el, start: "top 85%" },
        }
      );
    });
    return () => ctx.revert();
  }, [stagger, y]);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
