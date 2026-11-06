"use client";

import { useEffect, useState } from "react";
import { Github, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "@/components/landing/logo";
import { scrollToId } from "@/lib/scroll";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const LINKS: { label: string; href: string }[] = [
  { label: "Product", href: "#product" },
  { label: "Deployment", href: "#deployment" },
  { label: "Writes", href: "#writes" },
  { label: "Scenario", href: "#scenario" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "FAQ", href: "#faq" },
];

const ACTIVE_IDS = LINKS.map((l) => l.href.slice(1));

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const els = ACTIVE_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (els.length === 0) return;
    let ticking = false;
    const measure = () => {
      ticking = false;
      const anchor = window.innerHeight * 0.42;
      let current: string | null = null;
      for (const el of els) {
        if (el.getBoundingClientRect().top <= anchor) current = el.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(measure);
      }
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    scrollToId(href);
  };

  const repoToast = () =>
    toast({
      title: "The open source core ships with the first preview.",
      description:
        "Join the early access list below and the repo link lands in your inbox first.",
    });

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-line/80 bg-paper/85 shadow-[0_1px_24px_-12px_rgba(27,26,21,0.25)] backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-5 sm:px-8">
        <a
          href="#top"
          onClick={go("#top")}
          className="text-ink transition-opacity hover:opacity-70"
          aria-label="Aletheia: back to top"
        >
          <Logo />
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={go(l.href)}
              aria-current={active === l.href.slice(1) ? "true" : undefined}
              className={cn(
                "relative text-[13.5px] font-medium transition-colors",
                active === l.href.slice(1)
                  ? "text-ink"
                  : "text-ink-soft hover:text-ink"
              )}
            >
              {l.label}
              <span
                aria-hidden
                className={cn(
                  "absolute -bottom-1.5 left-0 h-px w-full origin-left bg-moss transition-transform duration-300",
                  active === l.href.slice(1) ? "scale-x-100" : "scale-x-0"
                )}
              />
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 lg:flex">
          <Button
            variant="ghost"
            size="sm"
            onClick={repoToast}
            className="gap-2 font-mono text-[12.5px] text-ink-soft hover:text-ink"
          >
            <Github className="h-4 w-4" />
            Open core
          </Button>
          <Button
            size="sm"
            onClick={go("#early-access")}
            className="px-4 font-mono text-[11.5px] uppercase tracking-[0.14em]"
          >
            Join early access
          </Button>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 lg:hidden">
          <Button
            size="sm"
            onClick={go("#early-access")}
            className="px-4 font-mono text-[11.5px] uppercase tracking-[0.14em]"
          >
            Early access
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu className="h-4.5 w-4.5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-paper w-[300px]">
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav
                aria-label="Mobile"
                className="mt-2 flex flex-col gap-1 px-4"
              >
                {LINKS.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={go(l.href)}
                    className="rounded-md px-2 py-3 text-[15px] font-medium text-ink-soft transition-colors hover:bg-muted hover:text-ink"
                  >
                    {l.label}
                  </a>
                ))}
                <button
                  onClick={() => {
                    setOpen(false);
                    repoToast();
                  }}
                  className="mt-2 flex items-center gap-2 rounded-md px-2 py-3 text-left text-[15px] font-medium text-ink-soft transition-colors hover:bg-muted hover:text-ink"
                >
                  <Github className="h-4 w-4" /> Open core
                </button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
