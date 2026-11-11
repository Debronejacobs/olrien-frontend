"use client";

import { useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SectionHeading } from "@/components/landing/section-heading";
import { Reveal } from "@/components/landing/reveal";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const ROWS = [
  {
    cat: "Dashboards and reporting",
    well: "Tidy summaries of what already happened.",
    short: "They describe, but they cannot act. Each tool keeps its own partial copy of the truth.",
  },
  {
    cat: "Metric definition tools",
    well: "Everyone agrees on how a number like revenue is calculated.",
    short: "Numbers only. They know nothing about customers, orders or what people are allowed to do.",
  },
  {
    cat: "Data catalogues and governance",
    well: "A map of what data exists, where it came from and who may see it.",
    short: "It documents the company. It is not a working picture that tools can ask questions of and act on.",
  },
  {
    cat: "Large enterprise model platforms",
    well: "The proven way the world's biggest operations run on one shared picture of the business.",
    short: "Years of work and millions in fees, with the vendor's consultants. A mid sized team cannot buy it, run it or own it.",
  },
  {
    cat: "Plugging AI straight into the database",
    well: "The most freedom for the AI tool.",
    short: "No shared meaning, no access rules, no way to check an answer, and no single record of what happened.",
  },
];

export function Comparison() {
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = tableRef.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      // Rows rise in with a slight stagger
      gsap.fromTo(
        ".cmp-row",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 78%" },
        }
      );
      // The Aletheia row sweeps green, left to right
      gsap.fromTo(
        ".cmp-sweep",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.9,
          ease: "power4.inOut",
          scrollTrigger: { trigger: ".cmp-hero-row", start: "top 82%" },
        }
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="compare"
      aria-label="Competition"
      className="scroll-mt-20 border-t border-line bg-paper-deep/40 py-28 lg:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="08 · Where it fits"
          title="Helpful neighbours that stop short."
          lead="Aletheia sits next to a few existing kinds of tool rather than inside any one of them. Each solves a real part of the problem, then stops. These descriptions are general; the point is the missing piece, not a rivalry."
        />

        <div ref={tableRef}>
          <Reveal className="mt-12 overflow-x-auto rounded-xl border border-line bg-card shadow-xs">
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[220px] py-4 pl-5 font-mono text-[11px] uppercase tracking-[0.16em]">
                    Category
                  </TableHead>
                  <TableHead className="py-4 font-mono text-[11px] uppercase tracking-[0.16em]">
                    What it does well
                  </TableHead>
                  <TableHead className="py-4 pr-5 font-mono text-[11px] uppercase tracking-[0.16em]">
                    Where it stops short
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ROWS.map((r) => (
                  <TableRow key={r.cat} className="cmp-row border-line">
                    <TableCell className="py-4 pl-5 font-display text-[15px] font-medium text-ink">
                      {r.cat}
                    </TableCell>
                    <TableCell className="py-4 text-[13.5px] leading-relaxed text-ink-soft">
                      {r.well}
                    </TableCell>
                    <TableCell className="py-4 pr-5 text-[13.5px] leading-relaxed text-ink-soft">
                      {r.short}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="cmp-hero-row relative border-moss/40 hover:bg-transparent">
                  <TableCell
                    colSpan={3}
                    className="relative overflow-hidden bg-moss-tint p-0"
                  >
                    <span
                      aria-hidden
                      className="cmp-sweep absolute inset-0 origin-left bg-moss-tint"
                    />
                    <div className="relative grid gap-2 p-5 sm:grid-cols-[220px_1fr_1fr] sm:gap-4">
                      <div>
                        <p className="font-display text-[16px] font-semibold text-moss-deep">
                          Aletheia
                        </p>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-moss">
                          one trusted layer
                        </p>
                      </div>
                      <p className="text-[13.5px] font-medium leading-relaxed text-moss-deep">
                        One front door to one shared picture of the business:
                        every answer shows its sources, every change passes five
                        checks, and everything lands in one record.
                      </p>
                      <p className="text-[13.5px] leading-relaxed text-moss-deep/80">
                        The trade-off is real: running it yourself means
                        operating it yourself. Your team owns the installs, the
                        reviews and the approvals, and this is early software.
                        We say so because the rest of this page can be checked,
                        and so can that.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Reveal>
        </div>

        <Reveal className="mt-10 max-w-3xl">
          <p className="border-l-2 border-moss pl-6 font-serif text-xl italic leading-snug text-ink sm:text-2xl">
            &ldquo;The approach Aletheia uses is the one the large platforms
            already proved. What changed is how you get it: assisted setup, you
            run it yourself, your own team owns it, and it is open source and
            free.&rdquo;
          </p>
        </Reveal>
      </div>
    </section>
  );
}
