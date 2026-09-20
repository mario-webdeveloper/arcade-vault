"use client";

import type { ReactNode, Ref } from "react";
import type { ContactTopic } from "@/lib/contact";

type Props =
  | {
      mode: "success";
      ref?: Ref<HTMLDivElement>;
      tema: ContactTopic;
      nombre: string;
      correo: string;
      /** First 8 chars of Resend's id; null when the honeypot answered (nothing was sent). */
      mailRef: string | null;
    }
  | {
      mode: "failure";
      ref?: Ref<HTMLDivElement>;
      tema: ContactTopic;
      reason: "config" | "delivery";
      /** Public address to fall back on, when the project set one. */
      publicEmail?: string;
    };

const OK = <span className="text-green">[OK]</span>;

function Line({ children }: { children: ReactNode }) {
  return <p className="break-words">{children}</p>;
}

/**
 * VAULT-OS terminal: the real report of a send, not a canned animation. It only prints
 * what happened. Success is a `status`, failure an `alert`; both take the focus (the
 * form's effect focuses `ref`). Failure colour is never the only signal: `[FALLO]` leads.
 */
export function ContactTerminal(props: Props) {
  const { ref, tema } = props;
  const success = props.mode === "success";

  return (
    <div
      ref={ref}
      role={success ? "status" : "alert"}
      tabIndex={-1}
      className="border border-green bg-black font-mono shadow-[0_0_22px_rgba(0,255,136,0.25)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
    >
      <div
        aria-hidden="true"
        className="flex items-center gap-2 border-b border-green/40 bg-bg px-3 py-2"
      >
        <span className="size-2.5 rounded-full bg-[#ff5f56]" />
        <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="size-2.5 rounded-full bg-[#27c93f]" />
        <span className="ml-2 font-pixel text-[9px] tracking-[0.14em] text-ink-faint">
          VAULT-OS
        </span>
      </div>
      <div className="px-4 py-4 text-[13px] leading-[1.8] text-ink-dim min-[721px]:px-[18px] min-[721px]:pb-5">
        <Line>
          <span className="text-cyan">vault@arcade:~$</span> ./send_message --tema={tema}
        </Line>
        <Line>{OK} Validación: 4 campos correctos</Line>

        {props.mode === "success" ? (
          <>
            {props.mailRef ? (
              <Line>
                {OK} Aviso entregado al equipo · ref {props.mailRef}
              </Line>
            ) : null}
            {/* "en cola", not "enviado": after() can't tell us how it ended */}
            <Line>
              <span className="text-yellow">[..]</span> Acuse de recibo en cola para{" "}
              {props.correo}
            </Line>
            <p className="mt-3 break-words font-bold text-green [text-shadow:0_0_6px_rgba(0,255,136,0.45)]">
              {"> "}MENSAJE RECIBIDO. GRACIAS, {props.nombre.toUpperCase()}.
              <span aria-hidden="true" className="blink">
                _
              </span>
            </p>
          </>
        ) : (
          <>
            <Line>
              <span className="font-bold text-magenta">[FALLO]</span> No se pudo entregar el
              aviso
            </Line>
            <p className="mt-3 break-words font-bold text-magenta [text-shadow:0_0_6px_rgba(255,0,110,0.45)]">
              {"> "}
              {props.reason === "config"
                ? "EL ENVÍO NO ESTÁ DISPONIBLE AHORA MISMO. TU MENSAJE SIGUE EN EL FORMULARIO."
                : "TU MENSAJE SIGUE EN EL FORMULARIO. REINTENTA EN UN MOMENTO."}
              {props.publicEmail ? (
                <>
                  {" ESCRIBE A "}
                  <a
                    href={`mailto:${props.publicEmail}`}
                    className="font-normal normal-case underline underline-offset-2"
                  >
                    {props.publicEmail}
                  </a>
                  .
                </>
              ) : null}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
