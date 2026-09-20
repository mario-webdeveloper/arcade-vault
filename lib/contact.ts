// Shared by the client (early feedback on blur) and the server (the real check).
// No directive on purpose: both sides import it.

export const TOPICS = [
  { id: "sugerencia", label: "Sugerencia", subject: "Sugerencia" },
  { id: "juego", label: "Proponer un juego", subject: "Propuesta de juego" },
  { id: "fallo", label: "Reportar un fallo", subject: "Reporte de fallo" },
  { id: "saludo", label: "Saludar", subject: "Saludo" },
] as const;

export type ContactTopic = (typeof TOPICS)[number]["id"];

export const LIMITS = {
  nombre: { min: 2, max: 40 },
  correo: { max: 254 },
  mensaje: { min: 10, max: 2000, warnAt: 1800 },
} as const;

export type ContactField = "nombre" | "correo" | "tema" | "mensaje";
export type ContactValues = Record<ContactField, string>;
export type ContactErrors = Partial<Record<ContactField, string>>;

export type ContactState =
  | { status: "idle" | "invalid"; values: ContactValues; errors: ContactErrors }
  | {
      status: "failed";
      values: ContactValues;
      errors: ContactErrors;
      reason: "config" | "delivery";
    }
  | {
      status: "sent";
      nombre: string;
      correo: string;
      tema: ContactTopic;
      ref: string | null;
    };

export const INITIAL_VALUES: ContactValues = {
  nombre: "",
  correo: "",
  tema: TOPICS[0].id,
  mensaje: "",
};

export const INITIAL_STATE: ContactState = {
  status: "idle",
  values: INITIAL_VALUES,
  errors: {},
};

// A CR or LF in a header-bound field (subject, reply_to) is header injection.
const LINE_BREAK = /[\r\n]/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};

  const nombre = values.nombre.trim();
  if (LINE_BREAK.test(values.nombre)) {
    errors.nombre = "El nombre no puede tener saltos de línea.";
  } else if (nombre.length < LIMITS.nombre.min || nombre.length > LIMITS.nombre.max) {
    errors.nombre = `Escribe tu nombre (entre ${LIMITS.nombre.min} y ${LIMITS.nombre.max} caracteres).`;
  }

  const correo = values.correo.trim();
  if (LINE_BREAK.test(values.correo)) {
    errors.correo = "El correo no puede tener saltos de línea.";
  } else if (correo.length > LIMITS.correo.max || !EMAIL.test(correo)) {
    errors.correo = "Escribe un correo válido, por ejemplo jugador@vault.gg.";
  }

  // Closed list: anything else (including CR/LF) is not a topic.
  if (!TOPICS.some((t) => t.id === values.tema)) {
    errors.tema = "Elige un tema.";
  }

  // Length is checked on the raw value so it matches the character counter.
  if (values.mensaje.trim().length < LIMITS.mensaje.min) {
    errors.mensaje = `Escribe al menos ${LIMITS.mensaje.min} caracteres.`;
  } else if (values.mensaje.length > LIMITS.mensaje.max) {
    errors.mensaje = `El mensaje supera los ${LIMITS.mensaje.max} caracteres.`;
  }

  return errors;
}
