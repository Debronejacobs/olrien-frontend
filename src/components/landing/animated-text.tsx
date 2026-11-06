"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type AnimTextProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Granularity of the split. Lines mask upward, words stagger, chars cascade. */
  type?: "lines" | "words" | "chars";
  stagger?: number;
  delay?: number;
  /** ScrollTrigger start, when mount is false. */
  start?: string;
  /** Animate immediately instead of on scroll (hero). */
  mount?: boolean;
};

/**
 * Split-text reveal. The raw text renders for crawlers and no-JS visitors;
 * when JS and motion are available, the text is split and each part slides
 * out of an overflow mask. SplitText is reverted on unmount.
 */
export function AnimText({
  children,
  as: Tag = "div",
  className,
  type = "lines",
  stagger,
  delay = 0,
  start = "top 86%",
  mount = false,
}: AnimTextProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let split: SplitText | null = null;
    let ctx: ReturnType<typeof gsap.context> | null = null;
    let killed = false;

    const run = () => {
      if (killed || !ref.current) return;
      ctx = gsap.context(() => {
        // chars are nested inside words so natural word wrapping survives
        const splitType = type === "chars" ? "chars,words" : type;
        const maskType = type === "chars" ? "chars" : type;
        split = new SplitText(el as HTMLElement, {
          type: splitType,
          mask: maskType,
        });
        const parts =
          type === "lines"
            ? split.lines
            : type === "words"
              ? split.words
              : split.chars;
        if (!parts || parts.length === 0) return;
        gsap.fromTo(
          parts,
          { yPercent: 118 },
          {
            yPercent: 0,
            duration: type === "chars" ? 0.75 : 0.95,
            ease: "power4.out",
            stagger: stagger ?? (type === "chars" ? 0.016 : type === "words" ? 0.05 : 0.11),
            delay,
            scrollTrigger: mount ? undefined : { trigger: el as HTMLElement, start },
          }
        );
      });
    };

    if (document.fonts?.ready) {
      void document.fonts.ready.then(run);
    } else {
      run();
    }

    return () => {
      killed = true;
      split?.revert();
      ctx?.revert();
    };
  }, [type, stagger, delay, start, mount]);

  return <Tag ref={ref} className={cn(className)}>{children}</Tag>;
}
