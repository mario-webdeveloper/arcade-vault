import { HomeHero } from "@/components/home-hero";
import { HomeStats } from "@/components/home-stats";
import { ScrollReveal } from "@/components/scroll-reveal";

export default function Home() {
  return (
    <div className="fade-in">
      <HomeHero />
      <HomeStats />
      <ScrollReveal />
    </div>
  );
}
