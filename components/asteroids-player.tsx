"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { GameOverDialog } from "@/components/game-over-dialog";
import { useSession } from "@/components/session-provider";
import {
  createAsteroidsGame,
  type AsteroidsGame,
  type AsteroidsSnapshot,
} from "@/games/asteroides/engine";

const GAME_ID = "asteroides";

const STAT_LABEL =
  "font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint";
const STAT_VALUE = "font-pixel text-[16px]";

// Same values the engine starts with; its first onChange confirms them.
const INITIAL_SNAPSHOT: AsteroidsSnapshot = { score: 0, lives: 3, level: 1 };

export function AsteroidsPlayer({ title }: { title: string }) {
  const { user } = useSession();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<AsteroidsGame | null>(null);
  const [snap, setSnap] = useState(INITIAL_SNAPSHOT);
  const [paused, setPaused] = useState(false);
  const [over, setOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  // The engine owns the canvas, the loop and the keyboard; React only listens.
  // It only emits when a value changes, so this never re-renders per frame.
  // destroy() is idempotent, which keeps Strict Mode's double mount clean.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const game = createAsteroidsGame(canvas, {
      onChange: setSnap,
      onPauseChange: setPaused,
      onGameOver: (score) => {
        setFinalScore(score);
        setOver(true);
      },
    });
    gameRef.current = game;
    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, []);

  const restart = () => {
    setOver(false);
    gameRef.current?.restart();
  };

  const name = user?.name ?? "INVITADO";

  return (
    <div className="fade-in mx-auto my-8 max-w-[1100px] px-4 pb-8 min-[721px]:px-6 min-[721px]:pb-16">
      <h1 className="sr-only">{title}</h1>

      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-4 border border-line bg-bg-2 px-[18px] py-3.5">
        <dl className="flex flex-wrap gap-6">
          <div className="flex flex-col gap-1">
            <dt className={STAT_LABEL}>Jugador</dt>
            <dd className={`${STAT_VALUE} text-ink [text-shadow:0_0_6px_rgba(0,245,255,0.5)]`}>
              {name}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className={STAT_LABEL}>Puntuación</dt>
            <dd className={`${STAT_VALUE} text-cyan [text-shadow:0_0_6px_rgba(0,245,255,0.5)]`}>
              {snap.score.toLocaleString("es-ES")}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className={STAT_LABEL}>Vidas</dt>
            <dd className={`${STAT_VALUE} text-magenta [text-shadow:0_0_6px_rgba(255,0,110,0.5)]`}>
              <span aria-hidden="true">
                {snap.lives > 0 ? Array.from({ length: snap.lives }, () => "♥").join(" ") : "—"}
              </span>
              <span className="sr-only">{snap.lives}</span>
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className={STAT_LABEL}>Nivel</dt>
            <dd className={`${STAT_VALUE} text-yellow [text-shadow:0_0_6px_rgba(245,255,0,0.5)]`}>
              {String(snap.level).padStart(2, "0")}
            </dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            className="btn yellow"
            onClick={() => gameRef.current?.togglePause()}
          >
            {paused ? "REANUDAR" : "PAUSA"}
          </button>
          <button
            type="button"
            className="btn magenta"
            onClick={() => gameRef.current?.end()}
          >
            FIN
          </button>
          <Link href={`/juego/${GAME_ID}`} className="btn ghost">
            SALIR
          </Link>
        </div>
      </div>

      <div className="crt">
        <div className="crt-screen">
          {/* Not positioned, so the screen's scanline/vignette pseudo-elements
              paint over it. 800×600 internally, scaled by CSS: same 4:3. */}
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            role="img"
            aria-label={`${title}: área de juego`}
            className="block h-full w-full"
          />
          {paused ? (
            <div
              role="status"
              className="absolute inset-0 z-[5] flex items-center justify-center bg-black/60 text-center"
            >
              <div>
                <div className="pixel neon-yellow text-[22px]">EN PAUSA</div>
                <div className="mt-2.5 font-mono text-[11px] tracking-[0.16em] text-ink-dim">
                  PULSA REANUDAR PARA CONTINUAR
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <div className="crt-bottom">
          <span className="led">SEÑAL OK</span>
          <span>{title} · CRT-83 · 60 HZ</span>
          <span>CARGA · 1MB</span>
        </div>
      </div>

      {over ? (
        <GameOverDialog
          gameId={GAME_ID}
          score={finalScore}
          initialName={name}
          onRestart={restart}
        />
      ) : null}
    </div>
  );
}
