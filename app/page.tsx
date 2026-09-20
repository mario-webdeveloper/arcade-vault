import { HomeHero } from "@/components/home-hero";
import { ScrollReveal } from "@/components/scroll-reveal";

export default function Home() {
  return (
    <div className="fade-in">
      <HomeHero />
      <ScrollReveal />
    </div>
  );
}
