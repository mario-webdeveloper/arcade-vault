"use client";

import type { PointerEvent } from "react";
import type { AsteroidsAction } from "@/games/asteroides/engine";

type Pad = {
  action: AsteroidsAction;
  glyph: string;
  label: string;
  tone: string;
};

// Left thumb steers, right thumb thrusts and fires, like a cabinet panel.
const STEER: Pad[] = [
  { action: "left", glyph: "◄", label: "Girar a la izquierda", tone: "cyan" },
  { action: "right", glyph: "►", label: "Girar a la derecha", tone: "cyan" },
];
const ENGINE: Pad[] = [
  { action: "thrust", glyph: "▲", label: "Propulsar", tone: "yellow" },
  { action: "fire", glyph: "FUEGO", label: "Disparar", tone: "magenta" },
];

// Static per tone, so Tailwind sees every class literally.
const TONES: Record<string, string> = {
  cyan: "border-cyan text-cyan data-[pressed]:bg-cyan/20 data-[pressed]:shadow-[0_0_18px_rgba(0,245,255,0.6)]",
  yellow: "border-yellow text-yellow data-[pressed]:bg-yellow/20 data-[pressed]:shadow-[0_0_18px_rgba(245,255,0,0.6)]",
  magenta: "border-magenta text-magenta data-[pressed]:bg-magenta/20 data-[pressed]:shadow-[0_0_18px_rgba(255,0,110,0.6)]",
};

const PAD =
  "flex h-16 min-w-16 select-none items-center justify-center border bg-bg-2 px-4 font-pixel text-[14px] tracking-[0.12em] [clip-path:polygon(8px_0,100%_0,100%_calc(100%_-_8px),calc(100%_-_8px)_100%,0_100%,0_8px)] [touch-action:none] [-webkit-touch-callout:none] data-[pressed]:scale-95";

/**
 * On-screen pad for touch screens, below the CRT. Holding a button is holding
 * the key. Hidden unless the primary pointer is coarse. The pressed look is a
 * data attribute set on the element, so pressing never re-renders React.
 */
export function AsteroidsTouchControls({
  onAction,
}: {
  onAction: (action: AsteroidsAction, down: boolean) => void;
}) {
  const press = (action: AsteroidsAction) => (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault(); // no focus, no text selection, no synthetic click
    event.currentTarget.dataset.pressed = "";
    onAction(action, true);
  };
  const release = (action: AsteroidsAction) => (event: PointerEvent<HTMLButtonElement>) => {
    if (!("pressed" in event.currentTarget.dataset)) return;
    delete event.currentTarget.dataset.pressed;
    onAction(action, false);
  };

  const renderPad = ({ action, glyph, label, tone }: Pad) => (
    <button
      key={action}
      type="button"
      aria-label={label}
      className={`${PAD} ${TONES[tone]}`}
      onPointerDown={press(action)}
      onPointerUp={release(action)}
      onPointerCancel={release(action)}
      onPointerLeave={release(action)}
      onContextMenu={(event) => event.preventDefault()}
    >
      <span aria-hidden="true">{glyph}</span>
    </button>
  );

  return (
    <div
      role="group"
      aria-label="Controles táctiles"
      className="mt-5 hidden items-center justify-between gap-4 pointer-coarse:flex"
    >
      <div className="flex gap-3">{STEER.map(renderPad)}</div>
      <div className="flex gap-3">{ENGINE.map(renderPad)}</div>
    </div>
  );
}
