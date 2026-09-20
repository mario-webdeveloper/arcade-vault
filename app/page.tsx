import Link from "next/link";
import { GameCard } from "@/components/game-card";
import { HomeActivity } from "@/components/home-activity";
import { HomeClosing } from "@/components/home-closing";
import { HomeFeatures } from "@/components/home-features";
import { HomeHero } from "@/components/home-hero";
import { HomeStats } from "@/components/home-stats";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SectionHead } from "@/components/section-head";
import { FEATURED, VAULT_STATS } from "@/lib/home";

export default function Home() {
  return (
    <div className="fade-in">
      <HomeHero />
      <HomeStats />
      <HomeFeatures />
      <section
        aria-labelledby="catalogo-title"
        data-reveal
        className="mx-auto mt-16 max-w-[1320px] px-4 min-[721px]:mt-24 min-[721px]:px-8"
      >
        <SectionHead
          id="catalogo-title"
          kicker="CATÁLOGO"
          title="JUEGOS EN EL VAULT"
          color="cyan"
        />
        {/* Explicit columns instead of auto-fill: 4 cards would leave a lone card on
            the second row at 3 columns (950–1250px). Same cards, same 280px minimum;
            the 900px cap keeps the 2x2 cards from ballooning just below 1250px. */}
        <div className="mx-auto grid max-w-[900px] grid-cols-1 gap-[22px] min-[621px]:grid-cols-2 min-[1250px]:max-w-none min-[1250px]:grid-cols-4">
          {FEATURED.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/biblioteca" className="btn lg">
            VER LOS {VAULT_STATS.games} JUEGOS <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
      <HomeActivity />
      <HomeClosing />
      <ScrollReveal />
    </div>
  );
}
