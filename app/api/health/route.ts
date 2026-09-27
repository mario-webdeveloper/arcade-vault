import { connection } from "next/server";
import { createClient, readSupabaseEnv } from "@/lib/supabase/server";

type Health =
  | { ok: true; latencyMs: number }
  | { ok: false; reason: "config" | "unreachable" };

const TIMEOUT_MS = 5000;

// Public endpoint: the body only carries ok / latencyMs / reason. URLs, keys
// and error messages go to the server console, never to the response.
function reply(body: Health, status: number) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET() {
  // Always answer at request time, never from a build-time prerender.
  await connection();

  const env = readSupabaseEnv();
  if (!env) return reply({ ok: false, reason: "config" }, 503);

  try {
    // Building the server client proves the wiring (env + cookies + types).
    await createClient();

    const started = performance.now();
    const res = await fetch(`${env.url}/auth/v1/health`, {
      headers: { apikey: env.key },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const latencyMs = Math.round(performance.now() - started);

    if (!res.ok) {
      console.error(`[health] Supabase auth health answered ${res.status}`);
      return reply({ ok: false, reason: "unreachable" }, 503);
    }
    return reply({ ok: true, latencyMs }, 200);
  } catch (error) {
    console.error("[health] Supabase unreachable:", error);
    return reply({ ok: false, reason: "unreachable" }, 503);
  }
}
