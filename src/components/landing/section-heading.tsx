import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { AnimText } from "@/components/landing/animated-text";

export function Eyebrow({
  children,
  dark = false,
  className,
}: {
  children: ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.22em]",
        dark ? "text-moss-bright" : "text-moss",
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-block h-[7px] w-[7px] rounded-[1px]",
          dark ? "bg-moss-bright" : "bg-moss"
        )}
      />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  dark = false,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
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
      <Eyebrow
        dark={dark}
        className={cn(align === "center" && "justify-center")}
      >
        {eyebrow}
      </Eyebrow>
      <AnimText
        as="h2"
        type="lines"
        className={cn(
          "mt-4 font-display text-3xl font-medium leading-[1.08] tracking-tight text-balance sm:text-4xl lg:text-[2.75rem]",
          dark ? "text-paper" : "text-ink"
        )}
      >
        {title}
      </AnimText>
      {lead ? (
        <p
          className={cn(
            "mt-5 text-base leading-relaxed sm:text-lg",
            dark ? "text-paper/70" : "text-ink-soft/90"
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}
