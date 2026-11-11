"use client";

import { Logo } from "@/components/landing/logo";
import { scrollToId } from "@/lib/scroll";

const GROUPS: {
  title: string;
  links: { label: string; href: string; note?: string }[];
}[] = [
  {
    title: "Explore",
    links: [
      { label: "Product", href: "#product" },
      { label: "Deployment", href: "#deployment" },
      { label: "Writes", href: "#writes" },
      { label: "Scenario", href: "#scenario" },
    ],
  },
  {
    title: "More",
    links: [
      { label: "Roadmap", href: "#roadmap" },
      { label: "FAQ", href: "#faq" },
      { label: "Source", href: "#source" },
    ],
  },
  {
    title: "Connect",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/Debronejacobs/AletheiaMain",
        note: "open source",
      },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-night pb-[env(safe-area-inset-bottom)]">
      {/* Moss glow rising from the bottom edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[340px] bg-[radial-gradient(50%_75%_at_50%_115%,rgba(26,127,75,0.28),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-12 py-16 md:grid-cols-[1.2fr_repeat(3,minmax(0,0.6fr))] md:gap-8">
          <div className="max-w-sm">
            <p className="text-ink">
              <Logo />
            </p>
            <p className="mt-5 text-sm leading-relaxed text-ink/60">
              One shared picture of the company, for every person and every AI
              tool. Fully open source, runs on your own servers, free to use.
            </p>
            <p className="mt-5 font-mono text-[11px] tracking-wide text-moss-bright/70">
              one door in · one log out
            </p>
          </div>

          {GROUPS.map((g) => (
            <nav key={g.title} aria-label={g.title}>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/35">
                {g.title}
              </p>
              <ul className="mt-5 space-y-3.5">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToId(l.href);
                      }}
                      className="text-[13.5px] font-medium text-ink/65 transition-colors hover:text-ink"
                    >
                      {l.label}
                      {l.note ? (
                        <span className="ml-2 inline-block whitespace-nowrap rounded-full border border-night-line px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-moss-bright/70">
                          {l.note}
                        </span>
                      ) : null}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-night-line py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] text-ink/35">
            © 2026 Aletheia · for discussion purposes only
          </p>
          <p className="font-mono text-[11px] text-ink/35">
            open source · self-hosted · your infrastructure
          </p>
        </div>
      </div>
    </footer>
  );
}
