import Link from "next/link";
import { SectionHead } from "@/components/section-head";

// The first answer is the one that matters: no game is playable yet.
const FAQ = [
  {
    question: "¿YA PUEDO JUGAR?",
    answer:
      "Todavía no. Hoy Arcade Vault muestra el catálogo, la ficha de cada juego y las tablas de puntuación; los juegos jugables llegan en próximas versiones.",
    accent: "border-l-cyan",
  },
  {
    question: "¿REALMENTE ES GRATIS?",
    answer:
      "Sí. No hay planes de pago, ni versión premium escondida, ni compras dentro de los juegos.",
    accent: "border-l-magenta",
  },
  {
    question: "¿NECESITO CREAR UNA CUENTA?",
    answer:
      "No. Puedes seguir como invitado o entrar con cualquier nombre: el acceso es de demostración y tus marcas se guardan solo en este navegador.",
    accent: "border-l-yellow",
  },
];

export function HomeClosing() {
  return (
    <section
      aria-labelledby="cierre-title"
      data-reveal
      className="mx-auto mt-16 mb-16 max-w-[1320px] px-4 min-[721px]:mt-24 min-[721px]:mb-24 min-[721px]:px-8"
    >
      <SectionHead
        id="cierre-title"
        kicker="ANTES DE EMPEZAR"
        title="CLARO Y SIN TRUCOS"
        color="green"
      />
      <div className="grid gap-6 min-[901px]:grid-cols-2">
        <dl className="flex flex-col justify-center gap-3.5">
          {FAQ.map(({ question, answer, accent }) => (
            <div
              key={question}
              className={`border border-l-[3px] border-line bg-bg-2 px-5 py-[18px] ${accent}`}
            >
              <dt className="mb-2 font-pixel text-[10px] leading-[1.5] tracking-[0.12em] text-ink">
                {question}
              </dt>
              <dd className="text-[13px] leading-[1.6] text-ink-dim">{answer}</dd>
            </div>
          ))}
        </dl>

        <div className="relative flex flex-col justify-center gap-3.5 border border-green bg-[image:linear-gradient(180deg,var(--bg-2),#0a0e16)] px-4 py-8 shadow-[0_0_28px_rgba(0,255,136,0.18),inset_0_0_14px_rgba(0,255,136,0.08)] before:pointer-events-none before:absolute before:inset-1 before:border before:border-dashed before:border-green/30 min-[721px]:px-7">
          <p className="font-pixel text-[9px] leading-[1.25] tracking-[0.22em] text-ink-dim">
            PLAN ÚNICO
          </p>
          <p className="flex flex-wrap items-baseline gap-x-2.5">
            <span className="bg-[image:linear-gradient(180deg,#fff,var(--green))] bg-clip-text font-pixel text-[64px] leading-[1.1] tracking-[0.02em] text-transparent drop-shadow-[0_0_12px_rgba(0,255,136,0.5)]">
              $0
            </span>
            <span className="font-pixel text-[11px] tracking-[0.16em] text-ink-dim">
              / SIEMPRE
            </span>
          </p>
          {/* tighter padding and tracking below 721px so the label stays on one line */}
          <Link
            href="/biblioteca"
            className="btn lg pulse mt-2 w-full px-4 tracking-[0.12em] min-[721px]:px-7 min-[721px]:tracking-[0.16em]"
          >
            INSERTAR MONEDA <span aria-hidden="true">→</span>
          </Link>
          <p className="text-center text-[12px] tracking-[0.06em] text-ink-faint min-[721px]:tracking-[0.1em]">
            No pedimos tarjeta. Nunca lo haremos.
          </p>
          <div
            aria-hidden="true"
            className="absolute -top-4 right-2 z-[3] rotate-[14deg] border-2 border-magenta bg-bg/85 px-[18px] py-2.5 text-center font-pixel text-[13px] leading-[1.15] tracking-[0.16em] text-magenta shadow-[0_0_14px_rgba(255,0,110,0.35),inset_0_0_8px_rgba(255,0,110,0.2)] [text-shadow:0_0_8px_rgba(255,0,110,0.6)] min-[721px]:-top-[18px] min-[721px]:-right-[18px]"
          >
            <span className="block">FREE</span>
            <span className="block">PLAY</span>
          </div>
        </div>
      </div>
    </section>
  );
}
