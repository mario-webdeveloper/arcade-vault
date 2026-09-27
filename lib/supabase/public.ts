import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { readSupabaseEnv } from "@/lib/supabase/server";

// Read-only client for prerendered (ISR) pages. No cookies(): the cookie-based
// client in server.ts would turn every route that uses it dynamic.
export function createPublicClient() {
  const env = readSupabaseEnv();
  if (!env) throw new Error("Supabase env vars are missing");

  return createClient<Database>(env.url, env.key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      // Same 5 s budget as /api/health, so a slow Supabase can't stall a build.
      fetch: (input, init) =>
        fetch(input, { ...init, signal: init?.signal ?? AbortSignal.timeout(5000) }),
    },
  });
}
