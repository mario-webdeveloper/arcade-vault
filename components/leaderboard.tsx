import type { ScoreRow } from "@/lib/scores";

// Top three ranks get the medal colours; the rest use the default ones.
const MEDAL = [
  "text-gold [text-shadow:0_0_6px_rgba(255,207,58,0.6)]",
  "text-silver [text-shadow:0_0_6px_rgba(199,208,224,0.5)]",
  "text-bronze [text-shadow:0_0_6px_rgba(217,122,58,0.5)]",
];

export function Leaderboard({ rows }: { rows: ScoreRow[] }) {
  return (
    <section
      aria-labelledby="leaderboard-title"
      className="border border-line bg-bg-2"
    >
      <h2
        id="leaderboard-title"
        className="border-b border-line px-4 py-3.5 font-pixel text-[11px] font-normal tracking-[0.14em] text-magenta [text-shadow:0_0_8px_rgba(255,0,110,0.5)]"
      >
        MEJORES PUNTUACIONES
      </h2>
      <ol>
        {rows.map((row, i) => (
          <li
            key={row.rank}
            className="grid grid-cols-[36px_1fr_110px] items-center gap-2.5 border-b border-line-2 px-4 py-2.5 font-mono text-[13px]"
          >
            <div
              className={`font-pixel text-[11px] ${MEDAL[i] ?? "text-ink-faint"}`}
            >
              #{String(row.rank).padStart(2, "0")}
            </div>
            <div className="text-ink">
              {row.name}
              <div className="text-[10px] tracking-[0.1em] text-ink-faint">
                {row.date}
              </div>
            </div>
            <div
              className={`text-right font-pixel text-[12px] ${MEDAL[i] ?? "text-cyan"}`}
            >
              {row.score.toLocaleString("es-ES")}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
