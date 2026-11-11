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
    "Aletheia gives operations heavy companies one shared, trustworthy picture of the business: the customers, orders and invoices they run on, how they connect, and what people and AI tools are allowed to do. Every answer shows where it came from, every change is checked before it happens, and everything is written into one record. Open source. Runs on your own servers.",
  keywords: [
    "Aletheia",
    "ontology",
    "MCP",
    "Model Context Protocol",
    "data governance",
    "AI agents",
    "guarded CRUD",
    "self hosted",
    "open source",
    "audit",
  ],
  openGraph: {
    title: "Aletheia · One governed model of the company",
    description:
      "One front door for every person and AI tool. One record of everything that happened. Open source, runs on your own servers.",
    siteName: "Aletheia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aletheia · One governed model of the company",
    description:
      "One front door in. One record out. Open source, runs on your own servers.",
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
