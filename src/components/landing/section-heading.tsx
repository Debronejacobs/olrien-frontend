import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { AnimText } from "@/components/landing/animated-text";

export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  /** Kept for API compatibility; the theme is dark-first so both variants match. */
  dark?: boolean;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-moss",
        className
      )}
    >
      <span aria-hidden className="inline-block h-[7px] w-[7px] rounded-[1px] bg-moss" />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  /** Kept for API compatibility; the theme is dark-first so both variants match. */
  dark?: boolean;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      <Eyebrow className={cn(align === "center" && "justify-center")}>
        {eyebrow}
      </Eyebrow>
      <AnimText
        as="h2"
        type="lines"
        className={cn(
          "mt-4 font-display text-4xl font-medium leading-[1.05] tracking-[-0.02em] text-balance text-ink sm:text-[2.75rem] lg:text-[3.4rem]"
        )}
      >
        {title}
      </AnimText>
      {lead ? (
        <p className="mt-5 text-base leading-relaxed text-ink-soft/90 sm:text-lg">
          {lead}
        </p>
      ) : null}
    </div>
  );
}
