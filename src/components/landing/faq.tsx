"use client";

import { useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "What is an “ontology”, in plain terms?",
    a: "A working map of your business that people and machines can read the same way: the things that exist (customers, orders, clusters, policies), how they relate, and the actions anyone is allowed to take on them. Olrien keeps that map in one governed place instead of scattered across dashboards, docs and prompt strings.",
  },
  {
    q: "Do we have to build that map by hand?",
    a: "Not from scratch. Olrien drafts a first model from what you already have  database schemas, warehouse tables, CRM objects — and your team refines it like code: propose a change, review it, merge it. Most teams have a useful first model in days, not quarters.",
  },
  {
    q: "Does it replace the tools we already run?",
    a: "No. Your database, warehouse and customer systems stay exactly where they are. Olrien sits on top and gives everyone  and every AI tool  one consistent, governed way to read them and change them.",
  },
  {
    q: "Can AI agents actually change things, or only read?",
    a: "Both, but never freely. Every write is a named, pre-approved action. Olrien checks that the agent  and the human it acts for  is allowed to take it, shows exactly what would change before it happens, asks a human to confirm when the change is significant, and records the whole thing so it can be reviewed or undone.",
  },
  {
    q: "Who controls what people and agents can see?",
    a: "One set of rules, enforced everywhere. Permissions live on the ontology  down to fields and rows where you need them  and apply identically to a human in the UI, an analyst’s query and an agent’s tool call. An agent never sees more than the person it acts for.",
  },
  {
    q: "Where does our data live? Do you train on it?",
    a: "Olrien is self-hosted: your data stays inside your infrastructure and never passes through ours, and none of it is used for training. If you connect an external model as an agent, what it can reach is exactly what your permissions allow  no more.",
  },
  {
    q: "What does it cost?",
    a: "Nothing to run. Olrien is open source and free to self-host: download it, run it on your own servers, change it however you like. No per-seat pricing, no paywalled tier — the whole platform is the open-source version.",
  },
];

export function Faq() {
  /* Single-open accordion, deterministic ids for a11y wiring */
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section
      id="faq"
      aria-label="Frequently asked questions"
      className="scroll-mt-20 border-t border-line bg-paper-deep/40 py-28 lg:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.35fr] lg:gap-20">
          {/* Left: sticky intro (this column was empty before) */}
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-ink-soft">
                FAQ
              </span>
              <h2 className="mt-4 font-display text-4xl font-medium leading-[1.12] text-ink sm:text-[42px]">
                The questions people actually ask
              </h2>
              <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-ink-soft">
                Plain answers about what Olrien is, what it touches, and what it
                refuses to do. Anything we missed  ask us directly.
              </p>
              {/* TODO: point this at your real contact / docs URL */}
              <a
                href="mailto:hello@olrien.com"
                className="group mt-8 inline-flex items-center gap-1.5 text-[14px] font-medium text-moss-deep transition-opacity hover:opacity-80"
              >
                Ask a question we didn’t cover
                <ArrowUpRight
                  aria-hidden
                  className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
            </div>
          </Reveal>

          {/* Right: accordion */}
          <Reveal>
            <div className="w-full">
              {FAQS.map((f, i) => {
                const open = openIdx === i;
                return (
                  <div key={f.q} className="border-b border-line first:border-t">
                    <h3 className="m-0">
                      <button
                        type="button"
                        id={`faq-q-${i}`}
                        aria-expanded={open}
                        aria-controls={`faq-a-${i}`}
                        onClick={() => setOpenIdx(open ? null : i)}
                        className="group flex w-full items-start justify-between gap-6 py-6 text-left focus-visible:outline-none"
                      >
                        <span className="flex items-start gap-3">
                          <span
                            aria-hidden
                            className={cn(
                              "w-6 shrink-0 pt-1.5 text-[11px] font-medium tabular-nums tracking-[0.18em] transition-colors",
                              open ? "text-moss-deep" : "text-ink-soft/60"
                            )}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span
                            className={cn(
                              "font-display text-[17px] font-medium leading-snug transition-colors group-hover:text-moss-deep sm:text-[18px]",
                              open ? "text-moss-deep" : "text-ink"
                            )}
                          >
                            {f.q}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-300",
                            open
                              ? "border-moss-deep/40 bg-moss-deep/10 text-moss-deep"
                              : "border-line text-ink-soft group-hover:border-moss-deep/40 group-hover:text-moss-deep"
                          )}
                        >
                          <Plus
                            aria-hidden
                            className={cn(
                              "h-3.5 w-3.5 transition-transform duration-300",
                              open && "rotate-45"
                            )}
                          />
                        </span>
                      </button>
                    </h3>
                    <div
                      id={`faq-a-${i}`}
                      role="region"
                      aria-labelledby={`faq-q-${i}`}
                      aria-hidden={!open}
                      className={cn(
                        "grid transition-[grid-template-rows] duration-300 ease-out",
                        open ? "[grid-template-rows:1fr]" : "[grid-template-rows:0fr]"
                      )}
                    >
                      <div className="overflow-hidden">
                        <p
                          className={cn(
                            "pl-9 pr-6 pb-7 text-[14.5px] leading-relaxed text-ink-soft transition-opacity duration-300 sm:pr-16",
                            open ? "opacity-100" : "opacity-0"
                          )}
                        >
                          {f.a}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}