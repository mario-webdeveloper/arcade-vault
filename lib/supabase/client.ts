import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";

// Read inside the function, never at module scope: a missing key must not
// break the import of this module (or the build). NEXT_PUBLIC_* are inlined
// into the browser bundle at build time.
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) throw new Error("Supabase env vars are missing");

  return createBrowserClient<Database>(url, key);
}
