"use client";

import Link from "next/link";
import { useRef, type PointerEvent } from "react";
import { GameCover } from "@/components/game-cover";
import type { Game } from "@/lib/games";

// Tilt only for precise pointers and users who did not ask for less motion.
const TILT_QUERY =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

const BUTTON_COLOR: Record<Game["color"], string> = {
  cyan: "",
  magenta: "magenta",
  yellow: "yellow",
  green: "",
};

const CARD =
  "relative flex flex-col gap-3.5 border border-line bg-[image:linear-gradient(180deg,var(--bg-2),var(--bg-3))] p-3.5 transform-3d will-change-transform [transition:transform_180ms_ease,box-shadow_220ms_ease,border-color_220ms_ease] " +
  "before:pointer-events-none before:absolute before:-inset-px before:bg-[image:linear-gradient(135deg,transparent_60%,rgba(0,245,255,0.4))] before:opacity-0 before:transition-opacity before:duration-[180ms] " +
  "hover:border-cyan hover:shadow-[0_18px_40px_-10px_rgba(0,245,255,0.4),0_0_0_1px_rgba(0,245,255,0.3)] hover:before:opacity-50 motion-safe:hover:[transform:translateY(-6px)_rotateX(2deg)_rotateY(-2deg)] " +
  "focus-visible:border-cyan focus-visible:shadow-[0_18px_40px_-10px_rgba(0,245,255,0.4),0_0_0_1px_rgba(0,245,255,0.3)]";

export function GameCard({ game }: { game: Game }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const canTilt = useRef(false);

  const onPointerEnter = () => {
    canTilt.current = window.matchMedia(TILT_QUERY).matches;
  };

  // Transient, high-frequency value: written straight to the DOM, no state.
  const onPointerMove = (event: PointerEvent<HTMLAnchorElement>) => {
    const el = cardRef.current;
    if (!el || !canTilt.current) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `translateY(-6px) rotateX(${-py * 6}deg) rotateY(${px * 8}deg)`;
  };

  const onPointerLeave = () => {
    cardRef.current?.style.removeProperty("transform");
  };

  return (
    <Link
      ref={cardRef}
      href={`/juego/${game.id}`}
      className={CARD}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div className="relative aspect-[4/3] overflow-hidden border border-line-2">
        <GameCover cover={game.cover} />
        <span className="absolute bottom-2 left-2 z-[2] border border-line bg-black/60 px-1.5 py-1 font-pixel text-[8px] text-cyan">
          {game.cat}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="font-pixel text-[13px] tracking-[0.06em] text-ink">
          {game.title}
        </div>
        <div className="min-h-9 text-[12px] text-ink-dim">{game.short}</div>
        <div className="mt-1 flex items-center justify-between gap-2.5">
          <div className="flex flex-col font-mono text-[10px] uppercase tracking-[0.08em] text-ink-faint">
            <span>MEJOR PUNTUACIÓN</span>
            <b className="font-pixel text-[12px] font-normal tracking-[0.06em] text-yellow [text-shadow:0_0_6px_rgba(245,255,0,0.6)]">
              {game.best.toLocaleString("es-ES")}
            </b>
          </div>
          {/* looks like a button, but the whole card is the single link */}
          <span className={`btn ${BUTTON_COLOR[game.color]}`}>JUGAR</span>
        </div>
      </div>
    </Link>
  );
}
