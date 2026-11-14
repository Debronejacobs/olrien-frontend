import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { TrustMarquee } from "@/components/landing/trust-marquee";
import { Problem } from "@/components/landing/problem";
import { Endpoint } from "@/components/landing/endpoint";
import { Faq } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";
import { ScrollRail } from "@/components/landing/scroll-rail";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <ScrollRail />
      <main className="flex-1">
        <Hero />
        <TrustMarquee />
        <Problem />
        <Endpoint />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
