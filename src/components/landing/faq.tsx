"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading } from "@/components/landing/section-heading";
import { Reveal } from "@/components/landing/reveal";

const FAQS = [
  {
    q: "Does our data leave our environment?",
    a: "No. Aletheia is self-hosted and connects to your systems with read-only credentials. The only traffic leaving your perimeter is model API calls — to the provider whose key you supply. There is no Aletheia cloud that receives customer data.",
  },
  {
    q: "Can it write to our systems?",
    a: "Not yet, by design. Early builds ship without a write path, so agent safety never depends on prompts or good intentions. Governed writes arrive later as typed, dry-run, human-approved actions through the action gateway.",
  },
  {
    q: "Who deploys it, and how long does it take?",
    a: "Your own team — no vendor engineers. An agent scans your schemas and documents and drafts the ontology as reviewable diffs; your team approves, edits or discards each part. Time to a first governed answer is measured in days, not months.",
  },
  {
    q: "Does it replace the tools we already run?",
    a: "No. Aletheia sits on top of the stack and replaces nothing. Databases and warehouses are scanned live over read-only credentials, SaaS records are synced over APIs and merged into one object, and your existing tooling keeps running underneath.",
  },
  {
    q: "How is it priced?",
    a: "The core is open source. The company-kernel license — single sign-on, role-based access control, audit exports and the action gateway — is pay-once and owned outright, with optional updates and support. No per-seat tax on readers, and no margin on model usage.",
  },
  {
    q: "What is in the first preview?",
    a: "Read tools with lineage tracing, connectors for PostgreSQL, MySQL and CSV, agent-assisted onboarding, and three starter ontologies. Warehouse, SaaS and document connectors follow on a weekly cadence; the action gateway comes later.",
  },
];

export function Faq() {
  return (
    <section
      id="faq"
      aria-label="Frequently asked questions"
      className="scroll-mt-20 border-t border-line bg-paper-deep/40 py-24 lg:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.4fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              eyebrow="08 — Questions"
              title="Asked, answered, stated plainly."
              lead="The same trade-offs the company tells its investors are the ones it tells you. If a question is missing, ask it at the bottom of the page."
            />
          </div>
          <Reveal>
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((f, i) => (
                <AccordionItem
                  key={f.q}
                  value={`item-${i}`}
                  className="border-line"
                >
                  <AccordionTrigger className="py-5 text-left font-display text-[16.5px] font-medium text-ink hover:no-underline hover:text-moss-deep">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-[14px] leading-relaxed text-ink-soft">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
