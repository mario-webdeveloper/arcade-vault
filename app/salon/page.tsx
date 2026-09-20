import Link from "next/link";
import { HallOfFame } from "@/components/hall-of-fame";

export default function HallPage() {
  return (
    <div className="fade-in mx-auto mt-8 mb-20 max-w-[1200px] px-4 min-[721px]:px-8">
      <header className="mb-7 text-center">
        <h1 className="bg-[image:linear-gradient(180deg,var(--yellow),var(--magenta))] bg-clip-text font-pixel text-[length:clamp(24px,4.5vw,44px)] tracking-[0.08em] text-transparent drop-shadow-[0_0_14px_rgba(245,255,0,0.4)]">
          SALÓN DE LA FAMA
        </h1>
        <p className="mt-3 font-pixel text-[10px] uppercase leading-[1.25] tracking-[0.1em] text-ink-dim">
          LOS NOMBRES QUE NUNCA SE BORRAN DE LA PANTALLA
        </p>
      </header>

      <HallOfFame />

      <div className="mt-8 text-center">
        <Link href="/biblioteca" className="btn lg">
          VOLVER A LA BIBLIOTECA
        </Link>
      </div>
    </div>
  );
}
