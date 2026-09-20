import { PixelIcon } from "@/components/pixel-icon";
import type { PixelIconKind } from "@/components/pixel-icon";
import { SectionHead } from "@/components/section-head";
import type { Game } from "@/lib/games";

// Full class strings so Tailwind can see them; the card colour drives border, glow and title.
const TONE: Record<Game["color"], string> = {
  cyan: "text-cyan",
  magenta: "text-magenta",
  yellow: "text-yellow",
  green: "text-green",
};

const FEATURES: {
  icon: PixelIconKind;
  title: string;
  text: string;
  color: Game["color"];
}[] = [
  {
    icon: "gamepad",
    title: "OCHO CLÁSICOS",
    text: "Arcade, puzzle, shooter y versus: ocho juegos de siempre reunidos en un solo catálogo.",
    color: "cyan",
  },
  {
    icon: "gratis",
    title: "SIN COSTO",
    text: "Sin suscripciones, sin tarjeta y sin pagos ocultos. Todo el catálogo es gratis.",
    color: "yellow",
  },
  {
    icon: "trofeo",
    title: "RANKING GLOBAL",
    text: "Cada juego tiene su tabla de puntuaciones, y el Salón de la Fama reúne las mejores marcas.",
    color: "magenta",
  },
  {
    icon: "cohete",
    title: "PROYECTO ABIERTO",
    text: "El Vault se construye a la vista, paso a paso. Hoy tienes el catálogo y las puntuaciones; los juegos jugables llegan después.",
    color: "green",
  },
];

export function HomeFeatures() {
  return (
    <section
      aria-labelledby="por-que-title"
      data-reveal
      className="mx-auto mt-16 max-w-[1320px] px-4 min-[721px]:mt-24 min-[721px]:px-8"
    >
      <SectionHead
        id="por-que-title"
        kicker="POR QUÉ"
        title="LO QUE OFRECE ARCADE VAULT"
        color="magenta"
      />
      <ul className="grid grid-cols-1 gap-[18px] min-[521px]:grid-cols-2 min-[981px]:grid-cols-4">
        {FEATURES.map(({ icon, title, text, color }) => (
          <li
            key={title}
            className={`flex flex-col gap-3.5 border border-line bg-[image:linear-gradient(180deg,var(--bg-2),var(--bg-3))] px-5 py-6 transition-[translate,box-shadow,border-color] duration-200 hover:border-current hover:shadow-[0_18px_40px_-16px_currentColor,0_0_0_1px_currentColor] motion-safe:hover:-translate-y-1.5 ${TONE[color]}`}
          >
            <PixelIcon kind={icon} />
            <h3 className="font-pixel text-[12px] font-normal leading-[1.4] tracking-[0.1em] [text-shadow:0_0_8px_currentColor]">
              {title}
            </h3>
            <p className="text-[13px] leading-[1.6] text-ink-dim">{text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
