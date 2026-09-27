import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import type { ScoreRow } from "@/lib/scores";

export type GameStats = { best: number; plays: number };

// dd/mm/aaaa in UTC, so the server output never depends on the machine's zone.
function formatDate(iso: string) {
  const d = new Date(iso);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const mon = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${day}/${mon}/${d.getUTCFullYear()}`;
}

// Top `limit` names by best mark (one row per name, from the leaderboard view).
// null when Supabase fails; the detail goes only to the server console.
export const getLeaderboard = cache(
  async (gameId: string, limit = 10): Promise<ScoreRow[] | null> => {
    try {
      const { data, error } = await createPublicClient()
        .from("leaderboard")
        .select("name, score, created_at")
        .eq("game_id", gameId)
        .order("score", { ascending: false })
        .order("created_at", { ascending: true })
        .order("name", { ascending: true })
        .limit(limit);
      if (error) throw error;

      return data.map((row, i) => ({
        rank: i + 1,
        name: row.name ?? "",
        score: row.score ?? 0,
        date: row.created_at ? formatDate(row.created_at) : "",
      }));
    } catch (err) {
      console.error("[leaderboard] getLeaderboard failed", gameId, err);
      return null;
    }
  },
);

// best = highest score, plays = saved scores (one request: top row + exact count).
export const getGameStats = cache(async (gameId: string): Promise<GameStats | null> => {
  try {
    const { data, count, error } = await createPublicClient()
      .from("scores")
      .select("score", { count: "exact" })
      .eq("game_id", gameId)
      .order("score", { ascending: false })
      .limit(1);
    if (error) throw error;

    return { best: data[0]?.score ?? 0, plays: count ?? 0 };
  } catch (err) {
    console.error("[leaderboard] getGameStats failed", gameId, err);
    return null;
  }
});
