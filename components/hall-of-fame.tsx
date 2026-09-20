"use client";

import { Fragment, useState } from "react";
import { useSession } from "@/components/session-provider";
import { GAMES } from "@/lib/games";
import { seededScores, type ScoreRow } from "@/lib/scores";

// Seeded, so the board is identical on server and client. Built once per module.
const BOARDS: Record<string, ScoreRow[]> = Object.fromEntries(
  GAMES.map((game) => [game.id, seededScores(game.id.length * 23 + 7, 12)]),
);

type Tone = "gold" | "silver" | "bronze";

const PODIUM: Record<Tone, { box: string; rank: string; score: string }> = {
  gold: {
    box: "border-gold shadow-[0_0_22px_rgba(255,207,58,0.35)]",
    rank: "mt-1 text-[36px] text-gold",
    score: "text-[20px]",
  },
  silver: { box: "border-silver", rank: "text-[28px] text-silver", score: "text-[16px]" },
  bronze: { box: "border-bronze", rank: "text-[28px] text-bronze", score: "text-[16px]" },
};

// Table tones for ranks #1-#3; the rest fall back to the default look.
const CYAN_GLOW = "[text-shadow:0_0_6px_rgba(0,245,255,0.4)]";
const RANK_TONE = [
  "text-gold [text-shadow:0_0_6px_rgba(255,207,58,0.6)]",
  "text-silver",
  "text-bronze",
];
const SCORE_TONE = [
  "text-gold [text-shadow:0_0_6px_rgba(255,207,58,0.6)]",
  `text-silver ${CYAN_GLOW}`,
  `text-bronze ${CYAN_GLOW}`,
];

const TH =
  "border-b border-line px-[5px] py-2.5 text-left font-pixel text-[10px] font-normal tracking-[0.16em] text-ink-faint first:pl-3 last:pr-3 min-[721px]:py-3 min-[721px]:first:pl-[18px] min-[721px]:last:pr-[18px]";
const TD =
  "px-[5px] py-2.5 first:pl-3 last:pr-3 min-[721px]:py-3 min-[721px]:first:pl-[18px] min-[721px]:last:pr-[18px]";
// "Your row" has a 3px left accent, so its first cell gives that much padding back.
const TD_YOU =
  "px-[5px] py-2.5 first:pl-[9px] last:pr-3 min-[721px]:py-3 min-[721px]:first:pl-[15px] min-[721px]:last:pr-[18px]";

function PodiumSlot({ row, tone }: { row: ScoreRow; tone: Tone }) {
  const t = PODIUM[tone];
  return (
    <div className={`relative border bg-bg-2 px-3.5 pt-[18px] pb-4 text-center ${t.box}`}>
      {tone === "gold" && (
        <div className="font-pixel text-[9px] leading-[1.25] tracking-[0.18em] text-gold">
          CAMPEÓN
        </div>
      )}
      <div className={`font-pixel [text-shadow:0_0_12px_currentColor] ${t.rank}`}>
        {String(row.rank).padStart(2, "0")}
      </div>
      <div className="mt-2 font-pixel text-[12px] tracking-[0.06em]">{row.name}</div>
      <div
        className={`mt-2 font-pixel text-cyan [text-shadow:0_0_8px_rgba(0,245,255,0.5)] ${t.score}`}
      >
        {row.score.toLocaleString("es-ES")}
      </div>
      <div className="mt-1.5 font-mono text-[11px] tracking-[0.12em] text-ink-faint">
        {row.date}
      </div>
    </div>
  );
}

export function HallOfFame() {
  const { user } = useSession();
  const [gameId, setGameId] = useState(GAMES[0].id);

  const game = GAMES.find((g) => g.id === gameId) ?? GAMES[0];
  const rows = BOARDS[game.id];
  const [first, second, third] = rows;

  // Same mock formula as the prototype for "your best mark".
  const youRank = 8 + (game.id.length % 4);
  const youScore = rows[5].score - 2400;

  return (
    <>
      <div
        role="group"
        aria-label="Juego"
        className="mb-[22px] flex flex-wrap justify-center gap-1.5"
      >
        {GAMES.map((g) => (
          <button
            key={g.id}
            type="button"
            aria-pressed={g.id === game.id}
            className={g.id === game.id ? "chip active" : "chip"}
            onClick={() => setGameId(g.id)}
          >
            {g.title}
          </button>
        ))}
      </div>

      {/* visual order: silver, gold, bronze */}
      <div className="mb-6 grid grid-cols-1 items-end gap-3.5 min-[721px]:grid-cols-[1fr_1.2fr_1fr]">
        <PodiumSlot row={second} tone="silver" />
        <PodiumSlot row={first} tone="gold" />
        <PodiumSlot row={third} tone="bronze" />
      </div>

      <div className="border border-line bg-bg-2">
        <table className="w-full table-fixed border-collapse font-mono text-[12px] min-[721px]:text-[13px]">
          <caption className="sr-only">Mejores puntuaciones de {game.title}</caption>
          {/* widths include cell padding. Desktop: rank 70 + 18 + 5, date 140 + 5 + 18.
              Mobile: sized to the content so names keep the rest of the row at 360px */}
          <colgroup>
            <col className="w-[55px] min-[721px]:w-[93px]" />
            <col />
            <col className="w-[96px] min-[721px]:w-auto" />
            <col className="w-[92px] min-[721px]:w-[163px]" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className={TH}>RANGO</th>
              <th scope="col" className={TH}>JUGADOR</th>
              <th scope="col" className={TH}>PUNTUACIÓN</th>
              <th scope="col" className={TH}>FECHA</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              // keyed by game so switching tabs replays the staggered entrance
              <tr
                key={`${game.id}-${row.rank}`}
                className="rise border-b border-line-2"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <td className={`${TD} font-pixel text-[11px] ${RANK_TONE[i] ?? "text-ink-dim"}`}>
                  #{String(row.rank).padStart(2, "0")}
                </td>
                <td className={`${TD} text-ink`}>{row.name}</td>
                <td className={`${TD} font-pixel text-[12px] ${SCORE_TONE[i] ?? `text-cyan ${CYAN_GLOW}`}`}>
                  {row.score.toLocaleString("es-ES")}
                </td>
                <td className={`${TD} text-ink-faint`}>{row.date}</td>
              </tr>
            ))}
            {user && (
              <Fragment key={`you-${game.id}`}>
                <tr className="rise border-b border-line-2 bg-[rgba(245,255,0,0.04)]">
                  <td
                    colSpan={4}
                    className="px-3 py-2 font-pixel text-[9px] tracking-[0.16em] text-yellow min-[721px]:px-[18px]"
                  >
                    ▸ TU MEJOR MARCA EN {game.title}
                  </td>
                </tr>
                <tr
                  className="rise border-b border-line-2 bg-[rgba(245,255,0,0.05)]"
                  style={{ animationDelay: `${rows.length * 50 + 50}ms` }}
                >
                  <td
                    className={`${TD_YOU} border-l-[3px] border-yellow font-pixel text-[11px] text-yellow`}
                  >
                    #{String(youRank).padStart(2, "0")}
                  </td>
                  <td className={`${TD_YOU} text-yellow`}>{user.name}</td>
                  <td
                    className={`${TD_YOU} font-pixel text-[12px] text-yellow [text-shadow:0_0_6px_rgba(245,255,0,0.5)]`}
                  >
                    {(youScore || 9999).toLocaleString("es-ES")}
                  </td>
                  <td className={`${TD_YOU} text-ink-faint`}>11/05/2026</td>
                </tr>
              </Fragment>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
