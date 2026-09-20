import { CATS, GAMES } from "@/lib/games";
import type { Game } from "@/lib/games";

export type ActivityEntry = {
  player: string;
  game: string;
  score: number;
  ago: string; // fixed string, never computed: the Home is prerendered
  color: Game["color"];
};

export type TopPlayer = { rank: number; player: string; score: number };

// Mock activity. `game` and `color` mirror the matching entry in GAMES.
export const RECENT_SCORES: ActivityEntry[] = [
  { player: "NEONFOX", game: "CAÍDA", score: 184220, ago: "hace 2 min", color: "magenta" },
  { player: "PX_KAI", game: "GLOTÓN", score: 96400, ago: "hace 5 min", color: "yellow" },
  { player: "Z3R0COOL", game: "INVASORES", score: 54190, ago: "hace 8 min", color: "green" },
  { player: "VAULT_07", game: "ROCAS", score: 41200, ago: "hace 12 min", color: "yellow" },
  { player: "GLITCHA", game: "BLOQUE BUSTER", score: 28450, ago: "hace 18 min", color: "cyan" },
  { player: "ARKADYA", game: "SERPENTINA", score: 7820, ago: "hace 24 min", color: "green" },
  { player: "CYBER_LU", game: "RANARIA", score: 18900, ago: "hace 31 min", color: "green" },
];

// Best run of each of today's top players; never above the catalog's best mark.
export const TOP_TODAY: TopPlayer[] = [
  { rank: 1, player: "NEONFOX", score: 184220 },
  { rank: 2, player: "PX_KAI", score: 96400 },
  { rank: 3, player: "Z3R0COOL", score: 54190 },
  { rank: 4, player: "VAULT_07", score: 41200 },
  { rank: 5, player: "GLITCHA", score: 28450 },
];

// Derived at module scope so a ninth game shows up in the Home on its own.
export const FEATURED: Game[] = GAMES.toSorted((a, b) => b.best - a.best).slice(0, 4);

export const VAULT_STATS: { games: number; cats: number; bestScore: number } = {
  games: GAMES.length,
  cats: CATS.filter((cat) => cat !== "TODOS").length,
  bestScore: FEATURED[0].best,
};
