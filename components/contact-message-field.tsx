"use client";

import { useState } from "react";
import { LIMITS } from "@/lib/contact";

const ERROR_ID = "contacto-mensaje-error";

/**
 * Message textarea + character counter. The count lives here, so typing repaints only
 * this field and never the rest of the form. There is no `maxLength`: pasting a long
 * text must not be cut silently; the counter turns magenta and the error shows on blur.
 * Blur/input validation is handled by the form (events bubble), not by props.
 */
export function ContactMessageField({
  defaultValue,
  error,
}: {
  defaultValue: string;
  error?: string;
}) {
  const [count, setCount] = useState(defaultValue.length);
  const warn = count >= LIMITS.mensaje.warnAt;
  const over = count > LIMITS.mensaje.max;

  return (
    <div className="field">
      <label htmlFor="contacto-mensaje">Mensaje</label>
      <textarea
        id="contacto-mensaje"
        name="mensaje"
        rows={6}
        autoComplete="off"
        aria-required="true"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? ERROR_ID : undefined}
        defaultValue={defaultValue}
        onChange={(event) => setCount(event.currentTarget.value.length)}
      />
      <div className="flex items-start justify-between gap-3">
        {error ? (
          <p id={ERROR_ID} className="text-[12px] leading-[1.5] text-magenta">
            {error}
          </p>
        ) : null}
        {/* Quiet (aria-hidden) until it matters; from warnAt it is announced as a status. */}
        <p
          role={warn ? "status" : undefined}
          aria-hidden={warn ? undefined : true}
          className={`ml-auto shrink-0 font-mono text-[11px] tracking-[0.06em] ${
            warn ? "text-magenta" : "text-ink-faint"
          } ${over ? "font-bold" : ""}`}
        >
          {count} / {LIMITS.mensaje.max}
        </p>
      </div>
    </div>
  );
}
