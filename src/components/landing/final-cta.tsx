"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eyebrow } from "@/components/landing/section-heading";
import { Reveal } from "@/components/landing/reveal";
import { AnimText } from "@/components/landing/animated-text";
import { Magnetic } from "@/components/landing/magnetic";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

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
      toast({
        title: data.duplicate
          ? "You're already on the list."
          : "You're on the list.",
        description:
          "Oldest signups first: the preview invite and the open source repo link land in your inbox first.",
      });
    } catch {
      setError("Network hiccup, please try again.");
      setState("idle");
    }
  };

  return (
    <section
      id="early-access"
      aria-label="Join the early access list"
      className="scroll-mt-20 border-t border-line py-28 lg:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid-bg relative overflow-hidden rounded-2xl border border-line-strong bg-card px-6 py-16 shadow-[0_30px_80px_-40px_rgba(27,26,21,0.4)] sm:px-12 lg:px-16">
          <div
            aria-hidden
            className="absolute right-[-120px] top-[-120px] h-[340px] w-[340px] rounded-full bg-moss-tint blur-3xl"
          />
          <div className="relative mx-auto max-w-2xl text-center">
            <Eyebrow className="justify-center">11 · Early access</Eyebrow>
            <AnimText
              as="h2"
              type="lines"
              className="mt-4 font-display text-3xl font-medium leading-[1.08] tracking-tight text-ink sm:text-4xl lg:text-[2.75rem]"
            >
              Own the model of your company.
            </AnimText>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
              The architecture is proven; what is new is the price of building
              it, and who owns it. Join the early access list, or come in as a
              design partner and shape what ships next.
            </p>

            {state === "done" ? (
              <Reveal className="mx-auto mt-10 max-w-md rounded-xl border border-moss/50 bg-moss-tint p-6">
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
              <form
                onSubmit={submit}
                className="mx-auto mt-10 flex max-w-md flex-col gap-3 text-left sm:flex-row"
              >
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="ea-email" className="sr-only">
                    Work email
                  </Label>
                  <Input
                    id="ea-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="h-12 border-line-strong bg-paper focus-visible:ring-moss"
                  />
                </div>
                <div className="space-y-1.5 sm:w-[168px]">
                  <Label htmlFor="ea-role" className="sr-only">
                    Your role
                  </Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger
                      id="ea-role"
                      className="h-12 w-full border-line-strong bg-paper focus-visible:ring-moss"
                    >
                      <SelectValue placeholder="Your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Magnetic strength={0.2}>
                  <Button
                    type="submit"
                    disabled={state === "loading"}
                    className="h-12 w-full gap-2 px-6 font-medium sm:w-auto"
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
                </Magnetic>
              </form>
            )}

            {error ? (
              <p role="alert" className="mt-3 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <p className="mt-6 font-mono text-[11px] tracking-wide text-muted-foreground">
              self hosted preview · oldest signups first · design partner slots open
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
