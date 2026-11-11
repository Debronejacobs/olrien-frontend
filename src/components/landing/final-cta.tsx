"use client";

import { ArrowRight, CheckCircle2, Github, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/landing/section-heading";
import { Reveal } from "@/components/landing/reveal";
import { AnimText } from "@/components/landing/animated-text";

/**
 * Where people should go next. Kept in one place so links can be updated
 * without touching the markup.
 */
const GITHUB_URL = "https://github.com/Debronejacobs/AletheiaMain";
const CONTACT_EMAIL = "hello@aletheia.cc.cd";

export function FinalCta() {
  return (
    <section
      id="source"
      aria-label="Open source and contact"
      className="relative scroll-mt-20 overflow-hidden bg-night"
    >
      {/* Backdrop: dark grid with a moss glow rising from the bottom edge */}
      <div
        aria-hidden
        className="grid-bg-dark absolute inset-0 opacity-70 [mask-image:linear-gradient(to_bottom,transparent,black_35%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[420px] bg-[radial-gradient(55%_65%_at_50%_100%,rgba(26,127,75,0.22),transparent_72%)]"
      />

      <div className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* Statement column */}
          <div>
            <Eyebrow dark>11 · Open source</Eyebrow>
            <AnimText
              as="h2"
              type="lines"
              className="mt-5 font-display text-[2.6rem] font-medium leading-[1.03] tracking-[-0.02em] text-balance text-ink sm:text-5xl lg:text-[3.9rem]"
            >
              Own the model of your company.
            </AnimText>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-ink/70 sm:text-lg">
              The approach is proven; what is new is how you get it, and who
              owns it. Aletheia is fully open source — read it, run it, host it
              yourself, and change it however you like. A managed cloud service
              is coming later for teams that would rather not operate it
              themselves.
            </p>
            <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/40">
              open source · runs on your servers · free to self-host
            </p>
          </div>

          {/* Actions card column */}
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-5 -z-0 rounded-3xl bg-moss-bright/10 blur-2xl"
            />
            <div className="relative rounded-2xl border border-line bg-card p-6 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.6)] sm:p-8">
              <Reveal className="rounded-xl border border-moss/50 bg-moss-tint p-6 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-moss" />
                <p className="mt-3 font-display text-lg font-medium text-moss-deep">
                  The source ships in the open.
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-moss-deep/80">
                  Star the repo to follow progress, or send a note if you want to
                  be a design partner or need help self-hosting.
                </p>
              </Reveal>

              <div className="mt-4 flex flex-col gap-2.5">
                <Button
                  asChild
                  className="h-12 w-full gap-2.5 font-mono text-[12px] uppercase tracking-[0.18em]"
                >
                  <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                    <Github className="h-4 w-4" />
                    View on GitHub
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 w-full gap-2.5 border-line-strong font-mono text-[12px] uppercase tracking-[0.18em]"
                >
                  <a href={`mailto:${CONTACT_EMAIL}`}>
                    <Mail className="h-4 w-4" />
                    Email us
                  </a>
                </Button>
              </div>

              <p className="pt-3 text-center font-mono text-[10.5px] tracking-wide text-muted-foreground">
                no newsletter · no tracking · just the source
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}