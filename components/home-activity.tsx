import Link from "next/link";
import { SectionHead } from "@/components/section-head";
import type { Game } from "@/lib/games";
import { RECENT_SCORES, TOP_TODAY } from "@/lib/home";

const NEON: Record<Game["color"], string> = {
  cyan: "neon-cyan",
  magenta: "neon-magenta",
  yellow: "neon-yellow",
  green: "neon-green",
};

// Top three ranks get gold / silver / bronze; the rest use the default cyan.
const RANK_TONE = [
  {
    text: "text-gold [text-shadow:0_0_6px_rgba(255,207,58,0.6)]",
    bar: "bg-gold shadow-[0_0_8px_rgba(255,207,58,0.6)]",
  },
  {
    text: "text-silver [text-shadow:0_0_6px_rgba(199,208,224,0.5)]",
    bar: "bg-silver shadow-[0_0_8px_rgba(199,208,224,0.5)]",
  },
  {
    text: "text-bronze [text-shadow:0_0_6px_rgba(217,122,58,0.5)]",
    bar: "bg-bronze shadow-[0_0_8px_rgba(217,122,58,0.5)]",
  },
];
const DEFAULT_TONE = {
  text: "text-cyan [text-shadow:0_0_6px_rgba(0,245,255,0.4)]",
  bar: "bg-cyan shadow-[0_0_8px_rgba(0,245,255,0.5)]",
};

// Bars are relative to the best of the list, not to a fixed maximum.
const TOP_SCORE = Math.max(...TOP_TODAY.map((entry) => entry.score));

const CARD = "flex flex-col border border-line bg-bg-2";
const CARD_HEAD =
  "flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-line px-3.5 py-3";
const CARD_TITLE =
  "font-pixel text-[10px] font-normal leading-[1.4] tracking-[0.1em]";

/** Mock activity: latest scores and today's top players, labelled as demo data. */
export function HomeActivity() {
  return (
    <section
      aria-labelledby="actividad-title"
      data-reveal
      className="mx-auto mt-16 max-w-[1320px] px-4 min-[721px]:mt-24 min-[721px]:px-8"
    >
      <SectionHead
        id="actividad-title"
        kicker="ACTIVIDAD"
        title="MARCAS RECIENTES"
        color="yellow"
      />
      <div className="grid grid-cols-1 gap-[18px] min-[901px]:grid-cols-[1.2fr_1fr]">
        <div className={CARD}>
          <div className={CARD_HEAD}>
            <h3 className={`${CARD_TITLE} neon-cyan`}>
              <span aria-hidden="true">▸ </span>
              ÚLTIMAS PUNTUACIONES
            </h3>
            <span className="border border-dashed border-yellow/50 px-2 py-1 font-pixel text-[9px] tracking-[0.14em] text-yellow">
              DATOS DE DEMOSTRACIÓN
            </span>
          </div>
          {/* Rows react to the list's own width, not the viewport: below 500px they
              take two lines (player + score / game + time), above it a single
              line on fixed columns so every row lines up. */}
          <ol className="@container divide-y divide-line-2">
            {RECENT_SCORES.map(({ player, game, score, ago, color }) => (
              <li
                key={player}
                className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 px-[18px] py-3 @min-[500px]:grid-cols-[112px_minmax(0,1fr)_100px_96px]"
              >
                <span
                  className={`font-pixel text-[10px] tracking-[0.06em] ${NEON[color]}`}
                >
                  {player}
                </span>
                <span className="order-3 text-[12px] text-ink-dim @min-[500px]:order-none">
                  <span aria-hidden="true">▸ </span>
                  {game}
                </span>
                <span className="order-2 text-right font-pixel text-[11px] text-yellow [text-shadow:0_0_6px_rgba(245,255,0,0.5)] @min-[500px]:order-none">
                  +{score.toLocaleString("es-ES")}
                </span>
                <span className="order-4 text-right text-[11px] tracking-[0.08em] text-ink-faint @min-[500px]:order-none">
                  {ago}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className={CARD}>
          <div className={CARD_HEAD}>
            <h3 className={`${CARD_TITLE} neon-magenta`}>
              <span aria-hidden="true">▸ </span>
              TOP JUGADORES · HOY
            </h3>
          </div>
          <ol className="divide-y divide-line-2">
            {TOP_TODAY.map(({ rank, player, score }, i) => {
              const tone = RANK_TONE[i] ?? DEFAULT_TONE;
              return (
                <li
                  key={rank}
                  className="grid grid-cols-[36px_1fr_auto] items-center gap-x-2.5 px-[18px] py-3"
                >
                  <span className={`font-pixel text-[10px] ${i < 3 ? tone.text : "text-ink-faint"}`}>
                    #{String(rank).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <div className="font-pixel text-[11px] tracking-[0.06em] text-ink">
                      {player}
                    </div>
                    <div aria-hidden="true" className="mt-2 h-1.5 bg-line-2">
                      <div
                        className={`h-full ${tone.bar}`}
                        style={{ width: `${(score / TOP_SCORE) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className={`font-pixel text-[11px] ${tone.text}`}>
                    {score.toLocaleString("es-ES")}
                  </span>
                </li>
              );
            })}
          </ol>
          <div className="mt-auto border-t border-line-2 px-[18px] py-3">
            <Link
              href="/salon"
              className="inline-flex min-h-11 items-center gap-2 border border-line px-3 font-pixel text-[9px] tracking-[0.14em] text-ink-dim transition-colors hover:border-magenta hover:text-magenta hover:shadow-[0_0_8px_rgba(255,0,110,0.35)]"
            >
              VER SALÓN <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
