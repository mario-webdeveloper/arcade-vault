"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_NAME,
  NAME_MAX,
  appendStoredScore,
  readStoredUser,
  writeStoredUser,
  type SavedScore,
  type SessionUser,
} from "@/lib/session";

type SessionContextValue = {
  user: SessionUser | null;
  signIn: (name: string) => void;
  signOut: () => void;
  saveScore: (entry: Omit<SavedScore, "at">) => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  // Server and first client render both see "signed out"; storage is read after
  // mount so hydration always matches.
  const [user, setUser] = useState<SessionUser | null>(null);
  // Fallback when localStorage is unavailable: scores live in memory only.
  const memoryScores = useRef<SavedScore[]>([]);

  useEffect(() => {
    // Reading localStorage is only possible after mount; the extra render is
    // intentional (see comment above), so the cascading-render rule is waived.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(readStoredUser());
  }, []);

  const signIn = useCallback((name: string) => {
    const next: SessionUser = {
      name: name.trim().toUpperCase().slice(0, NAME_MAX) || DEFAULT_NAME,
    };
    setUser(next);
    writeStoredUser(next);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    writeStoredUser(null);
  }, []);

  const saveScore = useCallback((entry: Omit<SavedScore, "at">) => {
    const saved: SavedScore = { ...entry, at: Date.now() };
    if (!appendStoredScore(saved)) memoryScores.current.push(saved);
  }, []);

  const value = useMemo(
    () => ({ user, signIn, signOut, saveScore }),
    [user, signIn, signOut, saveScore],
  );

  return <SessionContext value={value}>{children}</SessionContext>;
}
