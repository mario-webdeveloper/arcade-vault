import Link from "next/link";

export default function NotFound() {
  return (
    <div className="fade-in mx-auto flex min-h-[60vh] max-w-[720px] flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <h1 className="pixel flicker neon-magenta text-[length:clamp(20px,4vw,40px)]">
        GAME OVER · <span className="neon-cyan">404</span>
      </h1>
      <p className="text-sm leading-[1.7] text-ink-dim">
        Ese juego no está en el vault. Puede que el cartucho se haya perdido o
        que la dirección esté mal.
      </p>
      <Link href="/biblioteca" className="btn lg">
        VOLVER AL VAULT
      </Link>
    </div>
  );
}
