export type SessionUser = { name: string };
export type SavedScore = {
  game: string;
  score: number;
  name: string;
  at: number;
};

export const USER_KEY = "av:user:v1";
export const SCORES_KEY = "av:scores:v1";

export const NAME_MAX = 10;
export const DEFAULT_NAME = "PLAYER1";

// Every localStorage access is wrapped: private mode, quota or a blocked
// storage must never break the app (session/scores then live in memory only).

export function readStoredUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed !== null &&
      typeof parsed === "object" &&
      "name" in parsed &&
      typeof parsed.name === "string" &&
      parsed.name !== ""
    ) {
      return { name: parsed.name };
    }
  } catch {
    // unavailable storage or corrupt JSON: behave as signed out
  }
  return null;
}

export function writeStoredUser(user: SessionUser | null): void {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {
    // keep the in-memory session
  }
}

/** Returns false when the score could not be persisted. */
export function appendStoredScore(entry: SavedScore): boolean {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    const all = Array.isArray(parsed) ? parsed : [];
    all.push(entry);
    localStorage.setItem(SCORES_KEY, JSON.stringify(all));
    return true;
  } catch {
    return false;
  }
}
