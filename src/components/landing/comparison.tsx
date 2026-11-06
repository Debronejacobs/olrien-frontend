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
    cat: "Dashboards and BI",
    well: "Aggregated views of past activity.",
    short: "Describes but does not decide; each tool keeps its own partial truth.",
  },
  {
    cat: "Semantic layers",
    well: "Consistent, governed metric definitions.",
    short: "Metrics only: no entities, relationships or tool-facing actions.",
  },
  {
    cat: "Data catalogs and governance",
    well: "Inventory, lineage and policy over data assets.",
    short: "Documents the estate; not a live model that tools query and act through.",
  },
  {
    cat: "Enterprise ontology platforms",
    well: "The proven way the world's largest operations run on a shared model of the business.",
    short: "Multiyear, multimillion implementations with vendor engineering teams; a mid market team cannot buy, run or own one.",
  },
  {
    cat: "Raw agent to database access",
    well: "Maximum flexibility for the agent.",
    short: "No shared semantics, permission boundary, lineage or unified audit trail.",
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
          eyebrow="08 · Position"
          title="Adjacent categories stop short."
          lead="Aletheia sits adjacent to several categories rather than inside any one of them. Each solves a real piece of the problem and stops in a specific way. Descriptions are generalised; the point is the gap, not the rivalry."
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
                          one governed layer
                        </p>
                      </div>
                      <p className="text-[13.5px] font-medium leading-relaxed text-moss-deep">
                        One guarded endpoint over a shared ontology: lineage on
                        every read, five gates on every write, one log for
                        everything.
                      </p>
                      <p className="text-[13.5px] leading-relaxed text-moss-deep/80">
                        The trade is real: self hosted means self operated.
                        Your team owns the deploys, the diffs and the
                        approvals, and this is v0 software. We say so because
                        the rest of this page is checkable, and so is that.
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
            &ldquo;The architecture Aletheia sells is the architecture the
            large platforms proved. What changed is the delivery model: agent
            assisted drafting, self hosting, your own team, a perpetual
            license.&rdquo;
          </p>
        </Reveal>
      </div>
    </section>
  );
}
