import { HomeCabinet } from "@/components/home-cabinet";
import { HomeHeroCtas } from "@/components/home-hero-ctas";

// Three of the prototype's eight silhouettes, drawn on a 4px grid. Each one sits in
// a div: the div floats (see `.home-silos` in globals.css), not the SVG.
const SILHOUETTES = (
  <div aria-hidden="true" className="home-silos">
    <div className="silo s1">
      <svg
        viewBox="0 0 40 32"
        fill="currentColor"
        shapeRendering="crispEdges"
        className="block w-full"
      >
        <rect x="6" y="4" width="4" height="4" />
        <rect x="30" y="4" width="4" height="4" />
        <rect x="2" y="8" width="36" height="4" />
        <rect x="2" y="12" width="4" height="4" />
        <rect x="14" y="12" width="4" height="4" />
        <rect x="22" y="12" width="4" height="4" />
        <rect x="34" y="12" width="4" height="4" />
        <rect x="2" y="16" width="36" height="4" />
        <rect x="6" y="20" width="4" height="4" />
        <rect x="30" y="20" width="4" height="4" />
      </svg>
    </div>
    <div className="silo s2">
      <svg
        viewBox="0 0 32 32"
        fill="currentColor"
        shapeRendering="crispEdges"
        className="block w-full"
      >
        <rect x="8" y="0" width="16" height="4" />
        <rect x="4" y="4" width="24" height="4" />
        <rect x="0" y="8" width="32" height="12" />
        <rect x="0" y="20" width="6" height="6" />
        <rect x="10" y="20" width="4" height="6" />
        <rect x="18" y="20" width="4" height="6" />
        <rect x="26" y="20" width="6" height="6" />
      </svg>
    </div>
    <div className="silo s3">
      <svg
        viewBox="0 0 32 32"
        fill="currentColor"
        shapeRendering="crispEdges"
        className="block w-full"
      >
        <rect x="10" y="0" width="12" height="4" />
        <rect x="6" y="4" width="20" height="4" />
        <rect x="4" y="8" width="6" height="6" />
        <rect x="22" y="8" width="6" height="6" />
        <rect x="2" y="14" width="28" height="10" />
        <rect x="6" y="24" width="4" height="4" />
        <rect x="14" y="24" width="4" height="4" />
        <rect x="22" y="24" width="4" height="4" />
      </svg>
    </div>
  </div>
);

/** Two columns: copy on the left, CRT cabinet on the right (below the copy under 900px). */
export function HomeHero() {
  return (
    <section className="overflow-x-clip">
      <div className="mx-auto grid min-h-[78svh] max-w-[1320px] items-center gap-12 px-4 pt-10 pb-14 min-[721px]:px-8 min-[900px]:grid-cols-[1.05fr_1fr] min-[900px]:py-16">
        <div className="min-w-0">
          <p className="neon-yellow mb-6 font-pixel text-[11px] uppercase leading-[1.25] tracking-[0.24em]">
            <span aria-hidden="true">▸ </span>
            INSERTA UNA MONEDA
            <span aria-hidden="true" className="blink">
              _
            </span>
          </p>
          <h1 className="flex flex-col gap-2 font-pixel text-[length:clamp(22px,6.6vw,50px)] leading-[1.05] tracking-[0.04em] min-[900px]:text-[length:clamp(28px,3.4vw,48px)]">
            <span className="text-white [text-shadow:0_0_14px_rgba(255,255,255,0.4)]">
              EL ARCADE
            </span>
            <span className="bg-[image:linear-gradient(180deg,var(--cyan),#4dd0e1)] bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(0,245,255,0.45)]">
              CLÁSICO ESTÁ
            </span>
            <span className="bg-[image:linear-gradient(180deg,var(--magenta),#ff6b9e)] bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(255,0,110,0.45)]">
              DE VUELTA
            </span>
          </h1>
          <p className="mt-7 mb-9 max-w-[520px] text-[15px] leading-[1.7] tracking-[0.04em] text-ink-dim">
            Ocho clásicos en tu navegador. Sin descargas, sin cuenta
            obligatoria, sin costo.
          </p>
          <HomeHeroCtas />
          <p className="mt-5 font-mono text-[12px] tracking-[0.06em] text-ink-faint">
            Entra con cualquier nombre. Tus marcas se guardan en este
            navegador.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-[560px] min-[900px]:max-w-none">
          {SILHOUETTES}
          <div className="relative z-[1]">
            <HomeCabinet />
          </div>
        </div>
      </div>
    </section>
  );
}
