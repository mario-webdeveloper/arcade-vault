import type { Metadata } from "next";
import { LibraryBrowser } from "@/components/library-browser";
import { getGameStats } from "@/lib/leaderboard";

export const metadata: Metadata = {
  title: "Biblioteca · Arcade Vault",
  description:
    "Catálogo de juegos retro de Arcade Vault: busca por nombre y filtra por categoría.",
};

// ISR: the real best score refreshes at most every 60 s, and right away after
// a save through revalidatePath.
export const revalidate = 60;

export default async function LibraryPage() {
  // Only asteroides has real stats; the other cards keep their static best.
  const asteroides = await getGameStats("asteroides");

  return (
    <div className="fade-in">
      <section className="mx-auto max-w-[1320px] px-4 pt-9 pb-4 text-center min-[721px]:px-8 min-[721px]:pt-16 min-[721px]:pb-8">
        <h1 className="flicker bg-[image:linear-gradient(180deg,#fff_0%,var(--cyan)_60%,var(--magenta)_110%)] bg-clip-text font-pixel text-[length:clamp(28px,6vw,64px)] tracking-[0.06em] text-transparent drop-shadow-[0_0_12px_rgba(0,245,255,0.4)]">
          ARCADE VAULT
        </h1>
        <div className="mt-[18px] font-pixel text-[length:clamp(10px,1.6vw,14px)] tracking-[0.2em] text-yellow">
          INSERTA UNA MONEDA PARA JUGAR <span className="blink">_</span>
        </div>
      </section>
      <LibraryBrowser realStats={{ asteroides }} />
    </div>
  );
}
