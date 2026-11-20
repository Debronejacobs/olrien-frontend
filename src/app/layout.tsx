import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Instrument_Serif, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { SmoothScroll } from "@/components/landing/smooth-scroll";
import { Galaxy } from "@/components/landing/fluid-grid";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const premium = Playfair_Display({
  variable: "--font-premium",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
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
  title: "Olrien · One governed model of the company",
  description:
    "Olrien gives operations heavy companies one shared, trustworthy picture of the business: the customers, orders and invoices they run on, how they connect, and what people and AI tools are allowed to do. Every answer shows where it came from, every change is checked before it happens, and everything is written into one record. Open source. Runs on your own servers.",
  keywords: [
    "ontology",
    "MCP",
    "Model Context Protocol",
    "data governance",
    "AI agents",

    "audit",
  ],
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "Olrien  · One governed model of the company",
    description:
      "One front door for every person and AI tool. One digital model of your company.",
    siteName: "Noetira ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Noetira  · One governed model of the company",
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
      <head>
        <meta
          name="msvalidate.01"
          content="BD47A3581E607641356C6D66E17ABD32"
        />
      </head>
      <body
        className={`${inter.variable} ${premium.variable} ${jetbrains.variable} ${instrument.variable} font-sans antialiased bg-background text-foreground`}
      >
        <SmoothScroll />
        <Galaxy className="pointer-events-none fixed inset-0 -z-10" />
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
