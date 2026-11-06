import { cn } from "@/lib/utils";

/**
 * Aletheia mark: a sealed kernel, one square wall, one opening, one core.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <rect
          x="1.5"
          y="1.5"
          width="23"
          height="23"
          rx="5"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M13 1.5 V 9"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="13" cy="15" r="4" fill="currentColor" />
      </svg>
      <span className="font-display text-[19px] font-semibold tracking-tight">
        Aletheia
      </span>
    </span>
  );
}
