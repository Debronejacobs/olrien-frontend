import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 *    olrien mark.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/logo.png"
        alt=""
        width={50}
        height={40}
        aria-hidden
        className="shrink-0"
      />
      <span className="font-display text-[19px] font-semibold tracking-tight">
          Olrien
      </span>
    </span>
  );
}
