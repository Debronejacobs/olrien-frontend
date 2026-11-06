import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { TrustMarquee } from "@/components/landing/trust-marquee";
import { Problem } from "@/components/landing/problem";
import { Ontology } from "@/components/landing/ontology";
import { Endpoint } from "@/components/landing/endpoint";
import { Deployment } from "@/components/landing/deployment";
import { GuardedCrud } from "@/components/landing/guarded-crud";
import { Tuesday } from "@/components/landing/tuesday";
import { DesignChoices } from "@/components/landing/design-choices";
import { Comparison } from "@/components/landing/comparison";
import { Roadmap } from "@/components/landing/roadmap";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
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
        <Ontology />
        <Endpoint />
        <Deployment />
        <GuardedCrud />
        <Tuesday />
        <DesignChoices />
        <Comparison />
        <Roadmap />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
