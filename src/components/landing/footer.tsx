"use client";

import { Logo } from "@/components/landing/logo";
import { scrollToId } from "@/lib/scroll";

const LINKS: { label: string; href: string }[] = [
  { label: "Product", href: "#product" },
  { label: "Deployment", href: "#deployment" },
  { label: "Scenario", href: "#scenario" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "FAQ", href: "#faq" },
  { label: "Early access", href: "#early-access" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-paper-deep/60 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <p className="text-ink">
              <Logo />
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              One governed model of the company, for every person and every AI
              tool. Open source at the core, self-hosted, licensed once,
              owned outright.
            </p>
            <p className="mt-4 font-mono text-[11px] text-moss">
              one door in · one log out
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-14 gap-y-2.5 sm:grid-cols-3">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId(l.href);
                }}
                className="text-[13.5px] font-medium text-ink-soft transition-colors hover:text-ink"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] text-muted-foreground">
            © 2026 Aletheia · for discussion purposes only
          </p>
          <p className="font-mono text-[11px] text-muted-foreground">
            open core · company-kernel license · your infrastructure
          </p>
        </div>
      </div>
    </footer>
  );
}
