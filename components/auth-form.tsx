"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useSession } from "@/components/session-provider";

type Mode = "in" | "up";

const TAB =
  "min-h-11 p-3 font-pixel text-[9px] tracking-[0.14em]";
const TAB_ON =
  "bg-[rgba(0,245,255,0.08)] text-cyan [text-shadow:0_0_6px_rgba(0,245,255,0.5)]";
const TAB_OFF = "text-ink-dim";

// Inert for now: visibly disabled instead of a focusable button that does nothing.
const SOCIAL =
  "btn ghost p-3 text-[9px] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-ink-faint disabled:hover:text-ink-dim disabled:active:transform-none";

export function AuthForm() {
  const router = useRouter();
  const { signIn, signOut } = useSession();
  const [mode, setMode] = useState<Mode>("in");

  // Fields are uncontrolled: they're only read on submit, so typing re-renders nothing.
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    signIn(String(data.get("usuario") ?? ""));
    router.push("/biblioteca");
  };

  const playAsGuest = () => {
    signOut();
    router.push("/biblioteca");
  };

  return (
    <div className="fade-in flex items-center justify-center px-5 py-[60px]">
      <div className="relative w-[min(440px,100%)] border border-line bg-bg-2 p-7 shadow-[0_0_30px_rgba(0,245,255,0.18)] before:pointer-events-none before:absolute before:inset-1 before:border before:border-dashed before:border-[rgba(0,245,255,0.18)]">
        <div className="mb-[18px] text-center">
          <div
            aria-hidden="true"
            className="mx-auto mb-3 size-14 border border-white/[0.18] bg-[image:linear-gradient(45deg,var(--magenta)_0_50%,transparent_50%),linear-gradient(-45deg,var(--cyan)_0_50%,transparent_50%)] bg-blend-screen shadow-[0_0_16px_rgba(0,245,255,0.55),inset_0_0_8px_rgba(255,0,110,0.5)]"
          />
          <h1 className="neon-cyan mt-1 font-pixel text-[16px] tracking-[0.1em]">
            ARCADE VAULT
          </h1>
          <div className="mt-1.5 font-mono text-[11px] tracking-[0.16em] text-ink-faint">
            ACCESO AL SISTEMA · v2.6
          </div>
        </div>

        <div
          role="group"
          aria-label="Modo de acceso"
          className="my-[18px] grid grid-cols-2 border border-line"
        >
          <button
            type="button"
            aria-pressed={mode === "in"}
            className={`${TAB} ${mode === "in" ? TAB_ON : TAB_OFF}`}
            onClick={() => setMode("in")}
          >
            INICIAR SESIÓN
          </button>
          <button
            type="button"
            aria-pressed={mode === "up"}
            className={`${TAB} ${mode === "up" ? TAB_ON : TAB_OFF}`}
            onClick={() => setMode("up")}
          >
            CREAR CUENTA
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="auth-user">Usuario</label>
            <input
              id="auth-user"
              name="usuario"
              type="text"
              autoComplete="username"
              placeholder="px_kai"
            />
          </div>
          {mode === "up" && (
            <div className="field slide-in">
              <label htmlFor="auth-email">Correo electrónico</label>
              <input
                id="auth-email"
                name="correo"
                type="email"
                autoComplete="email"
                placeholder="jugador@vault.gg"
              />
            </div>
          )}
          <div className="field">
            <label htmlFor="auth-pass">Contraseña</label>
            <input
              id="auth-pass"
              name="contrasena"
              type="password"
              autoComplete={mode === "in" ? "current-password" : "new-password"}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn lg mt-2 w-full">
            {mode === "in" ? "ENTRAR AL VAULT" : "CREAR Y JUGAR"}
          </button>
        </form>

        <button
          type="button"
          className="btn ghost mt-2.5 w-full"
          onClick={playAsGuest}
        >
          JUGAR COMO INVITADO
        </button>

        <div className="my-4 flex items-center gap-3 font-pixel text-[8px] tracking-[0.16em] text-ink-faint before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">
          O CONTINÚA CON
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <button type="button" disabled title="Próximamente" className={SOCIAL}>
            ◆ GOOGLE
          </button>
          <button type="button" disabled title="Próximamente" className={SOCIAL}>
            ▣ GITHUB
          </button>
        </div>

        <div className="mt-[18px] text-center text-[11px] tracking-[0.1em] text-ink-faint">
          AL ENTRAR ACEPTAS LOS TÉRMINOS DEL SALÓN ARCADE
        </div>
      </div>
    </div>
  );
}
