import { ContactForm } from "@/components/contact-form";
import { PixelIcon } from "@/components/pixel-icon";
import { SectionHead } from "@/components/section-head";

// Each line is something the code actually does (see lib/contact-action.ts and
// lib/mailer.ts). Nothing here promises a reply time or a "no spam" pledge.
const EXPECTATIONS = [
  { text: "TE LLEGA UN ACUSE DE RECIBO", led: "bg-green shadow-[0_0_6px_var(--green)]" },
  {
    text: "TU CORREO SOLO SE USA PARA RESPONDERTE",
    led: "bg-yellow shadow-[0_0_6px_var(--yellow)]",
  },
  { text: "NO HAY LISTA DE CORREO", led: "bg-magenta shadow-[0_0_6px_var(--magenta)]" },
];

/** "Contacto": intro + expectations on the left, the form on the right (below the intro under 900px). */
export function ContactSection() {
  // Read at build: /acerca is static, so changing it needs a rebuild. Optional on purpose:
  // showing the project mailbox in the HTML exposes it to scrapers.
  const publicEmail = process.env.CONTACT_PUBLIC_EMAIL?.trim() || undefined;

  return (
    <section
      id="contacto"
      aria-labelledby="contacto-title"
      data-reveal
      className="mx-auto mt-16 mb-20 max-w-[1320px] scroll-mt-24 px-4 min-[721px]:mt-24 min-[721px]:mb-28 min-[721px]:px-8"
    >
      <SectionHead id="contacto-title" kicker="CONTACTO" title="ESCRÍBENOS" color="green" />
      <div className="grid grid-cols-1 gap-8 min-[901px]:grid-cols-[1fr_1.2fr] min-[901px]:gap-10">
        <div className="min-w-0">
          <p className="max-w-[460px] text-[15px] leading-[1.7] tracking-[0.02em] text-ink-dim">
            Una sugerencia, un juego que te gustaría ver, un fallo que encontraste o solo un
            saludo.
          </p>
          <ul className="mt-6 flex flex-col gap-3">
            {EXPECTATIONS.map(({ text, led }) => (
              <li
                key={text}
                className="flex items-center gap-3 font-pixel text-[9px] leading-[1.6] tracking-[0.14em] text-ink-dim"
              >
                <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${led}`} />
                {text}
              </li>
            ))}
          </ul>
          {publicEmail ? (
            <p className="mt-6 flex flex-wrap items-center gap-x-2 text-[13px] text-ink-dim">
              <span aria-hidden="true" className="text-cyan [&>svg]:size-5">
                <PixelIcon kind="sobre" />
              </span>
              También puedes escribir a{" "}
              <a
                href={`mailto:${publicEmail}`}
                className="inline-flex min-h-11 items-center text-cyan underline underline-offset-4"
              >
                {publicEmail}
              </a>
            </p>
          ) : null}
          <noscript>
            <p className="mt-6 border border-dashed border-line p-4 text-[13px] leading-[1.6] text-ink-dim">
              ¿Sin JavaScript? Si el formulario no responde,{" "}
              {publicEmail ? (
                <>
                  escríbenos a{" "}
                  <a href={`mailto:${publicEmail}`} className="text-cyan underline">
                    {publicEmail}
                  </a>
                  .
                </>
              ) : (
                "actívalo e inténtalo de nuevo."
              )}
            </p>
          </noscript>
        </div>
        <div className="min-w-0">
          <ContactForm publicEmail={publicEmail} />
        </div>
      </div>
    </section>
  );
}
