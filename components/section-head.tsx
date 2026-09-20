import type { Game } from "@/lib/games";

const KICKER_COLOR: Record<Game["color"], string> = {
  cyan: "neon-cyan",
  magenta: "neon-magenta",
  yellow: "neon-yellow",
  green: "neon-green",
};

/** Section header: neon kicker + `<h2>` + fading rule. Pass `id` to label the parent `<section>`. */
export function SectionHead({
  kicker,
  title,
  color,
  id,
}: {
  kicker: string;
  title: string;
  color: Game["color"];
  id?: string;
}) {
  return (
    <div className="mb-9 flex flex-col items-start gap-2.5 min-[721px]:flex-row min-[721px]:items-center min-[721px]:gap-[18px]">
      <p
        className={`font-pixel text-[11px] uppercase leading-[1.25] tracking-[0.22em] ${KICKER_COLOR[color]}`}
      >
        <span aria-hidden="true">▸ </span>
        {kicker}
      </p>
      <h2
        id={id}
        className="font-pixel text-[length:clamp(18px,2.8vw,28px)] font-normal tracking-[0.06em] text-ink"
      >
        {title}
      </h2>
      <div
        aria-hidden="true"
        className="h-px w-full bg-[image:linear-gradient(90deg,var(--line),transparent)] min-[721px]:w-auto min-[721px]:flex-1"
      />
    </div>
  );
}
