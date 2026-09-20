"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/components/session-provider";

const LIVES = 3; // decorative: there is no game engine yet
const POINTS_PER_LEVEL = 2500;

const STAT_LABEL =
  "font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint";
const STAT_VALUE = "font-pixel text-[16px]";

// Static markup: hoisted so the 220ms score ticks don't rebuild it.
const ARENA = (
  <div aria-hidden="true" className="game-arena">
    <div className="grid-floor" />
    <div className="enemy e1" />
    <div className="enemy e2" />
    <div className="enemy e3" />
    <div className="player-ship" />
  </div>
);

export function GamePlayer({ id, title }: { id: string; title: string }) {
  const { user } = useSession();
  const [score, setScore] = useState(0);
  const [paused, setPaused] = useState(false);
  const [over, setOver] = useState(false);

  // The clock and Math.random() only run after mount, never during render.
  useEffect(() => {
    if (paused || over) return;
    const timer = setInterval(
      () => setScore((s) => s + 10 + Math.floor(Math.random() * 90)),
      220,
    );
    return () => clearInterval(timer);
  }, [paused, over]);

  // Derived during render: no effect, so it can't fire more than once per level.
  const level = 1 + Math.floor(score / POINTS_PER_LEVEL);
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
              {score.toLocaleString("es-ES")}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className={STAT_LABEL}>Vidas</dt>
            <dd className={`${STAT_VALUE} text-magenta [text-shadow:0_0_6px_rgba(255,0,110,0.5)]`}>
              {Array.from({ length: LIVES }, () => "♥").join(" ")}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className={STAT_LABEL}>Nivel</dt>
            <dd className={`${STAT_VALUE} text-yellow [text-shadow:0_0_6px_rgba(245,255,0,0.5)]`}>
              {String(level).padStart(2, "0")}
            </dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            className="btn yellow"
            onClick={() => setPaused((p) => !p)}
          >
            {paused ? "REANUDAR" : "PAUSA"}
          </button>
          <button
            type="button"
            className="btn magenta"
            onClick={() => setOver(true)}
          >
            FIN
          </button>
          <Link href={`/juego/${id}`} className="btn ghost">
            SALIR
          </Link>
        </div>
      </div>

      <div className="crt">
        <div className="crt-screen">
          {ARENA}
          {paused && (
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
          )}
        </div>
        <div className="crt-bottom">
          <span className="led">SEÑAL OK</span>
          <span>{title} · CRT-83 · 60 HZ</span>
          <span>CARGA · 1MB</span>
        </div>
      </div>
    </div>
  );
}
