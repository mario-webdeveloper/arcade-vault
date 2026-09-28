"use server";

import { revalidatePath } from "next/cache";
import { NAME_MAX } from "@/lib/session";
import { createPublicClient } from "@/lib/supabase/public";

export type SubmitResult = { ok: true; rank: number } | { ok: false };

// Pages that show the real asteroides ranking or stats (all ISR).
const AFFECTED_PATHS = ["/juego/asteroides", "/salon", "/biblioteca"];

// Stores a score through the submit_score RPC, which validates again in the
// database (game, name, 0..max_score). Failure details only go to the console.
export async function submitScore(input: {
  game: string;
  name: string;
  score: number;
}): Promise<SubmitResult> {
  const game = typeof input?.game === "string" ? input.game : "";
  const name = typeof input?.name === "string" ? input.name.trim() : "";
  const score = input?.score;
  if (!game || name.length < 1 || name.length > NAME_MAX || !Number.isSafeInteger(score) || score < 0) {
    return { ok: false };
  }

  try {
    const { data, error } = await createPublicClient().rpc("submit_score", {
      p_game: game,
      p_name: name,
      p_score: score,
    });
    if (error) throw error;

    AFFECTED_PATHS.forEach((path) => revalidatePath(path));
    return { ok: true, rank: data };
  } catch (err) {
    console.error("[score] submitScore failed", game, err);
    return { ok: false };
  }
}
