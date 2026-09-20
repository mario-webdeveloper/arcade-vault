import { AboutPlate } from "@/components/about-plate";

/** Asymmetric hero: mission copy on the left, project plate on the right (below the copy under 900px). */
export function AboutHero() {
  return (
    <section className="overflow-x-clip">
      <div className="mx-auto grid max-w-[1320px] items-center gap-12 px-4 pt-10 pb-16 min-[721px]:gap-14 min-[721px]:px-8 min-[721px]:pt-14 min-[900px]:grid-cols-[1.05fr_1fr] min-[900px]:gap-12 min-[900px]:py-20">
        <div className="min-w-0">
          <p className="neon-yellow mb-6 font-pixel text-[11px] uppercase leading-[1.25] tracking-[0.24em]">
            <span aria-hidden="true">▸ </span>
            ACERCA DE
          </p>
          {/* "QUE NOS MARCARON" is 16 glyphs of Press Start 2P (1em each): the size is
              capped so the longest line always fits its column, from 320px up. */}
          <h1 className="flex flex-col gap-2 font-pixel text-[length:clamp(14px,5.2vw,44px)] leading-[1.1] tracking-[0.04em] min-[900px]:text-[length:clamp(20px,2.6vw,36px)]">
            <span className="text-white [text-shadow:0_0_14px_rgba(255,255,255,0.4)]">
              GUARDAMOS
            </span>
            <span className="bg-[image:linear-gradient(180deg,var(--cyan),#4dd0e1)] bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(0,245,255,0.45)]">
              LOS ARCADES
            </span>
            <span className="bg-[image:linear-gradient(180deg,var(--magenta),#ff6b9e)] bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(255,0,110,0.45)]">
              QUE NOS MARCARON
            </span>
          </h1>
          <div className="mt-7 flex max-w-[540px] flex-col gap-4 text-[15px] leading-[1.7] tracking-[0.04em] text-ink-dim">
            <p>
              Arcade Vault nació del amor por los clásicos y quiere preservar y
              celebrar los arcades que definieron una generación. Vault
              significa bóveda: un lugar donde se guarda lo que importa.
            </p>
            <p>
              Hoy es un portal en construcción. El catálogo, el salón de la fama
              y la mecánica de puntuación ya están dibujados; los juegos llegan
              después.
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[560px] min-[900px]:max-w-none">
          <AboutPlate />
        </div>
      </div>
    </section>
  );
}
