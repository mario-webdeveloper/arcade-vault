"use client";

import Link from "next/link";
import { useSession } from "@/components/session-provider";

const CTA = "btn lg w-full min-[561px]:w-auto";

/**
 * The second button follows the session, same pattern as `site-nav`: the
 * session is read after mount, so the server always renders the signed-out state.
 */
export function HomeHeroCtas() {
  const { user } = useSession();

  return (
    <div className="flex flex-col gap-3 min-[561px]:flex-row min-[561px]:flex-wrap min-[561px]:gap-4">
      <Link href="/biblioteca" className={`${CTA} pulse`}>
        <span aria-hidden="true">▶</span> EXPLORAR JUEGOS
      </Link>
      {user ? (
        <Link href="/salon" className={`${CTA} magenta`}>
          SALÓN DE LA FAMA
        </Link>
      ) : (
        <Link href="/acceso" className={`${CTA} magenta`}>
          <span aria-hidden="true">✦</span> CREAR CUENTA
        </Link>
      )}
    </div>
  );
}
