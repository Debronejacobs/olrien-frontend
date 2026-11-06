import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

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
        "font-mono text-[11px] uppercase tracking-[0.22em]",
        dark ? "text-moss-bright" : "text-moss",
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          "mr-2 inline-block h-[7px] w-[7px] translate-y-[-1px] rounded-[1px]",
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
      <Eyebrow dark={dark} className={align === "center" ? "text-center" : ""}>
        {eyebrow}
      </Eyebrow>
      <h2
        className={cn(
          "mt-4 font-display text-3xl font-medium leading-[1.08] tracking-tight text-balance sm:text-4xl lg:text-[2.75rem]",
          dark ? "text-paper" : "text-ink"
        )}
      >
        {title}
      </h2>
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
