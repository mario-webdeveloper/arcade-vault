import { PixelIcon } from "@/components/pixel-icon";
import { SectionHead } from "@/components/section-head";
import { PILLARS } from "@/lib/about";
import type { Game } from "@/lib/games";

// Full class strings so Tailwind can see them; the card colour drives the top edge,
// the icon and the title (everything else stays in the body colour).
const TONE: Record<Game["color"], string> = {
  cyan: "text-cyan",
  magenta: "text-magenta",
  yellow: "text-yellow",
  green: "text-green",
};

/** "En qué creemos": four cards with a real paragraph each, one per neon colour. */
export function AboutPillars() {
  return (
    <section
      aria-labelledby="creemos-title"
      data-reveal
      className="mx-auto mt-4 max-w-[1320px] px-4 min-[721px]:mt-8 min-[721px]:px-8"
    >
      <SectionHead
        id="creemos-title"
        kicker="EN QUÉ CREEMOS"
        title="EN QUÉ CREEMOS"
        color="cyan"
      />
      <ul className="grid grid-cols-1 gap-[18px] min-[521px]:grid-cols-2 min-[981px]:grid-cols-4">
        {PILLARS.map(({ title, body, color, icon }) => (
          <li
            key={title}
            className={`flex flex-col gap-3.5 border border-t-2 border-line border-t-current bg-[image:linear-gradient(180deg,var(--bg-2),var(--bg-3))] px-5 py-6 transition-[translate,box-shadow] duration-200 hover:shadow-[0_18px_40px_-16px_currentColor] motion-safe:hover:-translate-y-1 ${TONE[color]}`}
          >
            <PixelIcon kind={icon} />
            <h3 className="font-pixel text-[12px] font-normal leading-[1.4] tracking-[0.1em] [text-shadow:0_0_8px_currentColor]">
              {title}
            </h3>
            <p className="text-[14px] leading-[1.65] text-ink-dim">{body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
