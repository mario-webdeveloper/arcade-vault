import Link from "next/link";
import { notFound } from "next/navigation";
import { GameCover } from "@/components/game-cover";
import { Leaderboard } from "@/components/leaderboard";
import { GAMES, getGame } from "@/lib/games";
import { seededScores } from "@/lib/scores";

export function generateStaticParams() {
  return GAMES.map(({ id }) => ({ id }));
}

const TAGS = ["1 JUGADOR", "TECLADO / TÁCTIL", "RETRO 1985"];

const STAT_LABEL = "font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint";
// 11px below 721px: a 6-digit score at 16px overflows its cell at 375px
const STAT_VALUE = "mt-1.5 font-pixel text-[11px] min-[721px]:text-[16px]";

export default async function GameDetailPage(props: PageProps<"/juego/[id]">) {
  const { id } = await props.params;
  const game = getGame(id);
  if (!game) notFound();

  // Deterministic, so server render and reloads always show the same board.
  const scores = seededScores(id.length * 17 + 3, 10);

  return (
    <div className="fade-in mx-auto my-6 grid max-w-[1320px] grid-cols-1 gap-8 px-4 min-[721px]:my-12 min-[721px]:px-8 min-[901px]:grid-cols-[1.4fr_1fr]">
      <div>
        <div className="relative aspect-[16/10] overflow-hidden border border-line">
          <GameCover cover={game.cover} />
        </div>
        <div className="mt-5 flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {[game.cat, ...TAGS].map((tag) => (
              <span
                key={tag}
                className="border border-line px-2.5 py-1.5 font-pixel text-[9px] tracking-[0.12em] text-ink-dim"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="neon-cyan font-pixel text-[length:clamp(20px,3vw,32px)] tracking-[0.06em]">
            {game.title}
          </h1>
          <p className="text-sm leading-[1.7] text-ink-dim">{game.long}</p>
          <dl className="mt-2 grid grid-cols-3 gap-px border border-line bg-line">
            <div className="bg-bg-2 p-3.5">
              <dt className={STAT_LABEL}>Partidas</dt>
              <dd className={`${STAT_VALUE} text-cyan [text-shadow:0_0_6px_rgba(0,245,255,0.5)]`}>{game.plays}</dd>
            </div>
            <div className="bg-bg-2 p-3.5">
              <dt className={STAT_LABEL}>Mejor global</dt>
              <dd className={`${STAT_VALUE} text-magenta [text-shadow:0_0_6px_rgba(255,0,110,0.5)]`}>
                {game.best.toLocaleString("es-ES")}
              </dd>
            </div>
            <div className="bg-bg-2 p-3.5">
              <dt className={STAT_LABEL}>Dificultad</dt>
              <dd className={`${STAT_VALUE} text-yellow [text-shadow:0_0_6px_rgba(245,255,0,0.5)]`}>★ ★ ★ ☆ ☆</dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={`/juego/${game.id}/jugar`} className="btn xl pulse">
              ▶ JUGAR AHORA
            </Link>
            <Link href="/" className="btn ghost lg">
              VOLVER AL VAULT
            </Link>
          </div>
        </div>
      </div>

      <aside>
        <Leaderboard rows={scores} />
      </aside>
    </div>
  );
}
