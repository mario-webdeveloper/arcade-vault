"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "@/components/session-provider";

// Active state is derived from the URL: Inicio is only "/", Biblioteca also owns /juego/*.
const NAV_LINKS = [
  {
    href: "/",
    label: "Inicio",
    isActive: (path: string) => path === "/",
  },
  {
    href: "/biblioteca",
    label: "Biblioteca",
    isActive: (path: string) =>
      path === "/biblioteca" || path.startsWith("/juego/"),
  },
  {
    href: "/salon",
    label: "Salón de la Fama",
    isActive: (path: string) => path === "/salon",
  },
] as const;

const LINK_BASE =
  "relative px-3.5 py-2.5 font-pixel text-[9px] tracking-[0.16em] transition-colors duration-[120ms]";
const LINK_ACTIVE =
  "text-cyan [text-shadow:0_0_8px_rgba(0,245,255,0.65)] after:absolute after:inset-x-3.5 after:bottom-1 after:h-0.5 after:bg-cyan after:shadow-[0_0_8px_var(--cyan),0_0_16px_var(--cyan)]";
const LINK_IDLE = "text-ink-dim hover:text-ink";

// Full bar needs ~1195px (1179px of content + scrollbar) for logo + 3 links +
// credits + session button without wrapping; below 1200px it collapses to
// logo + session button + hamburger.
const AUTH_BTN = "btn px-3 min-[1200px]:ml-4 min-[1200px]:px-5";
const AUTH_BTN_GHOST = `${AUTH_BTN} ghost`;

const PANEL_LINK =
  "border-b border-dashed border-line-2 px-3 py-3.5 font-pixel text-[11px]";

export function SiteNav() {
  const pathname = usePathname();
  const { user, signOut } = useSession();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const close = () => setOpen(false);
  const authActive = pathname === "/acceso";

  return (
    <>
      <nav
        aria-label="Principal"
        className="sticky top-0 z-50 flex items-center gap-3 border-b border-line bg-[image:linear-gradient(180deg,rgba(10,10,15,0.92),rgba(10,10,15,0.78))] px-4 py-3 backdrop-blur-sm min-[1200px]:gap-6 min-[1200px]:px-8 min-[1200px]:py-3.5"
      >
        <Link href="/" className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="size-7 border border-white/[0.18] bg-[image:linear-gradient(45deg,var(--magenta)_0_50%,transparent_50%),linear-gradient(-45deg,var(--cyan)_0_50%,transparent_50%)] bg-blend-screen shadow-[0_0_12px_rgba(0,245,255,0.55),inset_0_0_6px_rgba(255,0,110,0.5)]"
          />
          <span className="neon-cyan font-pixel text-[12px] tracking-[0.12em]">
            ARCADE <span className="neon-magenta">VAULT</span>
          </span>
        </Link>

        <div className="ml-8 hidden gap-1 min-[1200px]:flex">
          {NAV_LINKS.map(({ href, label, isActive }) => {
            const active = isActive(pathname);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`${LINK_BASE} ${active ? LINK_ACTIVE : LINK_IDLE}`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="flex-1" />

        {/* decorative: there is no credit economy yet */}
        <div className="hidden items-center gap-2 font-pixel text-[9px] text-yellow min-[1200px]:flex">
          <span
            aria-hidden="true"
            className="size-3.5 rounded-full bg-[image:radial-gradient(circle_at_35%_35%,#fff8b0,#f5ff00_60%,#b0b800)] shadow-[0_0_8px_var(--yellow)]"
          />
          <span>CRÉDITOS · 03</span>
        </div>

        {user ? (
          <button
            type="button"
            className={AUTH_BTN_GHOST}
            onClick={signOut}
            aria-label={`${user.name}, cerrar sesión`}
          >
            {user.name} ▾
          </button>
        ) : (
          <Link href="/acceso" className={AUTH_BTN}>
            Iniciar Sesión
          </Link>
        )}

        <button
          type="button"
          className="btn ghost min-w-11 px-3 min-[1200px]:hidden"
          aria-label="Menú"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(true)}
        >
          ≡
        </button>
      </nav>

      <div
        aria-hidden="true"
        onClick={close}
        className={`fixed inset-0 z-[55] bg-black/60 transition-opacity duration-[180ms] motion-reduce:transition-none min-[1200px]:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        id="mobile-menu"
        aria-label="Menú móvil"
        inert={!open}
        className={`fixed inset-y-0 right-0 z-[60] flex w-[min(320px,86vw)] flex-col gap-2 border-l border-line bg-bg-2 px-5 py-6 transition-transform duration-[220ms] ease-in-out motion-reduce:transition-none min-[1200px]:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="pixel neon-cyan mb-4 text-[11px]">MENÚ</div>
        {NAV_LINKS.map(({ href, label, isActive }) => (
          <Link
            key={href}
            href={href}
            onClick={close}
            aria-current={isActive(pathname) ? "page" : undefined}
            className={`${PANEL_LINK} ${isActive(pathname) ? "text-cyan" : "text-ink-dim"}`}
          >
            {label}
          </Link>
        ))}
        <Link
          href="/acceso"
          onClick={close}
          aria-current={authActive ? "page" : undefined}
          className={`${PANEL_LINK} ${authActive ? "text-cyan" : "text-ink-dim"}`}
        >
          {user ? "Cuenta" : "Iniciar Sesión"}
        </Link>
        <div className="mt-auto font-pixel text-[9px] tracking-[0.16em] text-ink-faint">
          CRÉDITOS · 03
        </div>
      </aside>
    </>
  );
}
