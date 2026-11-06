"use client";

import { EyeOff, KeyRound, GitBranch, Scale } from "lucide-react";
import { SectionHeading } from "@/components/landing/section-heading";
import { RevealGroup, Reveal } from "@/components/landing/reveal";

const CHOICES = [
  {
    icon: EyeOff,
    title: "Read-only first",
    body: "Early builds ship without a write path, so agent safety never depends on prompts or good intentions.",
    check: "check: inspect the build — there is no write path",
  },
  {
    icon: KeyRound,
    title: "Bring your own model key",
    body: "Only model calls leave — to the provider whose key you supply. No Aletheia cloud receives your data.",
    check: "check: watch the egress — model API calls only",
  },
  {
    icon: GitBranch,
    title: "Ontology versioned in Git",
    body: "The model is reviewed as diffs and rolled back like code. It lives where code review already lives.",
    check: "check: git log is the model's audit trail",
  },
  {
    icon: Scale,
    title: "Pay once, self-host",
    body: "A license you own, not a subscription guarding the door. No hostage dataset, no per-seat tax on every new reader.",
    check: "check: your bill has no second economy inside it",
  },
];

export function DesignChoices() {
  return (
    <section
      id="trust"
      aria-label="Design choices"
      className="scroll-mt-20 py-24 lg:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          align="center"
          eyebrow="05 — Trust"
          title="Four choices carry the trust story."
          lead="Each one is checkable rather than aspirational — you can verify all four inside your own perimeter, on your own terms."
        />

        <RevealGroup className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CHOICES.map((c) => (
            <div
              key={c.title}
              className="group flex flex-col rounded-xl border border-line bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-moss/50 hover:shadow-[0_18px_40px_-24px_rgba(20,83,45,0.4)]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-paper text-moss transition-colors group-hover:border-moss/40 group-hover:bg-moss-tint">
                <c.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-lg font-medium text-ink">
                {c.title}
              </h3>
              <p className="mt-2.5 flex-1 text-[13.5px] leading-relaxed text-ink-soft">
                {c.body}
              </p>
              <p className="mt-5 border-t border-line pt-3.5 font-mono text-[10.5px] leading-relaxed text-moss">
                {c.check}
              </p>
            </div>
          ))}
        </RevealGroup>

        <Reveal className="mx-auto mt-12 max-w-2xl text-center">
          <p className="font-serif text-xl italic leading-snug text-ink-soft sm:text-2xl">
            &ldquo;Owned by the customer, deployed by its own team, auditable
            end to end.&rdquo;
          </p>
        </Reveal>
      </div>
    </section>
  );
}
