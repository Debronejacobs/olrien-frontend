"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eyebrow } from "@/components/landing/section-heading";
import { Reveal } from "@/components/landing/reveal";
import { AnimText } from "@/components/landing/animated-text";

const ROLES = [
  "Head of Data / CTO",
  "COO / line of business",
  "CISO / Compliance",
  "CFO / Finance",
  "Engineer",
  "Other",
];

export function FinalCta() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setState("loading");
    try {
      const res = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: role || undefined }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        duplicate?: boolean;
      };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setState("idle");
        return;
      }
      setState("done");
      toast(
        data.duplicate ? "You're already on the list." : "You're on the list.",
        {
          description:
            "Oldest signups first: the preview invite and the open source repo link land in your inbox first.",
        }
      );
    } catch {
      setError("Network hiccup, please try again.");
      setState("idle");
    }
  };

  return (
    <section
      id="early-access"
      aria-label="Join the early access list"
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
            <Eyebrow dark>11 · Early access</Eyebrow>
            <AnimText
              as="h2"
              type="lines"
              className="mt-5 font-display text-[2.6rem] font-medium leading-[1.03] tracking-[-0.02em] text-balance text-ink sm:text-5xl lg:text-[3.9rem]"
            >
              Own the model of your company.
            </AnimText>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-ink/70 sm:text-lg">
              The architecture is proven; what is new is the price of building
              it, and who owns it. Join the early access list, or come in as a
              design partner and shape what ships next.
            </p>
            <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/40">
              self hosted preview · oldest signups first · design partner
              slots open
            </p>
          </div>

          {/* Form card column */}
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-5 -z-0 rounded-3xl bg-moss-bright/10 blur-2xl"
            />
            <div className="relative rounded-2xl border border-line bg-card p-6 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.6)] sm:p-8">
              {state === "done" ? (
                <Reveal className="rounded-xl border border-moss/50 bg-moss-tint p-6 text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-moss" />
                  <p className="mt-3 font-display text-lg font-medium text-moss-deep">
                    You&rsquo;re on the list.
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-moss-deep/80">
                    Invites go out oldest first. Watch your inbox: the preview
                    and the repo link ship together.
                  </p>
                </Reveal>
              ) : (
                <form onSubmit={submit} className="space-y-3.5 text-left">
                  <div className="space-y-1.5">
                    <Label htmlFor="ea-email" className="text-[12.5px] font-medium text-ink-soft">
                      Work email
                    </Label>
                    <Input
                      id="ea-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="h-12 border-line-strong bg-card focus-visible:ring-moss"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ea-role" className="text-[12.5px] font-medium text-ink-soft">
                      Your role
                    </Label>
                    {/* Native select: reliable on mobile, no generated ids */}
                    <div className="relative">
                      <select
                        id="ea-role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className={`h-12 w-full appearance-none rounded-md border border-line-strong bg-card px-3.5 text-[15px] shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-moss focus-visible:ring-[3px] focus-visible:ring-moss/30 ${
                          role ? "text-ink" : "text-muted-foreground"
                        }`}
                      >
                        <option value="" disabled>
                          Your role
                        </option>
                        {ROLES.map((r) => (
                          <option key={r} value={r} className="bg-card text-ink">
                            {r}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        aria-hidden
                        className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={state === "loading"}
                    className="h-12 w-full gap-2.5 font-mono text-[12px] uppercase tracking-[0.18em]"
                  >
                    {state === "loading" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Request access
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <p className="pt-1 text-center font-mono text-[10.5px] tracking-wide text-muted-foreground">
                    no spam · one update per milestone · unsubscribe anytime
                  </p>
                </form>
              )}

              {error ? (
                <p role="alert" className="mt-3 text-sm text-destructive">
                  {error}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
