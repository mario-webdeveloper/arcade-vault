import type { Metadata } from "next";
import { AboutHero } from "@/components/about-hero";
import { AboutPillars } from "@/components/about-pillars";
import { ScrollReveal } from "@/components/scroll-reveal";

export const metadata: Metadata = {
  title: "Acerca de · Arcade Vault",
  description:
    "Qué es Arcade Vault, en qué creemos, en qué punto está el proyecto y cómo escribirnos.",
};

export default function AboutPage() {
  return (
    <div className="fade-in">
      <AboutHero />
      <AboutPillars />
      <ScrollReveal />
    </div>
  );
}
