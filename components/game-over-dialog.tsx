"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession } from "@/components/session-provider";
import { NAME_MAX } from "@/lib/session";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Props = {
  gameId: string;
  score: number;
  /** Name shown in the initials field when the dialog opens. */
  initialName: string;
  onRestart: () => void;
};

export function GameOverDialog({ gameId, score, initialName, onRestart }: Props) {
  const { saveScore } = useSession();
  const dialogRef = useRef<HTMLDivElement>(null);
  // Mounted only when the game ends, so this is "the session name at open".
  const [name, setName] = useState(initialName);
  const [saved, setSaved] = useState(false);

  // Focus moves into the dialog on open, Tab wraps inside it, and focus
  // returns to whatever opened it on close. Esc deliberately does nothing:
  // the player must pick one of the three actions.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const opener = document.activeElement;
    dialog.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = dialog.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const inside = active !== dialog && dialog.contains(active);

      if (!inside) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, []);

  const save = () => {
    saveScore({ game: gameId, score, name });
    // The save button disappears: park focus on the dialog so it isn't lost.
    dialogRef.current?.focus();
    setSaved(true);
  };

  return (
    // mousedown on the backdrop itself is cancelled so it can't steal focus
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) event.preventDefault();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-over-title"
        tabIndex={-1}
        className="relative w-[min(480px,96vw)] border border-magenta bg-bg-2 p-8 text-center shadow-[0_0_30px_rgba(255,0,110,0.4),inset_0_0_16px_rgba(255,0,110,0.18)] outline-none before:pointer-events-none before:absolute before:inset-1 before:border before:border-dashed before:border-magenta/40"
      >
        <h2
          id="game-over-title"
          className="mb-[18px] font-pixel text-[22px] font-normal tracking-[0.12em] text-magenta [text-shadow:0_0_12px_rgba(255,0,110,0.7)]"
        >
          FIN DEL JUEGO
        </h2>
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
          PUNTUACIÓN FINAL
        </div>
        <div className="mt-4 mb-1.5 font-pixel text-4xl text-yellow [text-shadow:0_0_16px_rgba(245,255,0,0.6)]">
          {score.toLocaleString("es-ES")}
        </div>

        {saved ? (
          <div
            role="status"
            className="typewriter mt-3.5 inline-block overflow-hidden border-r-2 border-green font-pixel text-[11px] whitespace-nowrap text-green [text-shadow:0_0_8px_var(--green)]"
          >
            ▸ PUNTUACIÓN GUARDADA_
          </div>
        ) : (
          <div className="mt-[22px] mb-3 flex flex-wrap gap-2">
            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value.toUpperCase().slice(0, NAME_MAX))
              }
              placeholder="TUS INICIALES"
              aria-label="Tus iniciales"
              autoComplete="off"
              maxLength={NAME_MAX}
              className="h-11 min-w-[140px] flex-1 border border-line bg-bg px-3 font-mono outline-none focus:border-cyan focus:shadow-[0_0_10px_rgba(0,245,255,0.35)]"
            />
            <button type="button" className="btn yellow" onClick={save}>
              GUARDAR PUNTUACIÓN
            </button>
          </div>
        )}

        <div className="mt-[18px] flex flex-wrap justify-center gap-2.5">
          <button type="button" className="btn" onClick={onRestart}>
            JUGAR DE NUEVO
          </button>
          <Link href="/biblioteca" className="btn magenta">
            VOLVER AL VAULT
          </Link>
        </div>
      </div>
    </div>
  );
}
