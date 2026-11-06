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
    a: "No. Aletheia is self hosted and connects to your systems with scoped credentials. The only traffic leaving your perimeter is model API traffic, on the provider key you supply. There is no Aletheia cloud that receives customer data.",
  },
  {
    q: "Can it write to our systems?",
    a: "Yes, as guarded CRUD. Every write must be a typed action declared in the ontology, authorized for the caller's role, previewed with a dry run when it is sensitive, approved by a human when policy requires it, and written to the audit log with a rollback point. Agent safety never depends on prompts or good intentions.",
  },
  {
    q: "Who deploys it, and how long does it take?",
    a: "Your own team, no vendor engineers. An agent scans your schemas and documents and drafts the ontology as reviewable diffs; your team approves, edits or discards each part. Time to a first governed answer is measured in days, not months.",
  },
  {
    q: "Does it replace the tools we already run?",
    a: "No. Aletheia sits on top of the stack and replaces nothing. Databases and warehouses are scanned live, SaaS records are synced over APIs and merged into one object, and your existing tooling keeps running underneath.",
  },
  {
    q: "How is it priced?",
    a: "The core is open source. The company kernel license (single sign-on, role based access control, audit exports, the action gateway) is pay once and owned outright, with optional updates and support. No per seat tax on readers, and no margin on model usage.",
  },
  {
    q: "What is in the first preview?",
    a: "Guarded CRUD over PostgreSQL, MySQL and CSV, agent assisted onboarding, and three starter ontologies. Warehouse, SaaS and document connectors follow on a weekly cadence; deeper guardrails follow those.",
  },
];

export function Faq() {
  return (
    <section
      id="faq"
      aria-label="Frequently asked questions"
      className="scroll-mt-20 border-t border-line bg-paper-deep/40 py-28 lg:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.4fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              eyebrow="10 · Questions"
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
