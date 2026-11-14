"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { SectionHeading } from "@/components/landing/section-heading";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "Does our data leave our systems?",
    a: "No. Marendil runs on your own servers. The only thing that leaves your network is the requests you send to your AI provider, using your own account and your own key. There is no Marendil cloud holding your data.",
  },
  {
    q: "Can AI assistants actually change things?",
    a: "Yes, but never freely. Every change has to be a named, pre-approved action. Marendil checks that the person or assistant is allowed to make it, shows exactly what would change before it happens, asks a human to confirm when the change is significant, and writes the whole thing down so it can be undone.",
  },
  {
    q: "Does it replace the tools we already use?",
    a: "No. It sits on top of what you already run. Your database, warehouse and customer systems stay exactly as they are. Marendil just gives everyone, and every AI tool, one consistent way to read them and change them.",
  },
  {
    q: "How much does it cost?",
    a: "Nothing. Marendil is completely free and open source. Download it, run it on your own servers, and change it however you like. There is no paid version and no charge per person.",
  },
];

export function Faq() {
  /* Custom accordion: single open, no generated ids */
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section
      id="faq"
      aria-label="Frequently asked questions"
      className="scroll-mt-20 border-t border-line bg-paper-deep/40 py-28 lg:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.4fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
          </div>
          <Reveal>
            <div className="w-full">
              {FAQS.map((f, i) => {
                const open = openIdx === i;
                return (
                  <div key={f.q} className="border-b border-line first:border-t">
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenIdx(open ? null : i)}
                      className="group flex w-full items-center justify-between gap-6 py-5 text-left"
                    >
                      <span
                        className={cn(
                          "font-display text-[16.5px] font-medium transition-colors group-hover:text-moss-deep",
                          open ? "text-moss-deep" : "text-ink"
                        )}
                      >
                        {f.q}
                      </span>
                      <Plus
                        aria-hidden
                        className={cn(
                          "h-4 w-4 shrink-0 text-ink-soft transition-transform duration-300",
                          open && "rotate-45 text-moss-deep"
                        )}
                      />
                    </button>
                    <div
                      aria-hidden={!open}
                      className={cn(
                        "grid transition-[grid-template-rows] duration-300 ease-out",
                        open ? "[grid-template-rows:1fr]" : "[grid-template-rows:0fr]"
                      )}
                    >
                      <div className="overflow-hidden">
                        <p className="pb-5 pr-10 text-[14px] leading-relaxed text-ink-soft">
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
