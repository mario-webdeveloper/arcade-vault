"use client";

import { useState } from "react";
import { GameCard } from "@/components/game-card";
import { CATS, GAMES } from "@/lib/games";

const DIACRITICS = /\p{M}/gu;

// "CAÍDA" and "caida" must match: strip accents and case on both sides.
function normalize(text: string): string {
  return text.normalize("NFD").replace(DIACRITICS, "").toLowerCase();
}

// Titles never change, so their search keys are computed once per module.
const INDEX = GAMES.map((game) => ({ game, key: normalize(game.title) }));

export function LibraryBrowser() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<(typeof CATS)[number]>("TODOS");

  const needle = normalize(query);
  const filtered = INDEX.filter(
    ({ game, key }) =>
      (cat === "TODOS" || game.cat === cat) && key.includes(needle),
  );

  return (
    <>
      <div className="mx-auto mt-8 flex max-w-[1320px] flex-wrap gap-3 px-4 min-[721px]:px-8">
        <div className="relative flex h-12 min-w-[220px] flex-1 items-center gap-2.5 border border-line bg-bg-2 px-4 font-mono focus-within:border-cyan focus-within:shadow-[0_0_12px_rgba(0,245,255,0.35)]">
          <span
            aria-hidden="true"
            className="font-pixel text-[11px] text-cyan"
          >
            ⌕
          </span>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar un juego por nombre…"
            aria-label="Buscar un juego por nombre"
            autoComplete="off"
            enterKeyHint="search"
            className="flex-1 border-0 bg-transparent text-[13px] tracking-[0.04em] text-ink outline-none placeholder:text-ink-faint"
          />
        </div>
        <div
          role="group"
          aria-label="Categorías"
          className="flex flex-wrap gap-2"
        >
          {CATS.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={cat === c}
              className={cat === c ? "chip active" : "chip"}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-8 mb-20 grid max-w-[1320px] grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[22px] px-4 min-[721px]:px-8">
        {filtered.map(({ game }) => (
          <GameCard key={game.id} game={game} />
        ))}
        {filtered.length === 0 && (
          <div
            role="status"
            className="col-span-full p-20 text-center text-ink-faint"
          >
            <div className="pixel mb-3 text-[14px] text-magenta">
              NO HAY RESULTADOS
            </div>
            <div>Intenta otra búsqueda o categoría.</div>
          </div>
        )}
      </div>
    </>
  );
}
