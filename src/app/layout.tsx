import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { SmoothScroll } from "@/components/landing/smooth-scroll";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aletheia · One governed model of the company",
  description:
    "Aletheia gives operations heavy companies a single, trustworthy model of the business: the objects it runs on, how they relate, and what may be done to them. Reads carry lineage, writes pass guardrails, everything is logged through one audited endpoint. Open core. Self hosted. Licensed once, owned outright.",
  keywords: [
    "Aletheia",
    "ontology",
    "MCP",
    "Model Context Protocol",
    "data governance",
    "AI agents",
    "guarded CRUD",
    "self hosted",
    "open core",
    "audit",
  ],
  openGraph: {
    title: "Aletheia · One governed model of the company",
    description:
      "One door in: a single guarded endpoint for every person and AI tool. One log out: one immutable audit trail across all access. Open core, self hosted, owned outright.",
    siteName: "Aletheia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aletheia · One governed model of the company",
    description:
      "One door in. One log out. The company kernel: open core, self hosted, pay once, own it outright.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${grotesk.variable} ${jetbrains.variable} ${instrument.variable} font-sans antialiased bg-background text-foreground`}
      >
        <SmoothScroll />
        {/* Fine paper grain over everything, never interactive */}
        <div aria-hidden className="noise-overlay pointer-events-none fixed inset-0 z-[80]" />
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#161a15",
              border: "1px solid #2d342c",
              color: "#e9e7dc",
              borderRadius: "0.75rem",
              boxShadow: "0 24px 60px -20px rgba(0,0,0,0.65)",
            },
            descriptionClassName: "text-ink-soft",
          }}
        />
      </body>
    </html>
  );
}
